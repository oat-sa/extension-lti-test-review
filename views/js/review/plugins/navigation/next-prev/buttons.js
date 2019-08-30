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
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoReview/review/plugins/navigation/next-prev/tpl/buttons',
    'css!taoReview/review/plugins/navigation/next-prev/css/buttons'
], function (_, __, componentFactory, buttonsTpl) {
    'use strict';

    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        buttons: [{
            title: __('Go to the next item'),
            cls: 'right',
            icon: 'right',
            text: __('Next'),
            control: 'next'
        },{
            title: __('Go to the previous item'),
            icon: 'left',
            control: 'prev'
        }]
    };

    /**
     * Builds a component
     *
     * @example
     *  const container = $();
     *  const config = {
     *      buttons: [{
     *          icon: 'left',
     *          text: 'Previous',
     *          control: 'prev'
     *      }, {
     *          icon: 'right',
     *          cls: 'right',
     *          text: 'Next',
     *          control: 'next'
     *      }]
     *  };
     *  const component = buttonsFactory(container, config)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {Object} config
     * @returns {component}
     * @fires ready - When the component is ready to work
     */
    function buttonsFactory(container, config) {
        const disabledButtons = new Map();

        const enableElement = $el => $el.prop('disabled', false);
        const disableElement = $el => $el.prop('disabled', true);

        const api = {
            /**
             * Disables a button
             * @param {String} btn
             * @returns {buttons}
             * * @fires disable-button
             */
            disableButton(btn) {
                disabledButtons.set(btn, btn);
                if (this.is('rendered') && !this.is('disabled')) {
                    disableElement(this.getElement().find(`[data-control="${btn}"]`));
                }

                /**
                 * @event disable-button
                 * @param {Object} control
                 */
                this.trigger('disable-button', btn);
                return this;
            },

            /**
             * Enables a button
             * @param {String} btn
             * @returns {buttons}
             * @fires enable-button
             */
            enableButton(btn) {
                disabledButtons.delete(btn);
                if (this.is('rendered') && !this.is('disabled')) {
                    enableElement(this.getElement().find(`[data-control="${btn}"]`));
                }

                /**
                 * @event enable-button
                 * @param {Object} control
                 */
                this.trigger('enable-button', btn);
                return this;
            },

            /**
             * Enables or disables a button
             * @param {String} btn
             * @param {Boolean|null} state - Force enable (`true`) or disable (`false`). By default auto select.
             * @returns {buttons}
             * @fires enable-button
             * @fires disable-button
             */
            toggleButton(btn, state = null) {
                if (state === null) {
                    state = disabledButtons.has(btn);
                }
                if (state) {
                    this.enableButton(btn);
                } else {
                    this.disableButton(btn);
                }
                return this;
            }
        };
        const component = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(buttonsTpl)

            // auto render on init
            .on('init', function onButtonsInit() {
                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onButtonsRender() {
                this.getElement().on('click', '.action', e => {
                    const control = e.currentTarget.dataset.control;
                    if (control && !this.is('disabled') && !disabledButtons.has(control)) {
                        e.currentTarget.classList.add('active');
                        /**
                         * @event click
                         * @param {Object} control
                         */
                        this.trigger('click', control);
                    }
                });

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // take care of the disable state
            .on('disable', function onButtonDisable() {
                if (this.is('rendered')) {
                    disableElement(this.getElement().find('[data-control]'));
                }
            })
            .on('enable', function onButtonEnable() {
                if (this.is('rendered')) {
                    this.getElement()
                        .find('[data-control]')
                        .each((index, el) => {
                            const control = el.dataset.control;
                            if (!disabledButtons.has(control)) {
                                el.disabled = false;
                            }
                            if (el.classList.contains('active')) {
                                if (!disabledButtons.has(control)) {
                                    el.focus();
                                }
                                el.classList.remove('active');
                            }
                        });
                }
            })

            // free resources on dispose
            .on('destroy', () => {
                disabledButtons.clear();
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => component.init(config));

        return component;
    }

    return buttonsFactory;
});
