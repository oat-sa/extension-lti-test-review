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
 * Copyright (c) 2019-2022 Open Assessment Technologies SA ;
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
        if (withScore) {
            if (item.isExternallyScored) {
                return 'score-pending';
            }
            if (item.maxScore) {
                if (item.score > 0 && item.score < item.maxScore) {
                    return 'score-partial';
                }
                if (item.score === item.maxScore) {
                    return 'correct';
                } else {
                    // also applies when item.score === null (skipped items)
                    return 'incorrect';
                }
            } else if (!item.skipped) {
                return 'no-score';
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
        const { id, label, position, informational, skipped, title, unseen, score, maxScore } = entry || {};
        const data = { id, label, position, withScore };
        if (withScore) {
            Object.assign(data, { score, maxScore });
        }
        if ('undefined' !== typeof informational) {
            data.informational = informational;
        }
        if ('undefined' !== typeof skipped) {
            data.skipped = skipped;
        }
        if ('undefined' !== typeof unseen) {
            data.unseen = unseen;
        }
        if ('undefined' !== typeof title) {
            data.title = title;
        }
        return data;
    };

    /**
     * @typedef {Object} ReviewItem
     * @property {String} id - item id
     * @property {Number} position - 0-based list index
     * @property {String} label - displayed text
     * @property {String} numericLabel - displayed number (alternative to label)
     * @property {String} ariaLabel
     * @property {Number} score - the item's current score
     * @property {Number} maxScore - the item's max possible score
     * @property {Boolean} informational
     * @property {Boolean} skipped
     * @property {Boolean} unseen
     * @property {String} type - 'correct'/'incorrect'/'info'/'skipped'/'score-pending'/'score-partial'/'default'
     * @property {String} status - 'answered'/'viewed'/'unseen'
     * @property {String} scoreType - 'correct'/'incorrect'/'score-pending'/'score-partial'/null
     * @property {String} icon - 'info' or null
     */
    /**
     * Adds missing properties to a reviewItem, to support fizzyPanel UI
     * @param {mapEntry} entry - item, will be mutated
     * @param {String} numericLabel
     * @returns {ReviewItem}
     */
    const extendReviewItemScope = (entry, numericLabel) => {
        const reviewItem = Object.assign({}, entry);
        const type = reviewItem.type;

        // Add properties 'numericLabel', 'icon', 'ariaLabel', 'scoreType', 'status'
        reviewItem.numericLabel = type === 'info' ? '' : `${numericLabel}`;

        reviewItem.icon = type === 'info' ? 'info' : null;

        reviewItem.ariaLabel = type === 'info' ? __('Informational item') : __('Question %s', reviewItem.numericLabel);

        reviewItem.scoreType = null;
        if (type === 'correct') {
            reviewItem.scoreType = 'correct';
        } else if (type === 'incorrect') {
            reviewItem.scoreType = 'incorrect';
        } else if (type === 'score-pending') {
            reviewItem.scoreType = 'score-pending';
        } else if (type === 'score-partial') {
            reviewItem.scoreType = 'score-partial';
        }

        if (reviewItem.unseen) {
            reviewItem.status = 'unseen';
        } else if (type !== 'info' && type !== 'skipped') {
            reviewItem.status = 'answered';
        } else {
            reviewItem.status = 'viewed';
        }

        return reviewItem;
    };

    return {
        /**
         * Refines the test runner data and builds the expected review panel map
         * @param {testMap} testMap
         * @param {Boolean} withScore
         * @returns {reviewPanelMap}
         */
        getReviewPanelMap(testMap, withScore) {
            const { parts, score, maxScore } = testMap;
            const items = new Map();
            const sections = new Map();
            let nonInformationalCount = 0;

            // rebuild the map keeping only relevant data, and sorting elements by position
            const panelMap = {
                parts: _.map(parts, part => Object.assign(extractData(part, withScore), {
                    sections: _.map(part.sections, section => {
                        const reviewSection = Object.assign(extractData(section, withScore), {
                            // must sort items by position before treating data, so we can assign accurate numericLabels
                            items: _.chain(section.items)
                                .sortBy('position')
                                .map(item => {
                                    let reviewItem = extractData(item, withScore);
                                    reviewItem.type = getItemType(item, withScore);
                                    if (reviewItem.type !== 'info') {
                                        nonInformationalCount++;
                                    }
                                    reviewItem = extendReviewItemScope(reviewItem, nonInformationalCount);
                                    items.set(item.id, reviewItem);
                                    return reviewItem;
                                })
                                .value()
                        });
                        sections.set(section.id, reviewSection);
                        return reviewSection;
                    }).sort(compareByPosition)
                })).sort(compareByPosition),
                withScore,
                items,
                sections
            };

            if (withScore) {
                Object.assign(panelMap, { score, maxScore });
            }

            return panelMap;
        }
    };
});
