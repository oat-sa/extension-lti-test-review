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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Navigation Plugin : Next and Previous
 *
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'util/shortcut',
    'util/namespace',
    'core/promiseTimeout',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/map',
    'taoReview/review/plugins/navigation/next-prev/buttons'
], function (
    _,
    shortcut,
    namespaceHelper,
    promiseTimeout,
    pluginFactory,
    mapHelper,
    buttonsFactory
) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name: 'next-prev',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init() {
            const testRunner = this.getTestRunner();
            const testConfig = testRunner.getConfig();
            const pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            /**
             * pluginShortcuts: {
             *  next: 'shortkey',
             *  prev: 'shortkey'
             * }
             */
            if (testConfig.allowShortcuts) {
                Object.keys(pluginShortcuts).forEach(key => {
                    shortcut.add(
                        namespaceHelper.namespaceAll(pluginShortcuts[key], this.getName(), true),
                        () => testRunner.trigger(`nav-${key}`, true),
                        {
                            avoidInput: true,
                            prevent: true
                        }
                    );
                });
            }

            // disabled by default
            this.disable();

            //change plugin state
            testRunner
                .on('enablenav', () => this.enable())
                .on('disablenav', () => this.disable())
                .on('hidenav', () => this.hide())
                .on('shownav', () => this.show())
                .on('destroy', () => shortcut.remove(`.${this.getName()}`));
        },

        /**
         * Called during the runner's render phase
         */
        render() {
            return promiseTimeout(new Promise(resolve => {
                const testRunner = this.getTestRunner();
                const buttons = buttonsFactory(this.getAreaBroker().getNavigationArea());

                /**
                 * Get the amount of navigable items
                 * @returns {Number}
                 */
                const getItemsCount = () => (mapHelper.getJumps(testRunner.getTestMap()) || []).length;

                /**
                 * Check if the "Next" functionality should be available or not
                 * @returns {Boolean}
                 */
                const canDoNext = () => {
                    const itemsCount = getItemsCount();
                    const context = testRunner.getTestContext();
                    return itemsCount && context.itemPosition < itemsCount - 1;
                };

                /**
                 * Check if the "Previous" functionality should be available or not
                 * @returns {Boolean}
                 */
                const canDoPrevious = () => {
                    const itemsCount = getItemsCount();
                    const context = testRunner.getTestContext();
                    return itemsCount && context.itemPosition;
                };

                /**
                 * Plugin behavior: move forward
                 */
                const doNext = () => {
                    if (this.getState('enabled') !== false && canDoNext()) {
                        testRunner.trigger('disablenav');
                        testRunner.next();
                    }
                };

                /**
                 * Plugin behavior: move backward
                 */
                const doPrevious = () => {
                    if (this.getState('enabled') !== false && canDoPrevious()) {
                        testRunner.trigger('disablenav');
                        testRunner.previous();
                    }
                };

                /**
                 * Disable/enable Next/Prev buttons
                 */
                const toggle = () => {
                    buttons.toggleButton('prev', canDoPrevious());
                    buttons.toggleButton('next', canDoNext());
                };

                // control the test runner from the navigation buttons
                buttons
                    .on('click', btn => testRunner.trigger(`nav-${btn}`))
                    .on('ready', () => {
                        if (this.getState('enabled') === false) {
                            buttons.disable();
                        }
                        resolve();
                    });

                // reflect the test runner state to the navigation buttons and performs the navigation on demand
                testRunner
                    .on('loaditem', toggle)
                    .on('nav-next', doNext)
                    .on('nav-prev', doPrevious)
                    .on(`plugin-show.${this.getName()}`, () => buttons.show())
                    .on(`plugin-hide.${this.getName()}`, () => buttons.hide())
                    .on(`plugin-enable.${this.getName()}`, () => buttons.enable())
                    .on(`plugin-disable.${this.getName()}`, () => buttons.disable())
                    .on(`plugin-destroy.${this.getName()}`, () => buttons.destroy());
            }));
        }
    });
});
