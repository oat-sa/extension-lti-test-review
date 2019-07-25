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

use common_Exception;
use common_exception_Error;
use common_exception_NotFound;
use oat\generis\model\GenerisRdf;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoLti\models\classes\LtiException;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiService;
use oat\taoLti\models\classes\LtiVariableMissingException;
use oat\taoQtiTestPreviewer\models\ItemPreviewer;
use oat\taoResultServer\models\classes\ResultServerService;
use oat\taoReview\models\DeliveryExecutionFinderService;
use oat\taoReview\models\QtiRunnerInitDataBuilderFactory;
use tao_actions_SinglePageModule;

/**
 * Review controller class thar provides data for js-application
 * @package oat\taoReview\controller
 */
class Review extends tao_actions_SinglePageModule
{
    use OntologyAwareTrait;

    /**
     * @throws InvalidServiceManagerException
     * @throws LtiException
     * @throws LtiInvalidLaunchDataException
     * @throws LtiVariableMissingException
     * @throws common_exception_Error
     * @throws common_exception_NotFound
     */
    public function index()
    {
        $launchData = LtiService::singleton()->getLtiSession()->getLaunchData();

        /** @var DeliveryExecutionFinderService $finder */
        $finder = $this->getServiceLocator()->get(DeliveryExecutionFinderService::SERVICE_ID);

        $execution = $finder->findDeliveryExecution($launchData);
        $delivery = $execution->getDelivery();

        $data = [
            'execution' => $execution->getUri(),
            'delivery'  => $delivery->getUri(),
        ];

        $this->composeView('delegated-view', $data, 'pages/index.tpl', 'tao');
    }

    public function getItems()
    {
        
    }

    /**
     * Provides the definition data and the state for a particular item
     */
    public function getItem()
    {
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

        $this->returnJson($response, $code ?? 200);
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
        $lang = $testTaker->getPropertyValues(GenerisRdf::PROPERTY_USER_DEFLG);

        return empty($lang) ? DEFAULT_LANG : (string)current($lang);
    }

    /**
     * @throws common_Exception
     * @throws InvalidServiceManagerException
     */
    public function init()
    {
        $dataBuilder = new QtiRunnerInitDataBuilderFactory();
        $dataBuilder->setServiceLocator($this->getServiceLocator());

        $this->returnJson($dataBuilder->create()->build('https://taoce.loc/first.rdf#i15633615731648264'));
    }

}
