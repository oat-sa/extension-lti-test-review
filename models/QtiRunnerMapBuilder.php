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
use common_exception_Error;
use core_kernel_classes_Resource;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\Route;
use qtism\runtime\tests\RouteItem;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

class QtiRunnerMapBuilder
{
    /**
     * @var ExtendedStateService
     */
    private $extendedStateService;
    /**
     * @var CatService
     */
    private $catService;
    /**
     * @var QtiRunnerConfig
     */
    private $qtiRunnerConfig;

    public function __construct(
        QtiRunnerConfig $qtiRunnerConfig,
        ExtendedStateService $extendedStateService,
        CatService $catService
    ) {
        $this->extendedStateService = $extendedStateService;
        $this->catService = $catService;
        $this->qtiRunnerConfig = $qtiRunnerConfig;
    }

    /**
     * @param QtiRunnerServiceContext $context
     *
     * @return array
     * @throws common_Exception
     * @throws common_exception_Error
     */
    public function build(QtiRunnerServiceContext $context)
    {
        $map = [];

        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();
        $store = $session->getAssessmentItemSessionStore();
        $routeItems = $session->getRoute()->getAllRouteItems();

        $offset = $this->getOffsetPosition($context, $routeItems[0]);
        $catSession = false;

        /** @var RouteItem $routeItem */
        foreach ($routeItems as $routeItem) {
            $itemRefs = $this->getRouteItemAssessmentItemRefs($context, $routeItem, $catSession);
            $previouslySeenItems = $catSession ? $context->getPreviouslySeenCatItemIds($routeItem) : [];

            foreach ($itemRefs as $itemRef) {
                $itemId = $itemRef->getIdentifier();
                $occurrence = $catSession !== false ? 0 : $routeItem->getOccurence();
                $itemSession = $catSession !== false ? false : $store->getAssessmentItemSession($itemRef, $occurrence);
                $isViewed = in_array($itemId, $previouslySeenItems, true);
                $isItemInformational = $itemSession ? TestRunnerUtils::isItemInformational(
                    $routeItem,
                    $itemSession
                ) : false;


                $itemUri = strstr($itemRef->getHref(), '|', true);
                $label = $this->getItemLabel($context, $itemUri);

                $itemInfos = [
                    'id'                => $itemId,
                    'label'             => $label,
                    'position'          => $offset,
                    'occurrence'        => $occurrence,
                    'remainingAttempts' => $itemSession ? $itemSession->getRemainingAttempts() : -1,
                    'answered'          => $itemSession ? TestRunnerUtils::isItemCompleted(
                        $routeItem,
                        $itemSession
                    ) : $isViewed,
                    'flagged'           => $this->extendedStateService->getItemFlag($session->getSessionId(), $itemId),
                    'viewed'            => $itemSession ? $itemSession->isPresented() : $isViewed,
                    'categories'        => $itemRef->getCategories()->getArrayCopy(),
                    'informational'     => $isItemInformational,
                ];

                $offset++;

                $testPart = $routeItem->getTestPart();
                $partId = $testPart->getIdentifier();

                $reviewConfig = $this->qtiRunnerConfig->getConfigValue('review');
                $displaySubsectionTitle = isset($reviewConfig['displaySubsectionTitle']) ? (bool)$reviewConfig['displaySubsectionTitle'] : true;
                if ($displaySubsectionTitle) {
                    $section = $routeItem->getAssessmentSection();
                } else {
                    $sections = $routeItem->getAssessmentSections()->getArrayCopy();
                    $section = $sections[0];
                }
                $sectionId = $section->getIdentifier();

                $map[$partId]['sections'][$sectionId]['items'][$itemId] = $itemInfos;
            }
        }

        return $map;
    }

    /**
     * Get the relative position of the given RouteItem within the test.
     * The position takes into account adaptive sections (and count items instead of placeholders).
     *
     * @param QtiRunnerServiceContext $context
     * @param RouteItem               $currentRouteItem
     *
     * @return int the offset position
     */
    protected function getOffsetPosition(QtiRunnerServiceContext $context, RouteItem $currentRouteItem)
    {
        $session = $context->getTestSession();

        /** @var Route $route */
        $route = $session->getRoute();
        $routeCount = $route->count();

        $finalPosition = 0;

        for ($i = 0; $i < $routeCount; $i++) {
            $routeItem = $route->getRouteItemAt($i);

            if ($routeItem !== $currentRouteItem) {
                if (!$context->isAdaptive($routeItem->getAssessmentItemRef())) {
                    $finalPosition++;
                } else {
                    $finalPosition += count($context->getShadowTest($routeItem));
                }
            } else {
                break;
            }
        }

        return $finalPosition;
    }

    /**
     * Get AssessmentItemRef objects.
     *
     * Get the AssessmentItemRef objects bound to a RouteItem object. In most of cases, an array of a single
     * AssessmentItemRef object will be returned. But in case of the given $routeItem is a CAT Adaptive Placeholder,
     * multiple AssessmentItemRef objects might be returned.
     *
     * @param QtiRunnerServiceContext $context
     * @param RouteItem               $routeItem
     * @param mixed                   $catSession A reference to a variable that will be fed with the CatSession object
     *                                            related to the
     *                                            $routeItem. In case the $routeItem is not bound to a CatSession
     *                                            object,
     *                                            $catSession will be set with false.
     *
     * @return array An array of AssessmentItemRef objects.
     */
    protected function getRouteItemAssessmentItemRefs(
        QtiRunnerServiceContext $context,
        RouteItem $routeItem,
        &$catSession
    ) {
        $compilationDirectory = $context->getCompilationDirectory()['private'];
        $itemRefs = [];
        $catSession = false;

        if ($context->isAdaptive($routeItem->getAssessmentItemRef())) {
            $catSession = $context->getCatSession($routeItem);

            $itemRefs = $this->catService->getAssessmentItemRefByIdentifiers(
                $compilationDirectory,
                $context->getShadowTest($routeItem)
            );
        } else {
            $itemRefs[] = $routeItem->getAssessmentItemRef();
        }

        return $itemRefs;
    }

    /**
     * Get the label of a Map item
     *
     * @param QtiRunnerServiceContext $context
     * @param string                  $itemUri
     *
     * @return string the title
     * @throws common_exception_Error
     */
    private function getItemLabel(QtiRunnerServiceContext $context, $itemUri)
    {
        $item = new core_kernel_classes_Resource($itemUri);

        return $item->getLabel();
    }
}
