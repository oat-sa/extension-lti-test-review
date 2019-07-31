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
 */

namespace oat\taoReview\models;

use common_Exception;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ServiceManager;
use oat\taoDelivery\model\execution\OntologyService;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoOutcomeUi\model\Wrapper\ResultServiceWrapper;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\TestModelService;
use taoQtiTest_helpers_TestRunnerUtils;

class QtiRunnerInitDataBuilder
{
    use OntologyAwareTrait;

    /** @var DeliveryContainerService */
    private $deliveryContainerService;

    /** @var QtiRunnerService */
    private $qtiRunnerService;

    /** @var QtiRunnerMapBuilder */
    private $qtiRunnerMapBuilder;

    /** @var DeliveryExecutionManagerService */
    private $deliveryExecutionService;

    /** @var ResultServiceWrapper */
    private $resultService;

    public function __construct(
        DeliveryContainerService $deliveryContainerService,
        QtiRunnerService $qtiRunnerService,
        QtiRunnerMapBuilder $qtiRunnerMapBuilder,
        DeliveryExecutionManagerService $deliveryExecutionService,
        ResultServiceWrapper $resultService
    ) {
        $this->deliveryContainerService = $deliveryContainerService;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->qtiRunnerMapBuilder = $qtiRunnerMapBuilder;
        $this->deliveryExecutionService = $deliveryExecutionService;
        $this->resultService = $resultService;
    }

    /**
     * @param string $deliveryExecutionId
     *
     * @return array
     * @throws common_Exception
     */
    public function build($deliveryExecutionId): array
    {
        $serviceContext = $this->getServiceContext($deliveryExecutionId);

        $ref = taoQtiTest_helpers_TestRunnerUtils::getItemRef($serviceContext->getTestSession(), '0', $serviceContext);

        /** @var TestModelService $testModelService */
        $testModelService = ServiceManager::getServiceManager()->get(TestModelService::SERVICE_ID);
        $items = $testModelService->getItems($this->getResource($serviceContext->getTestDefinitionUri()));
        /** @var core_kernel_classes_Resource $first */
        $first = array_shift($items);


        $init = [
            'itemIdentifier' => $first->getUri(),

//            'itemData'       => $this->qtiRunnerService->getItemData($serviceContext, $serviceContext->getTestCompilationUri()),
//              formatted as itemURI|publicFolderURI|privateFolderURI

            'testMap' => $this->qtiRunnerService->getTestMap($serviceContext),
            'testContext' => $this->qtiRunnerService->getTestContext($serviceContext),
            'testData' => $this->qtiRunnerService->getTestData($serviceContext),
            'testResponses' => $this->getItemData($serviceContext),
            'success' => true,
        ];

        return $init;
    }

    /**
     * @return OntologyService
     */
    protected function getOntologyService(): OntologyService
    {
        return $this->getServiceManager()->get(ServiceProxy::SERVICE_ID);
    }

    private function getItemData()
    {
        return [
            ['itemDefinition' => 'item-1', 'state' => null],
            ['itemDefinition' => 'item-2', 'state' => null],
            ['itemDefinition' => 'item-3', 'state' => null],
        ];
    }

    /**
     * @param string $deliveryExecutionId
     * @return QtiRunnerServiceContext
     * @throws common_Exception
     */
    private function getServiceContext($deliveryExecutionId): QtiRunnerServiceContext
    {
        $deliveryExecution = $this->deliveryExecutionService->getDeliveryExecutionById($deliveryExecutionId);

        $compilation = $this->deliveryContainerService->getTestCompilation($deliveryExecution);
        $testId = $this->deliveryContainerService->getTestDefinition($deliveryExecution);

        return $this->qtiRunnerService->getServiceContext($testId, $compilation, $deliveryExecutionId);
    }
}
