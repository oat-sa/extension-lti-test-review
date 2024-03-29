<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019-2023 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\ltiTestReview\controller;

use common_Exception;
use common_exception_ClientException;
use common_exception_Error;
use common_exception_InconsistentData;
use common_exception_NotFound;
use common_exception_Unauthorized;
use common_ext_ExtensionsManager;
use core_kernel_users_GenerisUser;
use oat\generis\model\GenerisRdf;
use oat\generis\model\OntologyAwareTrait;
use OAT\Library\Lti1p3Core\Message\LtiMessageInterface;
use oat\ltiTestReview\models\DeliveryExecutionFinderService;
use oat\ltiTestReview\models\QtiRunnerInitDataBuilderFactory;
use oat\tao\model\http\HttpJsonResponseTrait;
use oat\tao\model\mvc\DefaultUrlService;
use oat\taoLti\models\classes\LtiClientException;
use oat\taoLti\models\classes\LtiException;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoLti\models\classes\LtiMessages\LtiErrorMessage;
use oat\taoLti\models\classes\LtiService;
use oat\taoLti\models\classes\LtiVariableMissingException;
use oat\taoLti\models\classes\TaoLtiSession;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\model\Service\ConcurringSessionService;
use oat\taoQtiTestPreviewer\models\ItemPreviewer;
use oat\taoResultServer\models\classes\ResultServerService;
use tao_actions_SinglePageModule;
use taoResultServer_models_classes_ReadableResultStorage;

/**
 * Review controller class thar provides data for js-application
 * @package oat\ltiTestReview\controller
 */
class Review extends tao_actions_SinglePageModule
{
    use OntologyAwareTrait;
    use HttpJsonResponseTrait;

    public const OPTION_REVIEW_LAYOUT = 'reviewLayout';
    public const OPTION_DISPLAY_SECTION_TITLES = 'displaySectionTitles';
    public const OPTION_DISPLAY_ITEM_TOOLTIP = 'displayItemTooltip';
    public const LTI_REVIEW_LAYOUT = 'custom_review_layout';
    public const LTI_DISPLAY_SECTION_TITLES = 'custom_section_titles';
    public const LTI_DISPLAY_ITEM_TOOLTIP = 'custom_item_tooltip';

    // keys: exposed LTI custom_review_layout params => values: internal names
    public const REVIEW_LAYOUTS_MAP = [
        'default' => 'default',
        'simple' => 'fizzy'
    ];

    /** @var TaoLtiSession */
    private $ltiSession;

    /**
     * @throws LtiException
     * @throws common_exception_Error
     */
    public function __construct()
    {
        parent::__construct();

        $this->ltiSession = LtiService::singleton()->getLtiSession();
    }

    /**
     * @throws LtiException
     * @throws LtiInvalidLaunchDataException
     * @throws LtiVariableMissingException
     * @throws common_exception_Error
     * @throws common_exception_NotFound
     * @throws common_Exception
     */
    public function index(): void
    {
        $launchData = $this->ltiSession->getLaunchData();
        $finder = $this->getDeliveryExecutionFinderService();

        if ($this->isSubmissionReviewRequestMessageProvided()) {
            $deliveryId = $this->getDeliveryId();
            $userId = $this->getUserId();
            $resourceLinkId = null;
            if ($launchData->hasVariable(LtiLaunchData::RESOURCE_LINK_ID)) {
                $resourceLinkId = $this->ltiSession->getLtiLinkResource();
            }
            $execution = $finder->findLastExecutionByUserAndDelivery($userId, $deliveryId, $resourceLinkId);

            if ($execution === null) {
                throw new LtiClientException(
                    __('Available delivery executions for review does not exists'),
                    LtiErrorMessage::ERROR_INVALID_PARAMETER
                );
            }
        } else {
            $execution = $finder->findDeliveryExecution($launchData);
        }

        $this->getConcurringSessionService()->pauseConcurrentSessions($execution);
        $this->getConcurringSessionService()->clearConcurringSession($execution);

        $delivery = $execution->getDelivery();

        $urlRouteService = $this->getDefaultUrlService();
        $this->setData('logout', $urlRouteService->getLogoutUrl());

        $data = [
            'execution' => $execution->getIdentifier(),
            'delivery' => $delivery->getUri(),
            'show-score' => (int) $finder->getShowScoreOption($launchData),
            'show-correct' => (int) $finder->getShowCorrectOption($launchData),
            'display-section-titles' => (int) $this->getDisplaySectionTitlesOption($launchData),
            'display-item-tooltip' => (int) $this->getDisplayItemTooltipOption($launchData),
            'review-layout' => $this->getReviewLayoutOption($launchData)
        ];

        $this->composeView('delegated-view', $data, 'pages/index.tpl', 'tao');
    }

