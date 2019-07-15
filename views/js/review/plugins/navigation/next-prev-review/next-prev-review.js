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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation',
    'util/shortcut',
    'util/namespace',
    'tpl!taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
    'css!taoReview/review/plugins/navigation/next-prev-review/css/next-prev-review'
], function ($, _, __, hider, pluginFactory, mapHelper, navigationHelper, shortcut, namespaceHelper, buttonTpl){
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

    /**
     * Create the buttons
     * @returns {jQueryElement} the button
     */
    const createElement = function createElement(){
        return $(buttonTpl(buttonData));
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'next-prev-review',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            const testRunner = this.getTestRunner();
            const testData = testRunner.getTestData();
            const testConfig = testData.config || {};
            const pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            /**
             * Check if the "Next" functionality should be available or not
             */
            const canDoNext = function canDoNext() {
                const testMap = testRunner.getTestMap();
                const context = testRunner.getTestContext();

                // check TestMap if empty
                if( _.isPlainObject(testMap) && _.size(testMap) === 0){
                    return false;
                }

                //first item of the test
                if (navigationHelper.isLast(testMap, context.itemIdentifier)) {
                    return false;
                }

                return true;
            };
            /**
             * Check if the "Previous" functionality should be available or not
             */
            const canDoPrevious = function canDoPrevious() {
                const testMap = testRunner.getTestMap();
                const context = testRunner.getTestContext();
                let previousSection;
                let previousPart;

                // check TestMap if empty
                if( _.isPlainObject(testMap) && _.size(testMap) === 0){
                    return false;
                }

                //first item of the test
                if (navigationHelper.isFirst(testMap, context.itemIdentifier)) {
                    return false;
                }

                //first item of a section
                if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'section')) {

                    //when entering an adaptive section,
                    //you can't leave the section from the beginning
                    if(context.isCatAdaptive){
                        return false;
                    }

                    //if the previous section is adaptive or a timed section
                    previousSection = mapHelper.getItemSection(testMap, context.itemPosition - 1);
                    if(previousSection.isCatAdaptive || (previousSection.timeConstraint && !context.options.noExitTimedSectionWarning) ){
                        return false;
                    }
                }

                if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'part')) {

                    //if the previous part is linear, we don't enter it too
                    previousPart = mapHelper.getItemPart(testMap, context.itemPosition - 1);
                    if(previousPart.isLinear){
                        return false;
                    }

                }
                return context.isLinear === false && context.canMoveBackward === true;
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
            this.$element = createElement();
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
