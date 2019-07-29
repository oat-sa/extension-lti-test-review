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
     * @typedef {Object} reviewPanelElement
     * @property {String} id - The element identifier
     * @property {String} label - The displayed label
     */

    /**
     * @typedef {reviewPanelElement} reviewPanelItem
     * @property {Number} position - The position of the item within the test
     * @property {Number} score - The test taker's score for this item
     * @property {Number} maxScore - The max possible score for this item
     */

    /**
     * @typedef {reviewPanelElement} reviewPanelSection
     * @property {reviewPanelItem[]} items - The list of items contained in the section
     */

    /**
     * @typedef {reviewPanelElement} reviewPanelPart
     * @property {reviewPanelSection[]} sections - The list of sections contained in the test part
     */

    /**
     * @typedef {Object} reviewPanelData
     * @property {reviewPanelPart[]} parts - The list of test parts to display
     */

    /**
     * @typedef {reviewPanelElement} reviewPanelFilter
     * @property {String} title - The tooltip displayed on mouse over
     * @property {Function<item, section, part>} [filter] - A callback function applied to filter the data
     */


    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        headerLabel: __('TEST SCORE:'),
        footerLabel: __('TOTAL'),
        filters: [{
            id: 'all',
            label: __('All'),
            title: __('Show all items')
        }, {
            id: 'incorrect',
            label: __('Incorrect'),
            title: __('Show incorrect items only'),
            filter(item) {
                return item.score !== item.maxScore;
            }
        }]
    };

    /**
     * Builds a review panel, that will show the test data with score.
     *
     * @example
     *  const container = $();
     *  const config = {
     *      // ...
     *  };
     *  const data = {
     *      parts: [{
     *          id: 'part-1',
     *          label: 'Part 1',
     *          sections: [{
     *              id: 'section-1',
     *              label: 'Section 1',
     *              items: [{
     *                  id: 'item-1',
     *                  label: 'Item 1',
     *                  position: 0,
     *                  score: 2,
     *                  maxScore: 2
     *              }]
     *          }]
     *      }]
     *  };
     *  const component = reviewPanelFactory(container, config)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {Object} config
     * @param {String} [config.headerLabel] - Header label
     * @param {String} [config.footerLabel] - Footer label
     * @param {reviewPanelFilter[]} [config.filters] - The list of available filters
     * @param {reviewPanelData|null} data
     * @returns {component}
     * @fires ready - When the component is ready to work
     * @fires filterchange When the active filter has changed
     * @fires datachange When the panel data has changed
     * @fires update When the navigation panel has been updated
     */
    function reviewPanelFactory(container, config = {}, data = null) {
        let controls = null;
        let activeFilter = null;
        let activeItem = null;
        /**
         * Selects the active filter
         * @param {String} filterId
         */
        const selectFilter = filterId => {
            controls.$filters
                .removeClass('active')
                .filter(`[data-control="${filterId}"]`)
                .addClass('active');
        };

        /**
         * Gets the icon class for a particular item
         * @param {reviewPanelItem} item
         * @returns {String}
         */
        const getItemIconCls = item => {
            if (item.maxScore) {
                if (item.score === item.maxScore) {
                    return 'item-correct';
                } else {
                    return 'item-incorrect';
                }
            }
            return 'item-info';
        };

        /**
         * Refines the data to display the panel with respect to the current filter
         * @returns {Object}
         */
        const filterData = () => {
            let score = 0;
            let maxScore = 0;
            const testMap = {
                parts: (data && data.parts || []).reduce((parts, part) => {
                    part = Object.assign({}, part);
                    part.sections = (part.sections || []).reduce((sections, section) => {
                        section = Object.assign({}, section);
                        section.items = (section.items || []).reduce((items, item) => {
                            item = Object.assign({}, item);
                            item.cls = getItemIconCls(item);

                            score += item.score || 0;
                            maxScore += item.maxScore || 0;

                            if (!activeFilter || !activeFilter.filter || activeFilter.filter(item, section, part)) {
                                items.push(item);
                            }

                            return items;
                        }, []);

                        if (section.items.length) {
                            sections.push(section);
                        }

                        return sections;
                    }, []);

                    if (part.sections.length) {
                        parts.push(part);
                    }

                    return parts;
                }, [])
            };
            return {
                testMap,
                percentScore: `${Math.floor(100 * score / maxScore) || 0}%`,
                overallScore: `${score}/${maxScore}`
            };
        };

        /**
         * Defines the reviewPanel API
         * @type {reviewPanel}
         */
        const api = {
            /**
             * Gets the panel data
             * @returns {reviewPanelData}
             */
            getData() {
                return data;
            },

            /**
             * Sets the panel data
             * @param {reviewPanelData} newData
             * @returns {reviewPanel}
             * @fires datachange
             */
            setData(newData) {
                data = newData;

                /**
                 * @event datachange
                 * @param {reviewPanelData} data
                 */
                this.trigger('datachange', data);

                return this;
            },

            /**
             * Gets the active filter
             * @returns {reviewPanelFilter|null}
             */
            getActiveFilter() {
                return activeFilter;
            },

            /**
             * Sets the active filter
             * @param {String} filterId
             * @returns {reviewPanel}
             */
            setActiveFilter(filterId) {
                const {filters} = this.getConfig();
                const foundFilter = filters.find(filter => filter.id === filterId);
                if (foundFilter) {
                    activeFilter = foundFilter;

                    if (this.is('rendered')) {
                        selectFilter(filterId);
                        this.update();
                    }

                    /**
                     * @event filterchange
                     * @param {String} filterId
                     */
                    this.trigger('filterchange', filterId);
                }

                return this;
            },

            /**
             * Gets the active item
             * @returns {reviewPanelItem|null}
             */
            getActiveItem() {
                return activeItem;
            },

            /**
             * Sets the active item
             * @param {String} itemId
             * @returns {reviewPanel}
             */
            setActiveItem(itemId) {
                // ...
                return this;
            },

            /**
             * Expands all the blocks from the given id and upper
             * @param {String} id
             * @returns {reviewPanel}
             */
            expand(id) {
                if (this.is('rendered')) {
                    // ...
                }
                return this;
            },

            /**
             * Collapse all the blocks
             * @returns {reviewPanel}
             */
            collapse() {
                if (this.is('rendered')) {
                    // ...
                }
                return this;
            },

            /**
             * Update the displayed list
             * @returns {reviewPanel}
             * @fires update once the display has been updated
             */
            update() {
                if (this.is('rendered')) {
                    const filteredData = filterData();
                    controls.$content.html(listTpl(filteredData.testMap));
                    controls.$headerScore.text(filteredData.percentScore);
                    controls.$footerScore.text(filteredData.overallScore);

                    /**
                     * @event update
                     * @param {reviewPanelData} filteredData
                     */
                    this.trigger('update', filteredData);
                }

                return this;
            }
        };

        /**
         * @typedef {component} reviewPanel
         */
        const component = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(panelTpl)

            // auto render on init
            .on('init', function onReviewPanelInit() {
                const initConfig = this.getConfig();
                const {headerLabel, footerLabel, filters} = initConfig;

                // setup the header
                if (headerLabel) {
                    initConfig.header = {
                        label: headerLabel,
                        score: '0%'
                    };
                }

                // setup the footer
                if (footerLabel) {
                    initConfig.footer = {
                        label: footerLabel,
                        score: '0/0'
                    };
                }

                // select the first filter if none is active
                if (!activeFilter && Array.isArray(filters)) {
                    activeFilter = filters.find(filter => filter.label);
                }

                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onReviewPanelRender() {
                controls = {
                    $headerScore: this.getElement().find('.review-panel-header .review-panel-score'),
                    $footerScore: this.getElement().find('.review-panel-footer .review-panel-score'),
                    $filtersContainer: this.getElement().find('.review-panel-filters'),
                    $filters: this.getElement().find('.review-panel-filter'),
                    $content: this.getElement().find('.review-panel-content'),
                };

                // change filter on click
                controls.$filtersContainer.on('click', '.review-panel-filter', e => {
                    this.setActiveFilter(e.currentTarget.dataset.control);
                });

                controls.$content.on('click', '.review-panel-label', e => {
                    controls.$content.find('.active').removeClass('active');
                    e.currentTarget.parentElement.classList.toggle('expanded');
                    $(e.currentTarget).parentsUntil('.review-panel-list').addClass('active');
                });

                if (activeFilter) {
                    selectFilter(activeFilter.id);
                }

                this.update();

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // data update
            .on('datachange', function onReviewPanelDataChange() {
                this.update();
            })

            // free resources on dispose
            .on('destroy', function onReviewPanelDestroy() {
                controls = null;
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => component.init(config));

        return component;
    }

    return reviewPanelFactory;
});