    /**
     * @throws common_Exception
     */
    public function init(): void
    {
        $dataBuilder = $this->getQtiRunnerInitDataBuilderFactory();
        $params = $this->getPsrRequest()->getQueryParams();

        try {
            $data = [];
            if (!empty($params['serviceCallId'])) {
                $finder = $this->getDeliveryExecutionFinderService();
                $this->checkPermissions($params['serviceCallId']);
                $data = $dataBuilder->create()->build(
                    $params['serviceCallId'],
                    $finder->getShowScoreOption($this->ltiSession->getLaunchData())
                );
            }
            $this->returnJson($data);
        } catch (common_exception_ClientException $e) {
            $this->logError($e->getMessage());
            $this->returnJson([
                'success' => false,
                'type' => 'error',
                'message' => $e->getUserMessage()
            ]);
        }
    }

    /**
     * Provides the definition data and the state for a particular item
     *
     * @throws LtiVariableMissingException
     * @throws common_exception_InconsistentData
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_NotFound
     */
    public function getItem(): void
    {
        try {
            $params = $this->getPsrRequest()->getQueryParams();

            $deliveryExecutionId = $params['serviceCallId'];
            $itemDefinition = $params['itemUri'];

            $execution = $this->getDeliveryExecutionManagerService()->getDeliveryExecutionById($deliveryExecutionId);

            $this->checkPermissions($deliveryExecutionId);

            $itemPreviewer = new ItemPreviewer();
            $itemPreviewer->setServiceLocator($this->getServiceLocator());

            $itemPreviewer
                ->setItemDefinition($itemDefinition)
                ->setUserLanguage($this->getUserLanguage($deliveryExecutionId))
                ->setDelivery($execution->getDelivery());

            $itemData = $itemPreviewer->loadCompiledItemData();

            $finder = $this->getDeliveryExecutionFinderService();

            if (
                !empty($itemData['data']['responses'])
                && $finder->getShowCorrectOption($this->ltiSession->getLaunchData())
            ) {
                $responsesData = array_merge_recursive(...[
                    $itemData['data']['responses'],
                    $itemPreviewer->loadCompiledItemVariables()
                ]);

                // make sure the responses data are compliant to QTI definition
                $itemData['data']['responses'] = array_filter(
                    $responsesData,
                    static function (array $dataEntry): bool {
                        return array_key_exists('qtiClass', $dataEntry)
                            && array_key_exists('serial', $dataEntry)
                            && $dataEntry['qtiClass'] !== 'modalFeedback';
                    }
                );
            }

            $response['content'] = $itemData;
            $response['baseUrl'] = $itemPreviewer->getBaseUrl();
            $response['success'] = true;

            $this->returnJson($response);
        } catch (common_exception_ClientException $e) {
            $this->logError($e->getMessage());
            $this->returnJson([
                'success' => false,
                'type' => 'error',
                'message' => $e->getUserMessage()
            ]);
        }
    }

    /**
     * @throws common_exception_Error
     */
    protected function getUserLanguage(string $resultId): string
    {
        /** @var ResultServerService $resultServerService */
        $resultServerService = $this->getServiceLocator()->get(ResultServerService::SERVICE_ID);
        /** @var taoResultServer_models_classes_ReadableResultStorage $implementation */
        $implementation = $resultServerService->getResultStorage();

        $testTaker = new core_kernel_users_GenerisUser($this->getResource($implementation->getTestTaker($resultId)));
        $lang = $testTaker->getPropertyValues(GenerisRdf::PROPERTY_USER_DEFLG);

        return empty($lang) ? DEFAULT_LANG : (string) current($lang);
    }

    /**
     * @throws LtiVariableMissingException
     * @throws common_exception_NotFound
     * @throws common_exception_Unauthorized
     */
    protected function checkPermissions(string $serviceCallId): void
    {
        $execution = $this->getDeliveryExecutionManagerService()->getDeliveryExecutionById($serviceCallId);
        $userId = $this->getUserId();

        if ($execution->getUserIdentifier() !== $userId) {
            throw new common_exception_Unauthorized($serviceCallId);
        }
    }

    private function getDeliveryExecutionFinderService(): DeliveryExecutionFinderService
    {
        return $this->getPsrContainer()->get(DeliveryExecutionFinderService::SERVICE_ID);
    }

