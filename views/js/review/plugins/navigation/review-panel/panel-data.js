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
    'lodash',
    'i18n'
], function (_, __) {
    'use strict';

    /**
     * @typedef {mapEntry} reviewPanelSection
     * @property {mapEntry[]} items - The list of items contained in the section
     */

    /**
     * @typedef {mapEntry} reviewPanelPart
     * @property {reviewPanelSection[]} sections - The list of sections contained in the test part
     */

    /**
     * @typedef {Object} reviewPanelMap
     * @property {reviewPanelPart[]} parts - The list of test parts to display
     * @property {Map} items - A map of items, indexed by identifiers
     * @property {Number} score - The test taker's score for this item
     * @property {Number} maxScore - The max possible score for this item
     */

    /**
     * Compares two objects by their position properties
     * @param {mapEntry} a
     * @param {mapEntry} b
     * @returns {Number}
     */
    const compareByPosition = (a, b) => a.position - b.position;

    /**
     * Gets the type for a particular item
     * @param {mapEntry} item
     * @param {Boolean} withScore
     * @returns {String}
     */
    const getItemType = (item, withScore) => {
        if (item.informational) {
            return 'info';
        }
        if (withScore && item.maxScore) {
            //if item was never visited, item.score=null. So it will be 'incorrect', not 'skipped'. Is it intentional?
            if (item.score === item.maxScore) {
                return 'correct';
            } else {
                return 'incorrect';
            }
        }
        if (item.skipped) {
            return 'skipped';
        }
        return 'default';
    };

    /**
     * Extracts data from a mapEntry
     * @param {mapEntry} entry
     * @param {Boolean} withScore
     * @returns {mapEntry}
     */
    const extractData = (entry, withScore) => {
        const {id, label, position, informational, skipped, score, maxScore} = entry || {};
        const data = {id, label, position, withScore};
        if (withScore) {
            Object.assign(data, {score, maxScore});
        }
        if ('undefined' !== typeof informational) {
            data.informational = informational;
        }
        if ('undefined' !== typeof skipped) {
            data.skipped = skipped;
        }
        return data;
    };

    /**
    * Refines the test runner data and build the expected review panel map
    * @param {testMap} testMap
    * @param {Boolean} withScore
    * @returns {reviewPanelMap}
    */
    const getAccordionReviewPanelMap = (testMap, withScore = true) => {
        const { parts, score, maxScore } = testMap;
        const items = new Map();

        // rebuild the map keeping only relevant data, and sorting elements by position
        const panelMap = {
            parts: _.map(parts, part => Object.assign(extractData(part, withScore), {
                sections: _.map(part.sections, section => Object.assign(extractData(section, withScore), {
                    items: _.map(section.items, item => {
                        const reviewItem = extractData(item, withScore);
                        reviewItem.type = getItemType(item, withScore);
                        items.set(item.id, reviewItem);
                        return reviewItem;
                    }).sort(compareByPosition)
                })).sort(compareByPosition)
            })).sort(compareByPosition),
            withScore,
            items
        };

        if (withScore) {
            Object.assign(panelMap, { score, maxScore });
        }

        return panelMap;
    };

    return {
        getAccordionReviewPanelMap,

        /**
         * Refines the test runner data and build the expected review panel map
         * @param {testMap} testMap
         * @param {Boolean} withScore
         * @param {Boolean} displaySectionTitles
         * @returns {reviewPanelMap}
         */
        getFizzyReviewPanelMap(testMap, withScore = true, displaySectionTitles = true) {
            const panelMap = getAccordionReviewPanelMap(testMap, withScore);
            let numberInTest = 1;
            let sections = [];

            panelMap.parts.forEach((part) => {
                part.sections.forEach((section) => {
                    sections.push(section);
                    section.items.forEach((reviewItem) => {
                        const status = reviewItem.type;

                        // {
                        //     "id": "item-13",
                        //     "label": "E2E items 4 - ending",
                        //     "position": 9,
                        //     "withScore": 1,
                        //     "score": 0,
                        //     "maxScore": 0,
                        //     "informational": true,
                        //     "skipped": false,
                        //     "type": "info"
                        // }
                        //==>
                        // {
                        //     "id": "item-13", //for panel controller & key for component
                        //     "position": 9, //for panel controller
                        //     "ariaLabel": "Question 10",
                        //     "label": 10,
                        //     "icon": 'info'/null,
                        //     "type": 'answered'/'viewed'/'unseen',
                        //     "scoreType": 'correct'/'incorrect'/null

                        if (status !== 'info') {
                            reviewItem.label = numberInTest;
                            numberInTest++;
                        }

                        reviewItem.icon = status === 'info' ? 'info' : null;

                        reviewItem.ariaLabel = status === 'info' ? __('Informational') : __('Question %s', reviewItem.label);

                        reviewItem.type = null;
                        if (status !== 'info' && status !== 'skipped') {
                            reviewItem.type = 'answered';
                        } else {
                            reviewItem.type = 'viewed';
                        }

                        reviewItem.scoreType = null;
                        if (status === 'correct') {
                            reviewItem.scoreType = 'correct';
                        } else if (status === 'incorrect') {
                            reviewItem.scoreType = 'incorrect';
                        }
                    });
                });
            });

            panelMap.sections = sections; //flatten 'parts-sections-items' to 'sections-items'
            panelMap.displaySectionTitles = displaySectionTitles;

            return panelMap;
        }
    };
});
