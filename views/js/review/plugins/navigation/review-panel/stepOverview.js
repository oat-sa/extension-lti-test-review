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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/autoscroll',
    'ui/component',
    'tpl!ltiTestReview/review/plugins/navigation/review-panel/tpl/stepOverview',
    'css!ltiTestReview/review/plugins/navigation/review-panel/css/step-overview.css'
], function (
    $,
    _,
    __,
    autoscroll,
    componentFactory,
    stepOverviewTpl
) {
    'use strict';

    /**
     * CSS classes involved in the review panel
     * @type {Object}
     */
    const cssClasses = {
        active: 'step-overview-item-active',
        //keyfocused: 'step-overview-item-focus'
    };

    /**
     * CSS selectors that match some particular elements
     * @type {Object}
     */
    const cssSelectors = {
        active: `.${cssClasses.active}`,
        //keyfocused: `.${cssClasses.keyfocused}`,
        navigable: '.step-overview-btn',
        itemById: (id) => `.step-overview-item[data-id="${id}"]`,
        navigableById: (id) => `.step-overview-btn[data-id="${id}"]`
    };

    /**
     * Step overview
     *
     * @param {Object} config
     * @param {Array} [config.items] - The list of entries to display
     * @returns {component}
     * @fires ready - When the component is ready to work
     * @fires click When an item is selected by the user
     */
    function stepOverviewFactory(config = {}) {
        let component;
        let activeItemId = null;

        /**
         * Selects the active item
         * @param {String|null} itemId
         */
        const selectItem = itemId => {
            // first deactivate already active elements
            component.getElement().find(cssSelectors.active)
                .removeClass(cssClasses.active);
            component.getElement().find(cssSelectors.navigable)
                .removeAttr('aria-current');

            // activate element
            if (itemId) {
                const $target = component.getElement().find(cssSelectors.itemById(itemId));
                if ($target.length) {
                    $target.addClass(cssClasses.active);
                    // finally make sure the item is visible
                    autoscroll($target, component.getElement());
                }
                const $ariaTarget = component.getElement().find(cssSelectors.navigableById(itemId));
                if ($ariaTarget.length) {
                    $ariaTarget.attr('aria-current', 'location');
                }
            }
        };

        // /**
        //  * Demo example of 'tabfocus' styling
        //  * @param {jQuery|null}  $target
        //  */
        // const setFocusStyle = $target => {
        //     component.getElement()
        //         .find(cssSelectors.keyfocused)
        //         .removeClass(cssClasses.keyfocused);

        //     if ($target && $target.length) {
        //         $target.addClass(cssClasses.keyfocused);
        //     }
        // };

        /**
         * Apply a callback on each navigable element
         * @param {*} callback
         */
        const eachNavigable = callback => {
            component.getElement()
                .find(cssSelectors.navigable)
                .each(callback);
        };

        /**
         * Enables the keyboard navigation using 'tab' keys
         */
        const enableKeyboard = () => {
            eachNavigable((index, el) => el.removeAttribute('tabindex'));
        };

        /**
         * Disables the keyboard navigation using 'tab' keys
         */
        const disableKeyboard = () => {
            eachNavigable((index, el) => el.setAttribute('tabindex', -1));
        };

        /**
         * Emits the itemchange event with respect to the current active item
         * @param {String} itemId
         */
        const onClick = (itemId) => {
            /**
             * @event click
             * @param {String} itemId
             * @param {Number} position
             */
            component.trigger('click', {id: itemId});
        };

        /**
         * Defines the stepOverview API
         * @type {stepOverview}
         */
        const api = {
            /**
             * Sets the active item
             * @param {String} itemId
             * @returns {stepOverview}
             * @fires active for each activated element
             */
            setActiveItem(itemId) {
                activeItemId = itemId;
                if (this.is('rendered')) {
                    selectItem(itemId);
                }
                return this;
            }
        };

        /**
         * @typedef {component} stepOverview
         */
        component = componentFactory(api, {})
            // set the component's layout
            .setTemplate(stepOverviewTpl)
            // renders the component
            .on('render', function onStepOverviewRender() {
                //Demo example of 'tabfocus' detection
                // this.getElement().on('keydown', cssSelectors.navigable, e => {
                //     if (e.key === 'Tab') {
                //         setFocusStyle(null);
                //     }
                // });
                // this.getElement().on('keyup', cssSelectors.navigable, e => {
                //     if (e.key === 'Tab') {
                //         setFocusStyle($(e.target));
                //     }
                // });

                component.getElement().on('click', cssSelectors.navigable, e => {
                    if (!this.is('disabled')) {
                        onClick(e.currentTarget.dataset.id);
                    }
                });

                selectItem(activeItemId);

                if (!this.is('disabled')) {
                    enableKeyboard();
                } else {
                    disableKeyboard();
                }

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // reflect enable/disabled state
            .on('enable', () => enableKeyboard)
            .on('disable', () => disableKeyboard);

        // initialize the component with the provided config:
        // config also contains data passed to template when rendering
        component.init(config);

        return component;
    }

    return stepOverviewFactory;
});
