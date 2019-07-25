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
use oat\taoOutcomeUi\helper\ResponseVariableFormatter;
use oat\taoOutcomeUi\model\ResultsService;
use oat\taoOutcomeUi\model\Wrapper\ResultServiceWrapper;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use taoQtiTest_helpers_TestRunnerUtils;

class QtiRunnerInitDataBuilder
{
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

        $init = [
            'itemIdentifier' => null,
            'itemData'       => null,
            'testMap'        => $this->getTestMap($serviceContext),
            'testContext'    => $this->qtiRunnerService->getTestContext($serviceContext),
            'success'        => true
        ];

        return $init;
    }

    /**
     * @param string $deliveryExecutionId
     *
     * @return QtiRunnerServiceContext
     *
     * @throws common_Exception
     */
    private function getServiceContext($deliveryExecutionId): QtiRunnerServiceContext
    {
        // need to use ontology service probably here
        $deliveryExecution = $this->deliveryExecutionService->getDeliveryExecutionById($deliveryExecutionId);

        $compilation = $this->deliveryContainerService->getTestCompilation($deliveryExecution);
        $testId = $this->deliveryContainerService->getTestDefinition($deliveryExecution);

        return $this->qtiRunnerService->getServiceContext($testId, $compilation, $deliveryExecutionId);
    }

    /**
     * @param $serviceContext
     *
     * @return array
     * @throws common_Exception
     */
    private function getTestMap(QtiRunnerServiceContext $serviceContext)
    {
        $parts = $this->qtiRunnerMapBuilder->build($serviceContext);

        return [
            'scope' => 'test',
            'parts' => $parts,
//            'jumps' => $this->getJumps($serviceContext)
            'jumps' => $this->getJumps3($parts),
        ];
    }

    private function getJumps3(array $parts)
    {
        $jumps = [];
        foreach ($parts as $partName => $part) {
            foreach ($part['sections'] as $sectionName => $section) {
                foreach ($section['items'] as $item) {
                    $jumps[] = [
                        'identifier' => $item['id'],
                        'position'   => $item['position'],
                        'section'    => $sectionName,
                        'part'       => $partName
                    ];
                }
            }
        }

        return $jumps;
    }

    /**
     * @param       $resultId
     * @param       $filterSubmission
     * @param array $filterTypes
     *
     * @return mixed
     * @throws common_Exception
     */
    protected function getResultVariables($resultId, $filterSubmission = ResultsService::VARIABLES_FILTER_LAST_SUBMITTED, $filterTypes = array())
    {
        $variables = $this->resultService->getStructuredVariables($resultId, $filterSubmission, array_merge($filterTypes, [\taoResultServer_models_classes_ResponseVariable::class]));
        $displayedVariables = $this->resultService->filterStructuredVariables($variables, $filterTypes);
        $responses = ResponseVariableFormatter::formatStructuredVariablesToItemState($variables);
        $excludedVariables = array_flip(['numAttempts', 'duration']);

        foreach ($displayedVariables as &$item) {
            if (!isset($item['uri'])) {
                continue;
            }
            $itemUri = $item['uri'];
            $item['state'] = isset($responses[$itemUri][$item['attempt']])
                ? json_encode(array_diff_key($responses[$itemUri][$item['attempt']], $excludedVariables))
                : null;
        }

        return $displayedVariables;
    }


    private function getJumps1(QtiRunnerServiceContext $serviceContext)
    {
        return taoQtiTest_helpers_TestRunnerUtils::buildPossibleJumps($serviceContext->getTestSession());
    }
}
