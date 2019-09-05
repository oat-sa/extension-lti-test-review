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
    'ui/autoscroll',
    'ui/component',
    'taoReview/review/plugins/navigation/review-panel/panel-data',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/panel',
    'tpl!taoReview/review/plugins/navigation/review-panel/tpl/list',
    'css!taoReview/review/plugins/navigation/review-panel/css/panel.css'
], function (
    $,
    _,
    __,
    hider,
    autoscroll,
    componentFactory,
    reviewDataHelper,
    panelTpl,
    listTpl
) {
    'use strict';

    /**
     * @typedef {mapEntry} reviewPanelFilter
     * @property {String} title - The tooltip displayed on mouse over
     */

    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        headerLabel: __('TEST SCORE:'),
        footerLabel: __('TOTAL'),
        showScore: true,
        filters: [{
            id: 'all',
            label: __('All'),
            title: __('Show all items')
        }, {
            id: 'incorrect',
            label: __('Incorrect'),
            title: __('Show incorrect items only')
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
        navigable: '.navigable',
        control: '[data-control]',
        content: '.review-panel-content',
        filtersContainer: '.review-panel-filters',
        filter: '.review-panel-filter',
        item: '.review-panel-item',
        header: '.review-panel-header',
        footer: '.review-panel-footer',
        score: '.review-panel-score'
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
     * Builds a review panel, that will show the test data with score.
     *
     * @example
     *  const container = $();
     *  const config = {
     *      // ...
     *  };
     *  const testMap = {
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
     *              }],
     *              score: 2,
     *              maxScore: 2
     *          }],
     *          score: 2,
     *          maxScore: 2
     *      }],
     *      score: 2,
     *      maxScore: 2
     *  };
     *  const component = reviewPanelFactory(container, config, testMap)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {Object} config
     * @param {String} [config.headerLabel] - Header label
     * @param {String} [config.footerLabel] - Footer label
     * @param {Boolean} [config.showScore] - Show the score on the review panel. When disabled, the filters will also be.
     * @param {reviewPanelFilter[]} [config.filters] - The list of available filters
     * @param {testMap|null} map
     * @returns {component}
     * @fires ready - When the component is ready to work
     * @fires update When the navigation panel has been updated
     * @fires collapse When a block element is collapsed
     * @fires expand When a block element is expanded
     * @fires active When an element is activated
     * @fires filterchange When the active filter has changed
     * @fires datachange When the panel data has changed
     * @fires itemchange When an item is selected by the user (either a click on item or a filter)
     */
    function reviewPanelFactory(container, config = {}, map = null) {
        let component;
        let controls = null;
        let activeFilter = null;
        let activeItem = null;
        let data = null;

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
         * Selects the active item
         * @param {String} itemId
         */
        const selectItem = itemId => {
            // first deactivate already active elements
            controls.$content
                .find(cssSelectors.active)
                .removeClass(cssClasses.active);

            // then find the chain of elements to activate
            const $target = findControl(controls.$content, itemId);
            if ($target.length) {
                const $parents = $target.parentsUntil(controls.$content, cssSelectors.control);
                $target
                    .add($parents)
                    .addClass(cssClasses.active);

                // finally make sure the item is visible
                autoscroll($target, controls.$content);
            }
        };

        /**
         * Apply a callback on each navigable element
         * @param callback
         */
        const eachNavigable = callback => {
            component.getElement()
                .find(cssSelectors.navigable)
                .each(callback);
        };

        /**
         * Enables the keyboard navigation using 'tab' keys
         */
        const enableKeyboard = () => eachNavigable((index, el) => el.setAttribute('tabindex', 0));

        /**
         * Disables the keyboard navigation using 'tab' keys
         */
        const disableKeyboard = () => eachNavigable((index, el) => el.setAttribute('tabindex', -1));

        /**
         * Emits the itemchange event with respect to the current active item
         */
        const itemChange = () => {
            /**
             * @event itemchange
             * @param {String} itemId
             * @param {Number} position
             */
            component.trigger('itemchange', activeItem.id, activeItem.position);
        };

        /**
         * Defines the reviewPanel API
         * @type {reviewPanel}
         */
        const api = {
            /**
             * Gets the panel data
             * @returns {reviewPanelMap}
             */
            getData() {
                return data;
            },

            /**
             * Sets the panel data
             * @param {testMap} newMap
             * @returns {reviewPanel}
             * @fires datachange
             */
            setData(newMap) {
                data = reviewDataHelper.getReviewPanelMap(newMap, this.getConfig().showScore);

                /**
                 * @event datachange
                 * @param {reviewPanelMap} data
                 */
                this.trigger('datachange', data);

                return this;
            },

            /**
             * Gets the identifier of the active filter
             * @returns {String|null}
             */
            getActiveFilter() {
                return activeFilter && activeFilter.id;
            },

            /**
             * Sets the active filter
             * @param {String} filterId
             * @returns {reviewPanel}
             */
            setActiveFilter(filterId) {
                const {filters} = this.getConfig();
                if (Array.isArray(filters)) {
                    const foundFilter = filters.find(filter => filter.id === filterId);
                    if (foundFilter && (!activeFilter || activeFilter.id !== filterId)) {
                        activeFilter = foundFilter;

                        if (this.is('rendered')) {
                            selectFilter(filterId);
                        }

                        /**
                         * @event filterchange
                         * @param {String} filterId
                         */
                        this.trigger('filterchange', filterId);
                    }
                }

                return this;
            },

            /**
             * Gets the identifier of the active item
             * @returns {String|null}
             */
            getActiveItem() {
                return activeItem && activeItem.id;
            },

            /**
             * Gets the position of the active item
             * @returns {Number|null}
             */
            getActiveItemPosition() {
                return activeItem && activeItem.position;
            },

            /**
             * Sets the active item
             * @param {String} itemId
             * @returns {reviewPanel}
             * @fires active for each activated element
             */
            setActiveItem(itemId) {
                if (data && data.items.has(itemId) && (!activeItem || activeItem.id !== itemId)) {
                    activeItem = data.items.get(itemId);

                    if (this.is('rendered')) {
                        selectItem(itemId);
                    }

                    /**
                     * @event active
                     * @param {String} itemId
                     */
                    this.trigger('active', itemId);
                }
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
                        // will expand the target, its parents and first child blocks
                        let $collapsed = $target.parentsUntil(controls.$content, cssSelectors.collapsible)
                            .add($target.find(cssSelectors.collapsible).filter(':first-child'));

                        if ($target.is(cssSelectors.collapsible)) {
                            $collapsed = $collapsed.add($target);
                        }

                        if ($collapsed.filter(cssSelectors.expanded).length !== $collapsed.length) {
                            // first, collapse all expanded blocks
                            this.collapse();

                            // then expand the blocks
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
                if (data && this.is('rendered')) {
                    let scorePercent, scoreText;

                    if (data.maxScore) {
                        scoreText = `${data.score}/${data.maxScore}`;
                        scorePercent = `${Math.floor(100 * data.score / data.maxScore) || 0}%`;
                    } else {
                        scoreText = `${data.score}`;
                        scorePercent = '0%';
                    }

                    controls.$content.html(listTpl(data));
                    controls.$headerScore.text(scorePercent);
                    controls.$footerScore.text(scoreText);
                    hider.toggle(controls.$filters, data.score !== data.maxScore);

                    if (!this.is('disabled')) {
                        enableKeyboard();
                    }

                    /**
                     * @event update
                     * @param {reviewPanelMap} data
                     */
                    this.trigger('update', data);
                }

                return this;
            }
        };

        /**
         * @typedef {component} reviewPanel
         */
        component = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(panelTpl)

            // auto render on init
            .on('init', function onReviewPanelInit() {
                const initConfig = this.getConfig();

                // no header nor footer or filters when scores are disabled
                if (!initConfig.showScore) {
                    initConfig.headerLabel = false;
                    initConfig.footerLabel = false;
                    initConfig.filters = false;
                }

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
                        score: '0'
                    };
                }

                // select the first filter if none is active
                if (!activeFilter && Array.isArray(filters)) {
                    activeFilter = filters.find(filter => filter.label);
                }

                // initialize the test map if supplied
                if (map) {
                    component.setData(map);
                }

                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onReviewPanelRender() {
                controls = {
                    $headerScore: this.getElement().find(`${cssSelectors.header} ${cssSelectors.score}`),
                    $footerScore: this.getElement().find(`${cssSelectors.footer} ${cssSelectors.score}`),
                    $filtersContainer: this.getElement().find(cssSelectors.filtersContainer),
                    $filters: this.getElement().find(cssSelectors.filter),
                    $content: this.getElement().find(cssSelectors.content),
                };

                this.getElement().on('keydown', cssSelectors.navigable, e => {
                    if(e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.click();
                    }
                });

                // change filter on click
                controls.$filtersContainer.on('click', cssSelectors.filter, e => {
                    if (!this.is('disabled')) {
                        this.setActiveFilter(e.currentTarget.dataset.control);
                    }
                });

                // expand/collapse blocks on click
                controls.$content.on('click', cssSelectors.collapsibleLabel, e => {
                    if (!this.is('disabled')) {
                        this.toggle(e.currentTarget.parentElement.dataset.control);
                    }
                });

                // select item
                controls.$content.on('click', cssSelectors.item, e => {
                    if (!this.is('disabled')) {
                        const currentId = activeItem && activeItem.id;
                        this.setActiveItem(e.currentTarget.dataset.control);
                        if (activeItem && activeItem.id !== currentId) {
                            itemChange();
                        }
                    }
                });

                this.update();

                if (activeFilter) {
                    selectFilter(activeFilter.id);
                }

                if (activeItem) {
                    selectItem(activeItem.id);
                    this.expand(activeItem.id);
                }

                /**
                 * @event ready
                 */
                this.setState('ready', true)
                    .trigger('ready');
            })

            // reflect enable/disabled state
            .on('enable', () => enableKeyboard)
            .on('disable', () => disableKeyboard)

            // auto expand the block that contains the active item
            .on('active', function onReviewPanelActiveItem(itemId) {
                this.expand(itemId);
            })

            // make sure the active item remain selected and visible when updating the display
            .on('update', function onReviewPanelUpdate() {
                if (activeItem) {
                    // if the active item is not available anymore, select the first available one
                    if (!data.items.has(activeItem.id)) {
                        controls.$content.find(`${cssSelectors.item}:nth(0)`).click();
                    } else {
                        selectItem(activeItem.id);
                        this.expand(activeItem.id);
                    }
                }
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
