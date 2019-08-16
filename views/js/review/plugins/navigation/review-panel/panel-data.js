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
     * @typedef {Object} mapEntry
     * @property {String} id - The element identifier
     * @property {String} label - The displayed label
     * @property {Number} position - The position of the item within the test
     * @property {Number} score - The test taker's score for this item
     * @property {Number} maxScore - The max possible score for this item
     * @property {Boolean} [informational] - If the item is informational
     * @property {Boolean} [skipped] - If the item has been skipped
     */

    /**
     * Compares two objects by their position properties
     * @param {mapEntry} a
     * @param {mapEntry} b
     * @returns {Number}
     */
    const compareByPosition = (a, b) => a.position - b.position;

    /**
     * Extracts data from a mapEntry
     * @param {mapEntry} entry
     * @param {Number} score
     * @param {Number} maxScore
     * @returns {mapEntry}
     */
    const extractData = (entry, score, maxScore) => {
        const {id, label, position, informational, skipped} = entry || {};
        const data = {id, label, position, score, maxScore};
        if ('undefined' !== typeof informational) {
            data.informational = informational;
        }
        if ('undefined' !== typeof skipped) {
            data.skipped = skipped;
        }
        return data;
    };

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
                    parts: _.map(testMap && testMap.parts, part => {
                        let partScore = 0;
                        let partMaxScore = 0;
                        const sections = _.map(part.sections, section => {
                            let sectionScore = 0;
                            let sectionMaxScore = 0;
                            const items = _.map(section.items, item => {
                                const itemScore = item.score || 0;
                                const itemMaxScore = item.maxScore || 0;
                                sectionScore += itemScore;
                                sectionMaxScore += itemMaxScore;
                                return extractData(item, itemScore, itemMaxScore);
                            }).sort(compareByPosition);
                            partScore += sectionScore;
                            partMaxScore += sectionMaxScore;
                            return Object.assign(extractData(section, sectionScore, sectionMaxScore), {items});
                        }).sort(compareByPosition);
                        testScore += partScore;
                        testMaxScore += partMaxScore;
                        return Object.assign(extractData(part, partScore, partMaxScore), {sections});
                    }).sort(compareByPosition),
                    score: testScore,
                    maxScore: testMaxScore
                };
            }
        };
    }

    return reviewPanelDataService;
});
