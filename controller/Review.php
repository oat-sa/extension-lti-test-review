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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoReview\controller;

use common_exception_Error;
use oat\generis\model\OntologyAwareTrait;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\taoDelivery\model\execution\OntologyDeliveryExecution;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoLti\models\classes\LtiException;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiService;
use oat\taoLti\models\classes\LtiVariableMissingException;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTestPreviewer\models\ItemPreviewer;
use oat\taoResultServer\models\classes\ResultServerService;
use oat\taoReview\models\QtiRunnerInitDataBuilder;
use oat\taoReview\models\QtiRunnerMapBuilderFactory;
use tao_actions_SinglePageModule;

/**
 * Review controller class thar provides data for js-application
 * @package oat\taoReview\controller
 */
class Review extends tao_actions_SinglePageModule
{
    use OntologyAwareTrait;

    /**
     * @throws LtiException
     * @throws LtiVariableMissingException
     * @throws common_exception_Error
     */
    public function index()
    {
        // TODO: Move logic from controller to service with test coverage

        $launchData = LtiService::singleton()->getLtiSession()->getLaunchData();

        /** @var LtiLaunchDataService $launchDataService */
        $launchDataService = $this->getServiceLocator()->get(LtiLaunchDataService::SERVICE_ID);

        /** @var LtiResultAliasStorage $ltiResultIdStorage */
        $ltiResultIdStorage = $this->getServiceLocator()->get(LtiResultAliasStorage::SERVICE_ID);

        $resultIdentifier = !$launchData->hasVariable('lis_result_sourcedid')
            ? $launchData->getVariable('lis_result_sourcedid')
            : $launchDataService->findDeliveryExecutionFromLaunchData($launchData);

        $deliveryExecutionId = $ltiResultIdStorage->getDeliveryExecutionId($resultIdentifier);

        if ($deliveryExecutionId === null) {
            throw new LtiInvalidLaunchDataException('Wrong result ID provided');
        }

        $execution = $this->getResource($deliveryExecutionId);
        $delivery = $execution->getOnePropertyValue($this->getProperty(OntologyDeliveryExecution::PROPERTY_DELIVERY));

        if ($deliveryExecutionId !== null) {
            $data = [
                'delivery' => $delivery->getUri(),
                'execution' => $execution->getUri()
            ];
        }

        $this->composeView('delegated-view', $data ?? [], 'pages/index.tpl', 'tao');
    }

    /**
     * Provides the definition data and the state for a particular item
     */
    public function getItem()
    {
        $code = 200;

        try {
            $this->validateCsrf();

            $itemUri = $this->getRequestParameter('itemUri');
            $resultId = $this->getRequestParameter('resultId');

            $response = [
                'baseUrl' => '',
                'content' => [],
            ];

            // previewing a result
            if ($resultId) {
                if (!$this->hasRequestParameter('itemDefinition')) {
                    throw new \common_exception_MissingParameter('itemDefinition', $this->getRequestURI());
                }

                if (!$this->hasRequestParameter('deliveryUri')) {
                    throw new \common_exception_MissingParameter('deliveryUri', $this->getRequestURI());
                }

                $itemDefinition = $this->getRequestParameter('itemDefinition');
                $delivery = new \core_kernel_classes_Resource($this->getRequestParameter('deliveryUri'));

                $itemPreviewer = new ItemPreviewer();
                $itemPreviewer->setServiceLocator($this->getServiceLocator());

                $response['content'] = $itemPreviewer->setItemDefinition($itemDefinition)
                    ->setUserLanguage($this->getUserLanguage($resultId, $delivery->getUri()))
                    ->setDelivery($delivery)
                    ->loadCompiledItemData();

                $response['baseUrl'] = $itemPreviewer->getBaseUrl();

            } else if ($itemUri) {
                // Load RESOURCE item data
                // TODO
            } else {
                throw new \common_exception_BadRequest('Either itemUri or resultId needs to be provided.');
            }

            $response['success'] = true;
        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * @param string $resultId
     * @param string $deliveryUri
     *
     * @return string
     * @throws \common_exception_Error
     */
    protected function getUserLanguage($resultId, $deliveryUri)
    {
        /** @var ResultServerService $resultServerService */
        $resultServerService = $this->getServiceLocator()->get(ResultServerService::SERVICE_ID);
        /** @var \taoResultServer_models_classes_ReadableResultStorage $implementation */
        $implementation = $resultServerService->getResultStorage($deliveryUri);

        $testTaker = new \core_kernel_users_GenerisUser(
            new \core_kernel_classes_Resource($implementation->getTestTaker($resultId))
        );
        $lang = $testTaker->getPropertyValues(\oat\generis\model\GenerisRdf::PROPERTY_USER_DEFLG);

        return empty($lang) ? DEFAULT_LANG : (string)current($lang);
    }

    public function init()
    {
        $mapBuilderFactory = new QtiRunnerMapBuilderFactory();
        $mapBuilderFactory->setServiceLocator($this->getServiceLocator());

        $dataBuilder = new QtiRunnerInitDataBuilder(
            $this->getServiceLocator()->get(DeliveryContainerService::SERVICE_ID),
            $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID),
            $mapBuilderFactory->create(),
            $this->getServiceLocator()->get(DeliveryExecutionManagerService::SERVICE_ID)
        );

        $this->returnJson($dataBuilder->build('https://taoce.loc/first.rdf#i15633615731648264'));
    }
}
