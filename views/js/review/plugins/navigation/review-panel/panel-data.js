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
 * Copyright (c) 2019 Open Assessment Technologies SA ;
 */
/**
 * Helper that will build the dataset for the review panel in the expected format
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * Compares two objects by their position properties
     * @param {Object} a
     * @param {Object} b
     * @returns {Number}
     */
    const compareByPosition = (a, b) => a.position - b.position;

    /**
     * Refine the data from the test runner in order to provide the dataset expected by the review panel
     * @param {testRunner} testRunner
     * @returns {{}}
     */
    function reviewPanelDataService(testRunner) {
        return {
            /**
             * Refines the test runner data and build the expected review panel map
             * @returns {reviewPanelMap}
             */
            getReviewPanelMap() {
                const testMap = testRunner.getTestMap();
                let testScore = 0;
                let testMaxScore = 0;
                return {
                    // rebuild the map keeping only relevant data, computing the score and sorting elements by position
                    // make use of lodash to simplify as the source collection could be either an object or an array
                    parts: _.map(testMap && testMap.parts, testPart => {
                        let testPartScore = 0;
                        let testPartMaxScore = 0;
                        return {
                            id: testPart.id,
                            label: testPart.label,
                            position: testPart.position,
                            sections: _.map(testPart.sections, partSection => {
                                let testSectionScore = 0;
                                let testSectionMaxScore = 0;
                                return {
                                    id: partSection.id,
                                    label: partSection.label,
                                    position: partSection.position,
                                    items: _.map(partSection.items, sectionItem => {
                                        const score = sectionItem.score || 0;
                                        const maxScore = sectionItem.maxScore || 0;
                                        testSectionScore += score;
                                        testSectionMaxScore += maxScore;
                                        testPartScore += score;
                                        testPartMaxScore += maxScore;
                                        testScore += score;
                                        testMaxScore += maxScore;
                                        return {
                                            id: sectionItem.id,
                                            label: sectionItem.label,
                                            position: sectionItem.position,
                                            score,
                                            maxScore
                                        };
                                    }).sort(compareByPosition),
                                    score: testSectionScore,
                                    maxScore: testSectionMaxScore
                                };
                            }).sort(compareByPosition),
                            score: testPartScore,
                            maxScore: testPartMaxScore
                        };
                    }).sort(compareByPosition),
                    score: testScore,
                    maxScore: testMaxScore
                };
            }
        };
    }

    return reviewPanelDataService;
});
