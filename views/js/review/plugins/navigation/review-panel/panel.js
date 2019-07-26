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
    'handlebars',
    'ui/component',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/panel',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/list',
    'css!taoReview/review/plugins/navigation/review-panel/css/panel.css'
], function ($, _, __, Handlebars, componentFactory, panelTpl, listTpl) {
    'use strict';

    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        header: {
            label: __('TEST SCORE:')
        },
        filters: [{
            id: 'all',
            label: __('All'),
            title: __('Show all items')
        }, {
            id: 'incorrect',
            label: __('Incorrect'),
            title: __('Show incorrect items only')
        }],
        footer: {
            label: __('TOTAL')
        }
    };

    /**
     * Builds a review panel, that will show the test map with score.
     *
     * @example
     *  const container = $();
     *  const config = {
     *      // ...
     *  };
     *  const component = reviewPanelFactory(container, config)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {Object} config
     * @returns {component}
     * @fires ready - When the component is ready to work
     */
    function reviewPanelFactory(container, config) {
        let controls = null;
        let activeFilter = null;

        const api = {
            // defines some additional API
            update() {
                // ...
            },
            filterBy() {
                // ...
            },
            getActive() {
                // ...
            },
            setActive() {
                // ...
            },
            expand() {
                // ...
            },
            collapse() {
                // ...
            }
        };
        const component = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(panelTpl)

            // auto render on init
            .on('init', function onMyComponentInit() {
                //
                const {header, footer, filters} = this.getConfig();

                if (header) {
                    header.score = header.score || '0%';
                }
                if (footer) {
                    footer.score = footer.score || '0/0';
                }

                activeFilter = filters.find(filter => filter.active);
                if (!activeFilter) {
                    activeFilter = filters.find(filter => filter.label);
                    if (activeFilter) {
                        activeFilter.active = true;
                    }
                }

                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onMyComponentRender() {
                controls = {
                    $headerScore: this.getElement().find('.review-panel-header .review-panel-score'),
                    $footerScore: this.getElement().find('.review-panel-footer .review-panel-score'),
                    $filters: this.getElement().find('.review-panel-filters'),
                    $content: this.getElement().find('.review-panel-content'),
                };

                controls.$content.on('click', '.review-panel-label', e => {
                    controls.$content.find('.active').removeClass('active');
                    e.currentTarget.parentElement.classList.toggle('expanded');
                    $(e.currentTarget).parentsUntil('.review-panel-list').addClass('active');
                });

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // free resources on dispose
            .on('destroy', function onMyComponentDestroy() {
                controls = null;
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => component.init(config));

        return component;
    }

    // expose a partial that can be used from inside the panel view
    Handlebars.registerPartial('tao-review-panel-list', listTpl);

    return reviewPanelFactory;
});
