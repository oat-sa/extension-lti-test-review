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
    'ui/component',
    'ui/tabs',
    'tpl!taoReview/review/plugins/content/item-answer/tpl/tabs'
], function (_, componentFactory, tabsFactory, componentTpl) {
    'use strict';

    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        // ...
    };

    /**
     * Builds a component
     *
     * @example
     *  const container = $();
     *  const config = {
     *      // ...
     *  };
     *  const component = reviewTabsFactory(container, config)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {Object} config
     * @returns {component}
     * @fires ready - When the component is ready to work
     */
    function reviewTabsFactory(container, config) {
        let controls = null;
        const api = {
            setData() {
                // ...
            },

            getData() {
                // ...
            }
        };
        const component = componentFactory(api, defaults)
        // set the component's layout
            .setTemplate(componentTpl)

            // auto render on init
            .on('init', function onReviewTabsInit() {
                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onReviewTabsRender() {
                // do something

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // free resources on dispose
            .on('destroy', function onReviewTabsDestroy() {
                controls = null;
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => component.init(config));

        return component;
    }

    return reviewTabsFactory;
});
