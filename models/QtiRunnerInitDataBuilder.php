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
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use taoQtiTest_helpers_TestRunnerUtils;

class QtiRunnerInitDataBuilder
{
    /**
     * @var DeliveryContainerService
     */
    private $deliveryContainerService;
    /**
     * @var QtiRunnerService
     */
    private $qtiRunnerService;
    /**
     * @var QtiRunnerMapBuilder
     */
    private $qtiRunnerMapBuilder;
    /**
     * @var DeliveryExecutionManagerService
     */
    private $deliveryExecutionService;

    public function __construct(
        DeliveryContainerService $deliveryContainerService,
        QtiRunnerService $qtiRunnerService,
        QtiRunnerMapBuilder $qtiRunnerMapBuilder,
        DeliveryExecutionManagerService $deliveryExecutionService
    ) {
        $this->deliveryContainerService = $deliveryContainerService;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->qtiRunnerMapBuilder = $qtiRunnerMapBuilder;
        $this->deliveryExecutionService = $deliveryExecutionService;
    }

    /**
     * @param $deliveryExecutionId
     *
     * @return array
     * @throws common_Exception
     * @throws InvalidServiceManagerException
     */
    public function build($deliveryExecutionId)
    {
        $deliveryExecution = $this->deliveryExecutionService->getDeliveryExecutionById($deliveryExecutionId);

        $compilation = $this->deliveryContainerService->getTestCompilation($deliveryExecution);
        $testId = $this->deliveryContainerService->getTestDefinition($deliveryExecution);

        $serviceContext = $this->qtiRunnerService->getServiceContext($testId, $compilation, $deliveryExecutionId);
        $jumps = $this->getJumps($serviceContext);

        $parts = $this->qtiRunnerMapBuilder->build($serviceContext);

        $init = [
            'itemIdentifier' => null,
            'itemData'       => null,
            'testMap'        => [
                'scope' => 'test',
                'parts' => $parts,
                'jumps' => $jumps
            ],
            'testContext'    => $this->qtiRunnerService->getTestContext($serviceContext),
            'success'        => true
        ];

        return $init;
    }

    private function getJumps(QtiRunnerServiceContext $serviceContext)
    {
        return taoQtiTest_helpers_TestRunnerUtils::buildPossibleJumps($serviceContext->getTestSession());
    }
}
