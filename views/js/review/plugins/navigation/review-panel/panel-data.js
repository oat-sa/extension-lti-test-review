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

    return {
        /**
         * Refines the test runner data and build the expected review panel map
         * @param {testMap} testMap
         * @param {Boolean} withScore
         * @param {Boolean} displaySectionTitles
         * @returns {reviewPanelMap}
         */
        getReviewPanelMap(testMap, withScore = true, displaySectionTitles = true) {
            const { parts, score, maxScore } = testMap;
            const items = new Map();

            // rebuild the map keeping only relevant data, and sorting elements by position
            const panelMap = {
                parts: _.map(parts, part => Object.assign(extractData(part, withScore), {
                    sections: _.map(part.sections, section => Object.assign(extractData(section, withScore), {
                        items: _.map(section.items, item => {
                            const fizzyItem = extractData(item, withScore);
                            fizzyItem.type = getItemType(item, withScore);
                            items.set(item.id, fizzyItem);
                            return fizzyItem;
                        }).sort(compareByPosition)
                    })).sort(compareByPosition)
                })).sort(compareByPosition),
                withScore,
                items
            };

            if (withScore) {
                Object.assign(panelMap, { score, maxScore });
            }

            //add fizzy panel (stepOverview) data
            let numberInTest = 1;
            let fizzySections = [];
            panelMap.parts.forEach((part) => {
                part.sections.forEach((originalSection) => {
                    const fizzySection = {
                        id: originalSection.id,
                        label: originalSection.label,
                        items: []
                    };
                    fizzySections.push(fizzySection);

                    originalSection.items.forEach((originalItem) => {
                        const status = originalItem.type;

                        const fizzyItem = {
                            id: originalItem.id,
                            label: originalItem.label
                        };
                        fizzySection.items.push(fizzyItem);

                        if (status !== 'info') {
                            fizzyItem.label = numberInTest;
                            numberInTest++;
                        }

                        fizzyItem.icon = status === 'info' ? 'info' : null;

                        fizzyItem.ariaLabel = status === 'info' ? __('Informational') : __('Question %s', fizzyItem.label);

                        fizzyItem.type = null;
                        if (status !== 'info' && status !== 'skipped') {
                            fizzyItem.type = 'answered';
                        } else {
                            fizzyItem.type = 'viewed';
                        }

                        fizzyItem.scoreType = null;
                        if (status === 'correct') {
                            fizzyItem.scoreType = 'correct';
                        } else if (status === 'incorrect') {
                            fizzyItem.scoreType = 'incorrect';
                        }
                    });
                });
            });
            panelMap.sections = fizzySections; //flatten 'parts-sections-items' to 'sections-items' & change/add some properties (type/icon)
            panelMap.displaySectionTitles = displaySectionTitles;

            return panelMap;
        }
    };
});
