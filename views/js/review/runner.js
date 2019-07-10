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
    'taoTests/runner/runnerComponent',
    'tpl!taoReview/review/runner',
    'json!taoReview/review/map.json',
], function (runnerComponentFactory, runnerTpl, testmap) {
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
            module: 'taoQtiTest/runner/plugins/navigation/previous',
            bundle: 'taoQtiTest/loader/testPlugins.min',
            category: 'navigation'
        }, {
            module: 'taoQtiTest/runner/plugins/navigation/next',
            bundle: 'taoQtiTest/loader/testPlugins.min',
            category: 'navigation'
        }];

        const testRunnerConfig = {
            testDefinition: 'test-container',
            serviceCallId: 'previewer',
            providers: {
                runner: {
                    id: 'qtiItemPreviewer',
                    module: 'taoQtiTestPreviewer/previewer/provider/item/item',
                    bundle: 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
                    category: 'runner'
                },
                proxy: {
                    id: 'qtiItemPreviewerProxy',
                    module: 'taoQtiTestPreviewer/previewer/proxy/item',
                    bundle: 'taoQtiTestPreviewer/loader/qtiPreviewer.min',
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
                // plugins: config.pluginsOptions
            }
        };

        const items = [{
            itemDefinition: 'item-1',
            uri: 'http://bosa/bosa3.rdf#i1562594332832614',
            state: null,
        }, {
            itemDefinition: 'item-2',
            uri: 'http://bosa/bosa3.rdf#i156259433311715',
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
            uri: 'http://bosa/bosa3.rdf#i1562594334560716',
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
            })
            .on('ready', function(runner) {
                runner.setTestMap(testmap);
                runner.setTestContext(testContex);
                runner.on('renderitem', () => {
                    const context = runner.getTestContext();
                    if(items[context.itemPosition].state) {
                        runner.itemRunner.setState(items[context.itemPosition].state);
                    }
                    // runner.trigger('enablenav'); in taoQtiTestPreviewer/views/js/previewer/provider/item/item.js 180line
                });
                const loadItem = () => {
                    const context = runner.getTestContext();
                    const testUri = {...config.testUri, uri: items[context.itemPosition].uri, itemDefinition: items[context.itemPosition].itemDefinition};
                    runner.loadItem(testUri);
                }
                loadItem();
                runner.on('move', function(direction, scope, position){
                    console.log(direction, scope, position);
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
                    
                })
                runner.on('destroy', () => this.destroy() );
            });
    };
});
