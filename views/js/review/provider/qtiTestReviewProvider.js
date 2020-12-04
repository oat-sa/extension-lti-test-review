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
 * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test runner provider for the QTI test previewer
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoTests/runner/testStore',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/ui/toolbox/toolbox',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiTest/runner/config/assetManager',
    'ltiTestReview/review/services/navigator',
    'tpl!ltiTestReview/review/provider/tpl/qtiTestReviewProvider'
], function (
    $,
    _,
    areaBrokerFactory,
    proxyFactory,
    testStoreFactory,
    mapHelper,
    toolboxFactory,
    qtiItemRunner,
    assetManagerFactory,
    testNavigatorFactory,
    layoutTpl
) {
    'use strict';

    /**
     * A Test runner provider to be registered against the runner
     */
    return {

        //provider name
        name: 'qtiTestReviewProvider',

        /**
         * Initialize and load the test store
         * @returns {testStore}
         */
        loadTestStore() {
            const config = this.getConfig();

            //the test run needs to be identified uniquely
            const identifier = config.serviceCallId || `test-${Date.now()}`;
            return testStoreFactory(identifier);
        },

        /**
         * Installation of the provider, called during test runner init phase.
         */
        install() {
            // eventify the test map update
            const defaultSetTestMap = this.setTestMap;
            this.setTestMap = (...args) => {
                const result = defaultSetTestMap.apply(this, args);

                /**
                 * @event testmapchange
                 * @param {testMap} testMap
                 */
                this.trigger('testmapchange', this.getTestMap());

                return result;
            };

            const { plugins } = this.getConfig().options || {};
            if (plugins) {
                _.forEach(this.getPlugins(), plugin => {
                    if (_.isPlainObject(plugin) && _.isFunction(plugin.setConfig)) {
                        const config = plugins[plugin.getName()];
                        if (_.isPlainObject(config)) {
                            plugin.setConfig(config);
                        }
                    }
                });
            }
        },

        /**
         * Initialize and load the area broker with a correct mapping
         * @returns {areaBroker}
         */
        loadAreaBroker() {
            const $layout = $(layoutTpl());

            return areaBrokerFactory($layout, {
                contentWrapper: $('.content-wrapper', $layout),
                itemTool: $('.item-tool', $layout),
                content: $('#qti-content', $layout),
                toolbox: $('.bottom-action-bar .tools-box', $layout),
                navigation: $('.test-sidebar-left .navi-box', $layout),
                control: $('.top-action-bar .control-box', $layout),
                actionsBar: $('.bottom-action-bar .control-box', $layout),
                panel: $('.test-sidebar-left .panel-box', $layout),
                header: $('.top-action-bar .tools-box', $layout),
                context: $('.top-action-bar .navi-box-list', $layout),
                sidebar: $('.test-sidebar-left', $layout)
            });
        },

        /**
         * Initialize and load the test runner proxy
         * @returns {proxy}
         */
        loadProxy() {
            const { proxyProvider, serviceCallId, bootstrap, timeout } = this.getConfig();
            return proxyFactory(proxyProvider || 'qtiTestReviewProxy', { serviceCallId, bootstrap, timeout });
        },

        /**
         * Initialization of the provider, called during test runner init phase.
         *
         * We install behaviors during this phase (ie. even handlers)
         * and we call proxy.init.
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} to chain proxy.init
         */
        init() {
            const dataHolder = this.getDataHolder();
            const areaBroker = this.getAreaBroker();
            const load = () => {
                const testContext = this.getTestContext();
                if (testContext && testContext.itemIdentifier) {
                    this.loadItem(testContext.itemIdentifier);
                }
            };

            areaBroker.setComponent('toolbox', toolboxFactory());
            areaBroker.getToolbox().init();

            this.assetManager = assetManagerFactory();

            // first and second tab will show block and navigate to panel or content
            const createJumplinks = (container) => {
                container.on('click', (e) => {
                    if (e.target.classList.contains('jumplink')) {
                        e.preventDefault();
                        e.target.blur();
                        const where = e.target.dataset.area;
                        areaBroker.getArea(where).find(':not(.hidden)[tabindex]').first().focus();
                    }
                });
                container.on('focusin', (e) => {
                    if (e.target.classList.contains('jumplink')) {
                        const where = e.target.dataset.area;
                        areaBroker.getArea(where).addClass('focused');
                    }
                });
                container.on('focusout', (e) => {
                    if (e.target.classList.contains('jumplink')) {
                        const where = e.target.dataset.area;
                        areaBroker.getArea(where).removeClass('focused');
                    }
                });
            };
            createJumplinks(areaBroker.getContainer().find('.jumplinks'));

            /*
             * Install behavior on events
             */
            this
                .on('ready', () => {
                    load();
                })
                .on('loaditem', (itemRef, itemData) => {
                    dataHolder.set('itemIdentifier', itemRef);
                    dataHolder.set('itemData', itemData);
                })
                .on('renderitem', () => {
                    this.trigger('enabletools enablenav');
                })
                .on('move', function (direction, scope, ref) {
                    const testContext = this.getTestContext();
                    const testMap = this.getTestMap();
                    const testNavigator = testNavigatorFactory(testContext, testMap);
                    const newTestContext = testNavigator.navigate(direction, scope || 'item', ref);
                    this.unloadItem(testContext.itemIdentifier);
                    this.setTestContext(newTestContext);
                })
                .on('unloaditem', () => {
                    load();
                })
                .on('resumeitem', () => {
                    this.trigger('enableitem enablenav');
                })
                .on('disableitem', () => {
                    this.trigger('disabletools');
                })
                .on('enableitem', () => {
                    this.trigger('enabletools');
                })
                .on('error', () => {
                    this.trigger('disabletools enablenav');
                })
                .on('finish leave', () => {
                    this.trigger('disablenav disabletools');
                    this.flush();
                })
                .on('flush', () => {
                    this.destroy();
                });

            return this.getProxy()
                .init()
                .then(data => {
                    if (data.testMap && _.isEmpty(mapHelper.getJumps(data.testMap))) {
                        mapHelper.createJumpTable(data.testMap);
                    }
                    dataHolder.set('testMap', data.testMap);
                    dataHolder.set('testContext', data.testContext);
                    dataHolder.set('testData', data.testData);
                    dataHolder.set('testResponses', data.testResponses);
                    return data;
                });
        },

        /**
         * Rendering phase of the test runner
         *
         * Attach the test runner to the DOM
         *
         * @this {runner} the runner context, not the provider
         */
        render() {
            const config = this.getConfig();
            const areaBroker = this.getAreaBroker();

            config.renderTo.append(areaBroker.getContainer());

            areaBroker.getToolbox().render(areaBroker.getToolboxArea());
        },

        /**
         * LoadItem phase of the test runner
         *
         * We call the proxy in order to get the item data
         *
         * @this {runner} the runner context, not the provider
         * @param {String} itemIdentifier - The identifier of the item to update
         * @returns {Promise} that calls in parallel the state and the item data
         */
        loadItem(itemIdentifier) {
            return this.getProxy().getItem(itemIdentifier);
        },

        /**
         * RenderItem phase of the test runner
         *
         * Here we initialize the item runner and wrap it's call to the test runner
         *
         * @this {runner} the runner context, not the provider
         * @param {String} itemIdentifier - The identifier of the item to update
         * @param {Object} itemData - The definition data of the item
         * @returns {Promise} resolves when the item is ready
         */
        renderItem(itemIdentifier, itemData) {
            const areaBroker = this.getAreaBroker();

            const changeState = () => {
                this.setItemState(itemIdentifier, 'changed', true);
            };

            return new Promise((resolve, reject) => {
                itemData.content = itemData.content || {};

                const view = 'reviewRenderer';
                const assetManager = this.assetManager;
                assetManager.setData('baseUrl', itemData.baseUrl);
                assetManager.setData('itemIdentifier', itemIdentifier);
                assetManager.setData('assets', itemData.content.assets);

                this.itemRunner = qtiItemRunner(itemData.content.type, itemData.content.data, { assetManager, view })
                    .on('warning', err => this.trigger('warning', err))
                    .on('error', err => {
                        this.trigger('enablenav');
                        reject(err);
                    })
                    .on('init', function onItemRunnerInit() {
                        const { state, portableElements } = itemData;
                        this.render(areaBroker.getContentArea(), { state, portableElements });
                    })
                    .on('render', function onItemRunnerRender() {
                        this.on('responsechange', changeState);
                        this.on('statechange', changeState);
                        resolve();
                    })
                    .init();
            });
        },

        /**
         * UnloadItem phase of the test runner
         *
         * Item clean up
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} resolves when the item is cleared
         */
        unloadItem() {
            this.trigger('beforeunloaditem disablenav disabletools');

            if (this.itemRunner) {
                return new Promise(resolve => {
                    this.itemRunner
                        .on('clear', resolve)
                        .clear();
                });
            }
            return Promise.resolve();
        },

        /**
         * Destroy phase of the test runner
         *
         * Clean up
         *
         * @this {runner} the runner context, not the provider
         */
        destroy() {
            const areaBroker = this.getAreaBroker();

            // prevent the item to be displayed while test runner is destroying
            if (this.itemRunner) {
                this.itemRunner.clear();
            }
            this.itemRunner = null;

            if (areaBroker) {
                areaBroker.getToolbox().destroy();
            }

            // we remove the store(s) only if the finish step was reached
            if (this.getState('finish')) {
                return this.getTestStore().remove();
            }
        }
    };
});
