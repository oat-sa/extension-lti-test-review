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
 * Component that embeds the QTI previewer for tests and items
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'ui/feedback',
    'taoTests/runner/runnerComponent',
    'tpl!taoReview/review/runner',
    'json!taoReview/review/map.json',
], function (_, feedback, runnerComponentFactory, runnerTpl, testmap) {
    'use strict';

    /**
     * Builds a test runner to preview test
     * @param {jQuery|HTMLElement|String} container - The container in which renders the component
     * @param {Object}   config - The testRunner options
     * @param {Object[]} [config.providers] - A collection of providers to load.
     * @param {Boolean} [config.replace] - When the component is appended to its container, clears the place before
     * @param {Number|String} [config.width] - The width in pixels, or 'auto' to use the container's width
     * @param {Number|String} [config.height] - The height in pixels, or 'auto' to use the container's height
     * @param {Boolean} [config.options.fullPage] - Force the previewer to occupy the full window.
     * @param {Booleanh} [config.options.readOnly] - Do not allow to modify the previewed item.
     * @param {Function} [template] - An optional template for the component
     * @returns {previewer}
     */
    return function previewerFactory(container, config = {}, template = null) {
        const defaultPlugins = [{
            module: 'taoReview/review/plugins/next-prev-review/next-prev-review',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'navigation'
        }];

        const testRunnerConfig = {
            testDefinition: 'test-container',
            serviceCallId: 'previewer',
            proxyProvider: 'qtiItemReviewProxy',
            // loadFromBundle: 'true',
            providers: {
                runner: {
                    id: 'qtiItemReview',
                    module: 'taoReview/review/provider/item/item',
                    bundle: 'taoReview/loader/qtiReview.min',
                    category: 'runner'
                },
                proxy: {
                    id: 'qtiItemReviewProxy',
                    module: 'taoReview/review/proxy/item',
                    bundle: 'taoReview/loader/qtiReview.min',
                    category: 'proxy'
                },
                communicator: {
                    id: 'request',
                    module: 'core/communicator/request',
                    bundle: 'loader/vendor.min',
                    category: 'communicator'
                },
                plugins: defaultPlugins
            },
            options: {
                readOnly: config.readOnly,
                fullPage: config.fullPage,
            }
        };

        const testData = {
            config: {
                allowShortcuts: true,
                shortcuts: {
                    'next-prev-review': {
                        next: 'arrowright',
                        prev: 'arrowleft'
                    }
                },
            }
        };

        const items = [{
            itemDefinition: 'item-1',
            state: null,
        }, {
            itemDefinition: 'item-2',
            state: {
                RESPONSE: {
                    response: {
                        base: {
                            integer: 0
                        }
                    }
                },
                RESPONSE_1: {
                    response: {
                        list: {
                            identifier: [
                                "choice_3",
                                "choice_4",
                                "choice_5",
                            ]
                        }
                    }
                },
                RESPONSE_3: {
                    response: {
                        base: {
                            integer: 327000
                        }
                    }
                },
            }
        }, {
            itemDefinition: 'item-3',
            state: {
                RESPONSE: {
                    response: {
                        list: {
                            "identifier":["choice_2"]
                        }
                    }
                },
                "RESPONSE_1":{
                    "response":{
                        "list":{
                            "pair":[
                                ["choice_5","choice_6"],
                                ["choice_4","choice_7"]
                            ]
                        }
                    }
                }
            },
        }];

        const testContex = {
            itemIdentifier: "item-1",
            itemPosition: 0,
            isLinear: false,
            canMoveBackward: true
        };

        return runnerComponentFactory(container, testRunnerConfig, template || runnerTpl)
            .on('render', function() {
                const {fullPage, readOnly} = this.getConfig().options;
                this.setState('fullpage', fullPage);
                this.setState('readonly', readOnly);

                const runner = this.getRunner();
                runner.setTestMap(testmap);
                runner.setTestContext(testContex);
                runner.setTestData(testData);
            })
            .on('ready', function(runner) {
                runner.on('renderitem', () => {
                    const context = runner.getTestContext();
                    if(items[context.itemPosition].state) {
                        runner.itemRunner.setState(items[context.itemPosition].state);
                    }
                    // runner.trigger('enablenav'); in taoQtiTestPreviewer/views/js/previewer/provider/item/item.js 180line
                });
                const loadItem = () => {
                    const context = runner.getTestContext();
                    const testUri = { ...config.testUri, uri: items[context.itemPosition].uri, itemDefinition: items[context.itemPosition].itemDefinition};
                    Object.assign(testUri, config.testUri);
                    runner.loadItem(testUri);
                };
                loadItem();
                runner.on('move', function(direction){
                    const context = runner.getTestContext();
                    const testMap = runner.getTestMap();
                    let nextItemPosition;
                    if(direction === 'next') {
                        nextItemPosition = context.itemPosition + 1;
                    }
                    if(direction === 'previous') {
                        nextItemPosition = context.itemPosition - 1;
                    }

                    runner.on('unloaditem', () => {
                        runner.off('unloaditem');
                        context.itemPosition = nextItemPosition;
                        context.itemIdentifier = testMap.jumps[nextItemPosition].identifier;
                        runner.setTestContext(context);
                        loadItem();
                    });

                    runner.unloadItem(context.itemIdentifier);

                });
                runner.on('destroy', () => this.destroy() );
                runner.spread(this, 'error');
            })
            .on('error', err => {
                if (!_.isUndefined(err.message)) {
                    feedback().error(err.message);
                }
            } );
    };
});
