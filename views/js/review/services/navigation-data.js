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
 * Service managing the test map, allowing to filter it and listen to change/filter events
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'core/eventifier',
    'taoQtiTest/runner/helpers/map'
], function (_, eventifier, mapHelper) {
    'use strict';

    /**
     * @typedef {Object} scoredEntry
     * @property {Number} score - The test taker's score for this item
     * @property {Number} maxScore - The max possible score for this item
     */

    /**
     * @typedef {scoredEntry} mapEntry
     * @property {String} id - The element identifier
     * @property {String} label - The displayed label
     * @property {Number} position - The position of the item within the test
     * @property {Boolean} [informational] - If the item is informational
     * @property {Boolean} [skipped] - If the item has been skipped
     */

    /**
     * Makes sure the score is computed on a collection
     * @param {Object|Array} collection
     * @param {String} property
     * @returns {scoredEntry}
     */
    const computeScore = (collection, property) => {
        let score = 0;
        let maxScore = 0;
        return {
            [property]: _.mapValues(collection, item => {
                item.score = item.score || 0;
                item.maxScore = item.maxScore || 0;

                score += item.score;
                maxScore += item.maxScore;

                return item;
            }),
            score,
            maxScore
        };
    };

    /**
     * Manages the test map in order to allow to filter it.
     * Refines the test map to provide the dataset expected by the review panel
     *
     * @example
     *  // initialize with a test map
     *  const navigationDataService = navigationDataServiceFactory(testMap);
     *
     *  // the service can also be created empty
     *  const navigationDataService = navigationDataServiceFactory();
     *  // and a test map set later
     *  navigationDataService.setMap(testMap);
     *
     *  // changes on test map can be listened
     *  navigationDataService.on('mapchange', testMap => {}); // test map rewritten
     *  navigationDataService.on('mapfilter', testMap => {}); // test map filtered
     *
     *  // get the stored test map
     *  const map = navigationDataService.getMap();
     *
     *  // filter the map by informational items
     *  navigationDataService.filterMap(item => item.informational);
     *
     *  // get the current filtered test map
     *  const filteredMap = navigationDataService.getFilteredMap();
     *
     * @param {testMap} testMap
     * @returns {navigationDataService}
     * @fires mapchange each time the testMap is changed
     * @fires mapfilter each time the testMap is filtered
     */
    function navigationDataServiceFactory(testMap = {}) {
        let filteredTestMap;

        /**
         * @typedef {Object} navigationDataService
         */
        const navigationDataService = {
            /**
             * Gets the test map
             * @returns {testMap}
             */
            getMap() {
                return testMap;
            },

            /**
             * Gets the filtered test map
             * @returns {testMap}
             */
            getFilteredMap() {
                return filteredTestMap;
            },

            /**
             * Sets the former test map
             * @param {testMap} map
             * @returns {navigationDataService}
             * @fires mapchange once the test map has been stored
             */
            setMap(map) {
                testMap = this.computeMap(map);

                /**
                 * @event mapchange
                 * @param {testMap} testMap
                 */
                this.trigger('mapchange', testMap);

                this.filterMap();

                return this;
            },

            /**
             * Filters the former map by the provider filter callback.
             * Any item for which the filter returns true will be kept.
             * Empty sections and empty parts will be discarded.
             * @param {Function} filter - A filter callback that should return truey to keep the passed on item,
             *                            or should return falsey to reject it.
             * @returns {navigationDataService}
             * @throws TypeError when the filter is not a function
             * @fires mapfilter once the test map has been filtered
             */
            filterMap(filter = () => true) {
                if (!_.isFunction(filter)) {
                    throw new TypeError('A filter must be a function!');
                }

                // filter the test map, only keeping the items that pass the filter callback
                filteredTestMap = Object.assign({}, testMap, {
                    parts: _.reduce(testMap.parts, (parts, part, partId) => {
                        part = Object.assign({}, part, {
                            sections: _.reduce(part.sections, (sections, section, sectionId) => {
                                section = Object.assign({}, section, {
                                    items: _.pick(section.items, filter)
                                });

                                if (_.size(section.items)) {
                                    sections[sectionId] = section;
                                }

                                return sections;
                            }, {})
                        });

                        if (_.size(part.sections)) {
                            parts[partId] = part;
                        }

                        return parts;
                    }, {})
                });

                // make sure the jumps table is set accordingly
                mapHelper.createJumpTable(filteredTestMap);

                /**
                 * @event mapfilter
                 * @param {testMap} filteredTestMap
                 */
                this.trigger('mapfilter', filteredTestMap);

                return this;
            },

            /**
             * Computes some properties in the test map, like the score.
             * @param {testMap} map
             * @returns {testMap}
             */
            computeMap(map = {}) {
                // rebuild the map computing the score
                return Object.assign({}, map,
                    computeScore(_.mapValues(map.parts || {}, part => Object.assign({}, part,
                        computeScore(_.mapValues(part.sections || {}, section => Object.assign({}, section,
                            computeScore(section.items || {}, 'items')
                        )), 'sections')
                    )), 'parts')
                );
            }
        };

        // we need to observe the service
        eventifier(navigationDataService);

        // initial test map must be set if any
        if (testMap) {
            navigationDataService.setMap(testMap);
        }

        return navigationDataService;
    }

    return navigationDataServiceFactory;
});
