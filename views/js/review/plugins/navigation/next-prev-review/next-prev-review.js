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
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'util/shortcut',
    'util/namespace',
    'tpl!taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
    'css!taoReview/review/plugins/navigation/next-prev-review/css/next-prev-review'
], function ($, _, __, hider, pluginFactory, shortcut, namespaceHelper, buttonTpl){
    'use strict';

    /**
     * The display of the next button
     */
    const buttonData = {
        control : 'next-prev-review',
        next : {
            title   : __('Go to the next item'),
            icon    : 'right',
            text    : __('Next'),
            control : 'next',
        },
        prev : {
            title   : __('Go to the previous item'),
            icon    : 'left',
            control : 'prev',
        }
    };

    // temporary due to luck of jumps in testMap
    /**
     * Get active item from the test map
     * @param {Object} map - The assessment test map
     * @returns {Object} the active item
     */
    const getItem = (map, itemIdentifier) => {
        const parts = map.parts;
        let result = {};

        _.forEach(parts, function(part) {
            const sections = part.sections;
            if (sections) {
                _.forEach(sections, function(section) {
                    const items = section.items;
                    _.forEach(items, function(item) {
                        if (item.id === itemIdentifier) {
                            result = item;
                        }
                    });
                });
            }
        });
        return result;
    };
    const getItemsCount = (map) => {
        const parts = map.parts;
        let result = 0;

        _.forEach(parts, function(part) {
            const sections = part.sections;
            if (sections) {
                _.forEach(sections, function(section) {
                    result += _.size(section.items);
                });
            }
        });
        return result;
    };
    // end temporary
    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'next-prev-review',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init() {
            const testRunner = this.getTestRunner();
            const testData = testRunner.getTestData();
            const testConfig = testData && testData.config || {};
            const pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            const testMap = testRunner.getTestMap();
            const itemsCount = getItemsCount(testMap);

            /**
             * Check if the "Next" functionality should be available or not
             */
            const canDoNext = () => {
                const context = testRunner.getTestContext();
                const item = getItem(testMap, context.itemIdentifier);

                // check TestMap if empty
                if( _.isPlainObject(testMap) && _.size(testMap) === 0){
                    return false;
                }

                // last item of the test
                if (item.position === itemsCount - 1) {
                    return false;
                }

                return true;
            };
            /**
             * Check if the "Previous" functionality should be available or not
             */
            const canDoPrevious = () => {
                const context = testRunner.getTestContext();
                const item = getItem(testMap, context.itemIdentifier);
                
                // check TestMap if empty
                if( _.isPlainObject(testMap) && _.size(testMap) === 0){
                    return false;
                }

                //first item of the test
                if (item.position === 0) {
                    return false;
                }

                return true;
            };
            //plugin behavior
            const doNext = () => {
                if (this.getState('enabled') !== false && canDoNext()) {
                    testRunner.trigger('disablenav');
                    testRunner.next();
                }
            };
            //plugin behavior
            const doPrevious = () => {
                if(this.getState('enabled') !== false && canDoPrevious()){
                    testRunner.trigger('disablenav');
                    testRunner.previous();
                }
            };
            /**
             * Enable the button
             */
            const enableButton = function enableButton (button){
                button.removeProp('disabled')
                    .removeClass('disabled');
            };
            /**
             * Disable the button
             */
            const disableButton = function disableButton (button){
                button.prop('disabled', true)
                    .addClass('disabled');
            };
            /**
             * Disable/enable Next/Prev buttons
             */
            const toggle = () => {
                if(canDoPrevious()){
                    enableButton(this.$prev);
                } else {
                    disableButton(this.$prev);
                }
                if(canDoNext()){
                    enableButton(this.$next);
                } else {
                    disableButton(this.$next);
                }
            };

            //create the button (detached)
            this.$element = $(buttonTpl(buttonData));
            this.$next =$('.review-next', this.$element);
            this.$prev =$('.review-prev', this.$element);

            //attach behavior
            this.$next.on('click', function(e){
                e.preventDefault();
                testRunner.trigger('nav-next');
            });

            //attach behavior
            this.$prev.on('click', function(e){
                e.preventDefault();
                testRunner.trigger('nav-prev');
            });

            /**
             * pluginShortcuts: {
             *  next: 'shortkey',
             *  prev: 'shortkey'
             * }
             */
            if(testConfig.allowShortcuts){
                _.forIn(pluginShortcuts, (value, key) => {
                    shortcut.add(namespaceHelper.namespaceAll(value, this.getName(), true), () => {
                        testRunner.trigger(`nav-${key}`, true);
                    }, {
                        avoidInput: true,
                        prevent: true
                    });
                });
            }

            //disabled by default
            this.disable();

            //change plugin state
            testRunner
                .on('loaditem', toggle)
                .on('enablenav', () => {
                    this.enable();
                })
                .on('disablenav', () => {
                    this.disable();
                })
                .on('hidenav', () => {
                    this.hide();
                })
                .on('shownav', () => {
                    this.show();
                })
                .on('nav-next', () => {
                    doNext();
                })
                .on('nav-prev', () => {
                    doPrevious();
                });
        },

        /**
         * Called during the runner's render phase
         */
        render() {
            //attach the element to the navigation area
            var $container = this.getAreaBroker().getPanelArea();
            $container.append(this.$element);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy() {
            shortcut.remove(`.${this.getName()}`);
            this.$element.remove();
        },

        /**
         * Enable the buttons
         */
        enable() {
            this.$element.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the buttons
         */
        disable(){
            this.$element.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the buttons
         */
        show() {
            hider.show(this.$element);
        },

        /**
         * Hide the buttons
         */
        hide() {
            hider.hide(this.$element);
        }
    });
});
