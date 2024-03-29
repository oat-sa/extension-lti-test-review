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
 * Copyright (c) 2019-2022 (original work) Open Assessment Technologies SA;
 */

namespace oat\ltiTestReview\models;

use common_Exception;
use common_exception_Error;
use oat\generis\model\OntologyAwareTrait;
use oat\ltiTestReview\models\Exception\InvalidDataItemException;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoOutcomeUi\helper\ResponseVariableFormatter;
use oat\taoOutcomeUi\model\ResultsService;
use oat\taoOutcomeUi\model\Wrapper\ResultServiceWrapper;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoResultServer\models\classes\ResultServerService;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentSectionRef;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\data\TestPart;
use taoQtiTest_helpers_Utils;
use taoResultServer_models_classes_OutcomeVariable;
use taoResultServer_models_classes_ResponseVariable;

class QtiRunnerInitDataBuilder
{
    use OntologyAwareTrait;

    protected const OUTCOME_VAR_SCORE = 'SCORE';
    protected const OUTCOME_VAR_MAXSCORE = 'MAXSCORE';
    private const OUTCOME_DECLARATION_IDENTIFIER = 'identifier';
    private const OUTCOME_DECLARATION_DEFAULT_VALUE = 'defaultValue';

    /**
     * @var DeliveryContainerService
     */
    private $deliveryContainerService;

    /**
     * @var QtiRunnerService
     */
    private $qtiRunnerService;

    /**
     * @var DeliveryExecutionManagerService
     */
    private $deliveryExecutionService;

    /**
     * @var ResultsService
     */
    private $resultService;

    /**
     * @var ResultServerService
     */
    private $resultServerService;

    private $itemsData = [];

    public function __construct(
        DeliveryContainerService $deliveryContainerService,
        QtiRunnerService $qtiRunnerService,
        DeliveryExecutionManagerService $deliveryExecutionService,
        ResultServiceWrapper $resultService,
        ResultServerService $resultServerService
    ) {
        $this->deliveryContainerService = $deliveryContainerService;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->deliveryExecutionService = $deliveryExecutionService;
        $this->resultService = $resultService->getService();
        $this->resultServerService = $resultServerService;
    }

    /**
     * @param string $deliveryExecutionId
     * @param bool   $withScores
     *
     * @return array
     * @throws common_Exception
     */
    public function build($deliveryExecutionId, $withScores = false)
    {
        $serviceContext = $this->getServiceContext($deliveryExecutionId);

        $itemsData = $this->getItemsData($deliveryExecutionId, $withScores);
        $testMap = $this->getTestMap($serviceContext, $itemsData);

        $firstItem = array_shift($this->itemsData);

        $init = [
            'testMap' => $testMap,
            'testContext' => array_merge(
                $this->qtiRunnerService->getTestContext($serviceContext),
                [
                    'itemIdentifier' => $firstItem['itemId'],
                    'itemPosition' => 0,
                ]
            ),
            'testData' => $this->qtiRunnerService->getTestData($serviceContext),
            'testResponses' => array_column($itemsData, 'state', 'identifier'),
            'success' => true,
        ];

        return $init;
    }

    protected function getItemsData(string $deliveryExecutionId, $fetchScores = false)
    {
        $deliveryExecution = $this->deliveryExecutionService->getDeliveryExecutionById($deliveryExecutionId);
        $delivery = $deliveryExecution->getDelivery();

        $filterSubmission = ResultsService::VARIABLES_FILTER_LAST_SUBMITTED;
        $filterTypes = [
            taoResultServer_models_classes_ResponseVariable::class,
            taoResultServer_models_classes_OutcomeVariable::class,
        ];

        $implementation = $this->resultServerService->getResultStorage($delivery->getUri());
        $this->resultService->setImplementation($implementation);

        $variables = $this->getResultVariables($deliveryExecution->getIdentifier(), $filterSubmission, $filterTypes);

        $returnValue = [];

        foreach ($variables as $variable) {
            $returnValue[$variable['internalIdentifier']] = [
                'identifier' => $variable['internalIdentifier'],
                'state' => json_decode($variable['state'], true),
            ];

            if ($fetchScores) {
                $outcome = array_filter(
                    $variable[taoResultServer_models_classes_OutcomeVariable::class],
                    static function ($key) {
                        return in_array($key, [static::OUTCOME_VAR_SCORE, static::OUTCOME_VAR_MAXSCORE], true);
                    },
                    ARRAY_FILTER_USE_KEY
                );

                if (isset($outcome[static::OUTCOME_VAR_SCORE])) {
                    /**
                     * @var taoResultServer_models_classes_OutcomeVariable $var
                     */
                    $var = $outcome[static::OUTCOME_VAR_SCORE]['var'];
                    $returnValue[$variable['internalIdentifier']]['score'] = (float)$var->getValue();
                    $returnValue[$variable['internalIdentifier']]['isExternallyGraded'] =
                        $var->getExternallyGraded();
                }

                if (isset($outcome[static::OUTCOME_VAR_MAXSCORE])) {
                    $var = $outcome[static::OUTCOME_VAR_MAXSCORE]['var'];
                    $returnValue[$variable['internalIdentifier']]['maxScore'] = (float)$var->getValue();
                }
            }
        }

        return $returnValue;
    }

