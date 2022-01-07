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
 * Copyright (c) 2021-22 Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'ui/itemButtonList',
    'ltiTestReview/review/plugins/navigation/review-panel/panel-data',
    'tpl!ltiTestReview/review/plugins/navigation/review-panel/tpl/fizzyPanel',
    'tpl!ltiTestReview/review/plugins/navigation/review-panel/tpl/fizzyList',
    'css!ltiTestReview/review/plugins/navigation/review-panel/css/fizzy-panel.css'
], function (
    $,
    _,
    __,
    componentFactory,
    itemButtonListFactory,
    reviewDataHelper,
    panelTpl,
    listTpl
) {
    'use strict';

    /**
     * Some default config
     * @type {Object}
     */
    const defaults = {
        headerTitle: __('Test review'),
        headerLabel: __('Total score:'),
        footerLabel: __('Total'),
        showScore: false,
        showCorrect: false
    };

    /**
     * CSS classes involved in the review panel
     * @type {Object}
     */
    const cssClasses = {
        keyfocused: 'step-overview-item-focus',
        active: 'step-overview-item-active',
    };

    /**
     * CSS selectors that match some particular elements
     * @type {Object}
     */
    const cssSelectors = {
        //step-overview
        active: `.${cssClasses.active}`,
        keyfocused: `.${cssClasses.keyfocused}`,
        navigable: '.step-overview-btn',
        itemById: (id) => `.step-overview-item[data-id="${id}"]`,
        navigableById: (id) => `.step-overview-btn[data-id="${id}"]`,
        //panel
        content: '.review-panel-content',
        header: '.review-panel-header',
        footer: '.review-panel-footer',
        score: '.review-panel-score',
        itemButtonListContainer: '.review-panel-items'
    };

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
     * @param {Boolean} [config.showScore] - Show the score header/footers in the review panel
     * @param {Boolean} [config.showCorrect] - Show correct/incorrect badges on item buttons
     * @param {testMap|null} testMap
     * @returns {component}
     * @fires ready - When the component is ready to work
     * @fires update When the navigation panel has been updated
     * @fires active When an element is activated
     * @fires datachange When the panel data has changed
     * @fires itemchange When an item is selected by the user (either a click on item or a filter)
     */
    function fizzyReviewPanelFactory(container, config = {}, testMap = null) {
        let component;
        let itemButtonListComponents = [];
        let controls = null;
        let activeItem = null;
        let data = null;

        /**
         * Selects the active item
         * @param {String} itemId
         */
        const selectItem = itemId => {
            itemButtonListComponents.forEach(c => c.setActiveItem(itemId));
        };

        /**
         * Example implementation of 'tabfocus' styling
         * @param {jQuery|null}  $target
         */
        const setFocusStyle = $target => {
            controls.$content
                .find(cssSelectors.keyfocused)
                .removeClass(cssClasses.keyfocused);

            if ($target && $target.length) {
                $target.addClass(cssClasses.keyfocused);
            }
        };

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

        const onItemClick = (e) => {
            if (!component.is('disabled')) {
                const currentId = activeItem && activeItem.id;
                component.setActiveItem(e.id);
                if (activeItem && activeItem.id !== currentId) {
                    itemChange();
                }
            }
        };

        //at the moment this component doesn't support data update, so just recreate it if testMap has changed
        const renderItemButtonListComponents = () => {
            itemButtonListComponents.forEach(c => c.destroy());
            itemButtonListComponents = [];

            if (component.is('rendered')) {
                controls.$content.find(cssSelectors.itemButtonListContainer).each((index, itemButtonListContainerElem) => {
                    const itemButtonListComponent = itemButtonListFactory({ items: data.sections[index].items })
                        .render(itemButtonListContainerElem)
                        .on('click', onItemClick);
                    itemButtonListComponents.push(itemButtonListComponent);
                });
            }
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
                console.log('fizzy setData', this.getConfig());
                const { showScore, showCorrect, displaySectionTitles } = this.getConfig();

                // Modify the testMap items, adding properties for the fizzy display
                data = reviewDataHelper.getFizzyReviewPanelMap(newMap, showScore, showCorrect);
                data.displaySectionTitles = displaySectionTitles;

                /**
                 * @event datachange
                 * @param {reviewPanelMap} data
                 */
                this.trigger('datachange', data);

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

                    controls.$headerScore.text(scorePercent);
                    controls.$footerScore.text(scoreText);

                    controls.$content.html(listTpl(data));

                    renderItemButtonListComponents();

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
                }

                const { headerLabel, footerLabel } = initConfig;

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

                // initialize the test map if supplied
                if (testMap) {
                    component.setData(testMap);
                }

                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onReviewPanelRender() {
                controls = {
                    $headerScore: this.getElement().find(`${cssSelectors.header} ${cssSelectors.score}`),
                    $footerScore: this.getElement().find(`${cssSelectors.footer} ${cssSelectors.score}`),
                    $content: this.getElement().find(cssSelectors.content),
                };

                //Simple example of 'tabfocus' detection
                this.getElement().on('keydown', cssSelectors.navigable, e => {
                    if (e.key === 'Tab') {
                        setFocusStyle(null);
                    }
                });
                this.getElement().on('keyup', cssSelectors.navigable, e => {
                    if (e.key === 'Tab') {
                        setFocusStyle($(e.target));
                    }
                });

                this.update();

                if (activeItem) {
                    selectItem(activeItem.id);
                }

                controls.$content.on('click', cssSelectors.navigable, e => {
                    onItemClick({ id: e.currentTarget.dataset.id });
                });

                /**
                 * @event ready
                 */
                // is show-score state useful?
                this.setState('show-score', this.getConfig().showScore)
                    .setState('ready', true)
                    .trigger('ready');
            })

            // reflect enabled/disabled panel state in buttons
            .on('enable', () => {
                itemButtonListComponents.forEach(c => c.enable());
            })
            .on('disable', () => {
                itemButtonListComponents.forEach(c => c.disable());
            })

            // make sure the active item remain selected and visible when updating the display
            .on('update', function onReviewPanelUpdate() {
                if (activeItem) {
                    // if the active item is not available anymore, select the first available one [usecase is only filters?]
                    if (!data.items.has(activeItem.id) && data.items.size > 0) {
                        onItemClick({ id: data.sections[0].items[0].id });
                    } else {
                        selectItem(activeItem.id);
                    }
                }
            })

            // data update
            .on('datachange', function onReviewPanelDataChange() {
                this.update();
            })

            // free resources on dispose
            .on('destroy', function onReviewPanelDestroy() {
                itemButtonListComponents.forEach(c => c.destroy());
                itemButtonListComponents = [];
                controls = null;
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => component.init(config));

        return component;
    }

    return fizzyReviewPanelFactory;
});
