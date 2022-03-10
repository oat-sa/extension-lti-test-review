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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'core/promiseTimeout',
    'taoTests/runner/plugin',
    'ltiTestReview/review/services/navigation-data',
    'ltiTestReview/review/plugins/navigation/review-panel/accordionPanel',
    'ltiTestReview/review/plugins/navigation/review-panel/fizzyPanel'
], function (
    promiseTimeout,
    pluginFactory,
    navigationDataServiceFactory,
    accordionReviewPanelFactory,
    fizzyReviewPanelFactory,
) {
    'use strict';

    const filters = {
        /**
         * No filter, keep all items
         * @returns {Boolean}
         */
        all() {
            return true;
        },

        /**
         * Filter for incorrect items
         * @param {mapEntry} item
         * @returns {Boolean}
         */
        incorrect(item) {
            return !item.informational && (!item.maxScore || item.score !== item.maxScore);
        }
    };

    /**
     * Test Review Plugin : Review Panel
     * Displays a navigation panel allowing to see the whole test structure and give access to each element
     */
    return pluginFactory({
        name: 'review-panel',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init() {
            this.getTestRunner()
                .on('enablenav', () => this.enable())
                .on('disablenav', () => this.disable());
        },

        /**
         * Called during the runner's render phase
         * @returns {Promise}
         */
        render() {
            return promiseTimeout(new Promise(resolve => {
                const testRunner = this.getTestRunner();
                const navigationDataService = navigationDataServiceFactory(testRunner.getTestMap());

                const { showScore, showCorrect, displaySectionTitles, reviewLayout, displayItemTooltip } =
                    testRunner.getOptions();

                const reviewPanelFactory =
                    reviewLayout === 'fizzy' ? fizzyReviewPanelFactory : accordionReviewPanelFactory;

                const reviewPanelConfig = Object.assign(
                    {
                        showScore,
                        showCorrect,
                        displaySectionTitles,
                        displayItemTooltip
                    },
                    this.getConfig()
                );

                const reviewPanel = reviewPanelFactory(
                    this.getAreaBroker().getPanelArea(),
                    reviewPanelConfig,
                    navigationDataService.getMap()
                );

                // control the test runner from the review panel
                reviewPanel
                    .on('filterchange', filterId => navigationDataService.filterMap(filters[filterId]))
                    .on('itemchange', (itemRef, position) => testRunner.jump(position, 'item'))
                    .on('ready', resolve);

                // reflect the filter to the map
                navigationDataService
                    .on('mapfilter', filteredMap => testRunner.setTestMap(filteredMap));

                // reflect the test runner state to the review panel
                testRunner
                    .on('testmapchange', testMap => reviewPanel.setData(testMap))
                    .on('loaditem', itemRef => reviewPanel.setActiveItem(itemRef))
                    .on(`plugin-show.${this.getName()}`, () => reviewPanel.show())
                    .on(`plugin-hide.${this.getName()}`, () => reviewPanel.hide())
                    .on(`plugin-enable.${this.getName()}`, () => reviewPanel.enable())
                    .on(`plugin-disable.${this.getName()}`, () => reviewPanel.disable())
                    .on('destroy', () => reviewPanel.destroy());
            }));
        }
    });
});