    private function getDeliveryExecutionManagerService(): DeliveryExecutionManagerService
    {
        return $this->getPsrContainer()->get(DeliveryExecutionManagerService::SERVICE_ID);
    }

    private function getDefaultUrlService(): DefaultUrlService
    {
        return $this->getPsrContainer()->get(DefaultUrlService::SERVICE_ID);
    }

    private function getQtiRunnerInitDataBuilderFactory(): QtiRunnerInitDataBuilderFactory
    {
        return $this->getPsrContainer()->get(QtiRunnerInitDataBuilderFactory::SERVICE_ID);
    }

    /**
     * @throws LtiClientException
     */
    private function getDeliveryId(): string
    {
        $deliveryId = $this->getPsrRequest()->getQueryParams()['delivery'] ?? null;
        if ($deliveryId !== null) {
            return $deliveryId;
        }

        throw new LtiClientException(__('Delivery id not provided'), LtiErrorMessage::ERROR_MISSING_PARAMETER);
    }

    /**
     * @throws LtiVariableMissingException
     */
    private function getUserId(): string
    {
        if ($this->isSubmissionReviewRequestMessageProvided()) {
            return $this->ltiSession->getLaunchData()->getLtiForUserId();
        }

        return $this->ltiSession->getUserUri();
    }

    /**
     * @throws LtiVariableMissingException
     */
    private function isSubmissionReviewRequestMessageProvided(): bool
    {
        $messageType = $this->ltiSession->getLaunchData()->getVariable(LtiLaunchData::LTI_MESSAGE_TYPE);

        return $messageType === LtiMessageInterface::LTI_MESSAGE_TYPE_SUBMISSION_REVIEW_REQUEST;
    }

    private function getReviewPanelConfig(): array
    {
        $extensionsManager = $this->getServiceLocator()->get(common_ext_ExtensionsManager::SERVICE_ID);
        $extension = $extensionsManager->getExtensionById('ltiTestReview');
        return $extension->getConfig('ReviewPanel');
    }

    private function getDisplaySectionTitlesOption(LtiLaunchData $launchData): bool
    {
        return $this->getBooleanOption(
            $launchData,
            self::OPTION_DISPLAY_SECTION_TITLES,
            self::LTI_DISPLAY_SECTION_TITLES,
            true
        );
    }

    private function getDisplayItemTooltipOption(LtiLaunchData $launchData): bool
    {
        return $this->getBooleanOption(
            $launchData,
            self::OPTION_DISPLAY_ITEM_TOOLTIP,
            self::LTI_DISPLAY_ITEM_TOOLTIP,
            false
        );
    }

    private function getBooleanOption(
        LtiLaunchData $launchData,
        string $configOptionName,
        string $ltiParamName,
        bool $defaultValue
    ): bool {
        $reviewPanelConfig = $this->getReviewPanelConfig();
        $extensionValue = $reviewPanelConfig[$configOptionName];

        $ltiParamValue = $launchData->hasVariable($ltiParamName)
            ? $launchData->getVariable($ltiParamName)
            : null;

        //priority: LTI param > extension config > default
        $optionValue = $defaultValue;
        if (isset($extensionValue)) {
            $optionValue = $extensionValue;
        }
        if (isset($ltiParamValue)) {
            $optionValue = $ltiParamValue;
        }
        return filter_var($optionValue, FILTER_VALIDATE_BOOLEAN);
    }

    private function getReviewLayoutOption(LtiLaunchData $launchData): string
    {
        $reviewPanelConfig = $this->getReviewPanelConfig();
        $extensionReviewLayout = $reviewPanelConfig[self::OPTION_REVIEW_LAYOUT];

        $ltiParamReviewLayout = $launchData->hasVariable(self::LTI_REVIEW_LAYOUT)
            ? $launchData->getVariable(self::LTI_REVIEW_LAYOUT)
            : null;

        // $reviewLayout priority: LTI param > extension config > 'default'
        $reviewLayout = 'default';
        if (!empty($extensionReviewLayout)) {
            $reviewLayout = $extensionReviewLayout;
        }
        if (!empty($ltiParamReviewLayout) && array_key_exists($ltiParamReviewLayout, self::REVIEW_LAYOUTS_MAP)) {
            $reviewLayout = self::REVIEW_LAYOUTS_MAP[$ltiParamReviewLayout];
        }
        return $reviewLayout;
    }

    private function getConcurringSessionService(): ConcurringSessionService
    {
        return $this->getPsrContainer()->get(ConcurringSessionService::class);
    }
}
