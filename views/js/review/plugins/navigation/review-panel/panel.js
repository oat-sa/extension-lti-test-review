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
    'ui/hider',
    'ui/component',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/panel',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/list',
    'css!taoReview/review/plugins/navigation/review-panel/css/panel.css'
], function ($, _, __, hider, componentFactory, panelTpl, listTpl) {
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
     * @typedef {Object} reviewPanelMap
     * @property {reviewPanelPart[]} parts - The list of test parts to display
     */

    /**
     * @typedef {Object} reviewPanelData
     * @property {reviewPanelMap} testMap - The test map
     * @property {Number} score - The test taker's score for the test
     * @property {Number} maxScore - The max possible score for the test
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
     * CSS classes involved in the review panel
     * @type {Object}
     */
    const cssClasses = {
        collapsible: 'collapsible',
        expanded: 'expanded',
        active: 'active'
    };

    /**
     * CSS selectors that match some particular elements
     * @type {Object}
     */
    const cssSelectors = {
        collapsible: `.${cssClasses.collapsible}`,
        collapsibleLabel: `.${cssClasses.collapsible} > .review-panel-label`,
        expanded: `.${cssClasses.expanded}`,
        active: `.${cssClasses.active}`,
        item: '.review-panel-item'
    };

    /**
     * Finds an element by its control identifier
     * @param {jQuery} $container
     * @param {String} id
     * @returns {jQuery}
     */
    const findControl = ($container, id) => $container.find(`[data-control="${id}"]`);

    /**
     * Finds every expanded collapsible element within the provided target
     * @param {jQuery} $target
     * @returns {jQuery}
     */
    const findExpanded = $target => $target.find(cssSelectors.collapsible + cssSelectors.expanded);

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
     * Reduces an array to another array
     * @param {Array} array
     * @param {Function} callback
     * @returns {Array}
     */
    const reduceArray = (array, callback) => (array || []).reduce(callback, []);

    /**
     * Refines the data to display the panel with respect to the current filter
     * @param {reviewPanelMap} map
     * @param {Function} [filter] - A callback function applied to filter the data
     * @returns {reviewPanelData}
     */
    const filterData = (map, filter) => {
        let score = 0;
        let maxScore = 0;
        if (!_.isFunction(filter)) {
            filter = () => true;
        }
        return {
            testMap: {
                parts: reduceArray(map && map.parts, (testParts, testPart) => {
                    const sections = reduceArray(testPart.sections, (partSections, partSection) => {
                        const items = reduceArray(partSection.items, (sectionItems, sectionItem) => {
                            sectionItem = Object.assign({}, sectionItem);
                            sectionItem.cls = getItemIconCls(sectionItem);

                            score += sectionItem.score || 0;
                            maxScore += sectionItem.maxScore || 0;

                            if (filter(sectionItem, partSection, testPart)) {
                                sectionItems.push(sectionItem);
                            }

                            return sectionItems;
                        });

                        if (items.length) {
                            partSections.push(Object.assign({}, partSection, {items}));
                        }

                        return partSections;
                    });

                    if (sections.length) {
                        testParts.push(Object.assign({}, testPart, {sections}));
                    }

                    return testParts;
                })
            },
            score,
            maxScore
        };
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
     * @param {reviewPanelMap|null} map
     * @returns {component}
     * @fires ready - When the component is ready to work
     * @fires filterchange When the active filter has changed
     * @fires datachange When the panel data has changed
     * @fires update When the navigation panel has been updated
     */
    function reviewPanelFactory(container, config = {}, map = null) {
        let controls = null;
        let activeFilter = null;
        let activeItem = null;
        let data = filterData(map);

        /**
         * Selects the active filter
         * @param {String} filterId
         */
        const selectFilter = filterId => {
            controls.$filters
                .removeClass(cssClasses.active)
                .filter(`[data-control="${filterId}"]`)
                .addClass(cssClasses.active);
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
             * @param {reviewPanelMap} newMap
             * @returns {reviewPanel}
             * @fires datachange
             */
            setData(newMap) {
                map = newMap;
                data = filterData(newMap);

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
             * Expands all the blocks from the given identifier and above
             * @param {String} id
             * @returns {reviewPanel}
             * @fires expand for each expanded block
             */
            expand(id) {
                if (this.is('rendered')) {
                    const $target = findControl(controls.$content, id);

                    if ($target.length) {
                        // first, collapse all expanded blocks
                        this.collapse();

                        // then expand the target and its parents
                        // also expand first child blocks
                        let $collapsed = $target.parentsUntil(controls.$content, cssSelectors.collapsible)
                            .add($target.find(cssSelectors.collapsible).filter(':first-child'));

                        if ($target.is(cssSelectors.collapsible)) {
                            $collapsed = $collapsed.add($target);
                        }

                        $collapsed.each((index, el) => {
                            el.classList.add(cssClasses.expanded);

                            /**
                             * @event expand
                             * @param {String} id - the identifier of the expanded element
                             */
                            this.trigger('expand', el.dataset.control);
                        });
                    }
                }

                return this;
            },

            /**
             * Collapse all the blocks from the given identifier and below
             * @param {String|null} [id] - The identifier og the block to collapse. If none, all blocks will be targeted.
             * @returns {reviewPanel}
             * @fires collapse for each collapsed block
             */
            collapse(id = null) {
                if (this.is('rendered')) {
                    let $expanded = null;

                    // select the elements to collapse
                    if (id) {
                        // only the expanded elements that belong to the provided identifier
                        const $target = findControl(controls.$content, id);
                        $expanded = findExpanded($target);
                        if ($target.is(cssSelectors.expanded)) {
                            $expanded = $expanded.add($target);
                        }
                    } else {
                        // all expanded elements
                        $expanded = findExpanded(controls.$content);
                    }

                    // apply the collapse
                    $expanded.each((index, el) => {
                        el.classList.remove(cssClasses.expanded);

                        /**
                         * @event collapse
                         * @param {String} id - the identifier of the collapsed element
                         */
                        this.trigger('collapse', el.dataset.control);
                    });
                }

                return this;
            },

            /**
             * Expands or collapse the blocks related to the given identifier
             * @param {String} id
             * @returns {reviewPanel}
             * @fires expand for each expanded block
             * @fires collapse for each collapsed block
             */
            toggle(id) {
                if (this.is('rendered')) {
                    const $target = findControl(controls.$content, id);
                    if ($target.length) {
                        if ($target.is(cssSelectors.expanded)) {
                            this.collapse(id);
                        } else {
                            this.expand(id);
                        }
                    }
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
                    let filteredData;
                    if (data.score !== data.maxScore) {
                        filteredData = filterData(map, activeFilter && activeFilter.filter);
                    } else {
                        filteredData = data;
                    }

                    controls.$content.html(listTpl(filteredData.testMap));
                    controls.$headerScore.text(`${Math.floor(100 * filteredData.score / filteredData.maxScore) || 0}%`);
                    controls.$footerScore.text(`${filteredData.score}/${filteredData.maxScore}`);
                    hider.toggle(controls.$filters, filteredData.score !== filteredData.maxScore);

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

                // expand/collapse blocks on click
                controls.$content.on('click', cssSelectors.collapsibleLabel, e => {
                    this.toggle(e.currentTarget.parentElement.dataset.control);
                });

                // select item
                controls.$content.on('click', cssSelectors.item, e => {
                    controls.$content.find(cssSelectors.active).removeClass(cssClasses.active);
                    $(e.currentTarget).parentsUntil(controls.$content).add(e.currentTarget).addClass(cssClasses.active);
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