    /**
     * @throws common_Exception|InvalidDataItemException
     */
    protected function getTestMap(QtiRunnerServiceContext $context, array $itemsStates): array
    {
        $testDefinition = taoQtiTest_helpers_Utils::getTestDefinition($context->getTestCompilationUri());

        $map = [
            'scope' => 'test',
            'parts' => [],
            'stats' => [],
            'jumps' => [],
        ];

        $position = 0;
        foreach ($testDefinition->getTestParts() as $testPart) {
            /**
             * @var TestPart $testPart
             */
            $sections = [];
            foreach ($testPart->getAssessmentSections() as $section) {
                /**
                 * @var AssessmentSection $section
                 */

                $items = [];
                foreach ($section->getSectionParts() as $item) {
                    /**
                     * @var AssessmentSectionRef $item
                     */
                    $itemData = $this->qtiRunnerService->getItemData($context, $item->getHref());

                    $itemId = $item->getIdentifier();
                    $state = $itemsStates[$itemId]['state'] ?? [];

                    $responsesCount = $this->getResponseCountsFromState($state);

                    $isUnseen = empty($state);
                    $isInformational = $this->isItemInformational($item);
                    $isSkipped = !$isInformational && ($responsesCount === 0);

                    $this->validateItemData($itemData);

                    $items[$itemId] = [
                        'id' => $itemId,
                        'label' => $itemData['data']['attributes']['label'],
                        'title' => $itemData['data']['attributes']['title'],
                        'position' => $position,
                        'categories' => [],
                        'informational' => $isInformational,
                        'skipped' => $isSkipped,
                        'unseen' => $isUnseen,
                        'score' => $itemsStates[$itemId]['score'] ?? $this->getOutcomeDeclarationDefaultVariable(
                            $itemData['data'],
                            self::OUTCOME_VAR_SCORE
                        ),
                        'maxScore' => $itemsStates[$itemId]['maxScore'] ??
                                $this->getOutcomeDeclarationDefaultVariable(
                                    $itemData['data'],
                                    self::OUTCOME_VAR_MAXSCORE
                                ),
                        'isExternallyScored' => $this->isExternallyScored($itemData['data'] ?? []),
                        //invert the condition to have a better attribute exposed on the FE
                        'pendingExternalScore' => !($itemsStates[$itemId]['isExternallyGraded'] ?? false),
                    ];

                    $this->fillItemsData($itemId, $item->getHref(), $itemData['data']);
                    $position++;
                }

                $sectionId = $section->getIdentifier();
                $sections[$sectionId] = [
                    'id' => $sectionId,
                    'label' => $section->getTitle(),
                    'items' => $items,
                    'stats' => [],
                ];
            }

            $testPartId = $testPart->getIdentifier();
            $map['parts'][$testPartId] = [
                'id' => $testPartId,
                'label' => $testPart->getIdentifier(),
                'sections' => $sections,
                'stats' => [],
            ];
        }

        return $map;
    }

    private function fillItemsData($itemId, $itemRef, $itemData)
    {
        $this->itemsData[] = [
            'itemId' => $itemId,
            'itemRef' => $itemRef,
            'itemData' => $itemData,
        ];
    }

    /**
     * @param  ExtendedAssessmentItemRef $itemRef
     * @return Boolean
     */
    private function isItemInformational(ExtendedAssessmentItemRef $itemRef): bool
    {
        $categories = $itemRef->getCategories()->getArrayCopy();

        $hasInformationalCategory = in_array('x-tao-itemusage-informational', $categories, true);

        $hasNoResponseDeclarations = method_exists($itemRef, 'getResponseDeclarations') && 0 == count(
            $itemRef->getResponseDeclarations()
        );

        return $hasInformationalCategory || $hasNoResponseDeclarations;
    }

    /**
     * @throws common_exception_Error
     * @throws common_Exception
     */
    protected function getResultVariables($resultId, $filterSubmission, $filterTypes = []): array
    {
        $variables = $this->resultService->getStructuredVariables(
            $resultId,
            $filterSubmission,
            array_merge($filterTypes, [\taoResultServer_models_classes_ResponseVariable::class])
        );
        $displayedVariables = $this->resultService->filterStructuredVariables($variables, $filterTypes);

        $responses = ResponseVariableFormatter::formatStructuredVariablesToItemState($variables);
        $excludedVariables = array_flip(['numAttempts', 'duration']);

        foreach ($displayedVariables as $itemKey => &$item) {
            $item['state'] = isset($responses[$itemKey][$item['attempt']])
                ? json_encode(array_diff_key($responses[$itemKey][$item['attempt']], $excludedVariables))
                : null;
        }

        return $displayedVariables;
    }

    /**
     * @param  string $deliveryExecutionId
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

    private function getResponseCountsFromState(array $itemState): int
    {
        $responsesCount = 0;
        if (!empty($itemState)) {
            foreach ($itemState as $response) {
                if (!empty($response['response']['base'])) {
                    $responsesCount += 1;
                } elseif (!empty($response['response']['list'])) {
                    $responsesCount += count(array_merge(...array_values($response['response']['list'])));
                }
            }
        }

        return $responsesCount;
    }

    private function getOutcomeDeclarationDefaultVariable(array $data, string $outcomeDeclaration): ?float
    {
        foreach ($data['outcomes'] ?? [] as $outcome) {
            if ($outcome[self::OUTCOME_DECLARATION_IDENTIFIER] === $outcomeDeclaration) {
                return (float)$outcome[self::OUTCOME_DECLARATION_DEFAULT_VALUE];
            }
        }

        return null;
    }


    private function isExternallyScored(array $data): bool
    {
        foreach ($data['outcomes'] ?? [] as $outcome) {
            if (isset($outcome['attributes']['externalScored'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @throws InvalidDataItemException
     */
    private function validateItemData(array $itemData): void
    {
        if (!isset($itemData['data']['attributes'])) {
            throw new InvalidDataItemException('DataItem array is missing required elements');
        }
    }
}
