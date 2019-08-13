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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'taoTests/runner/runner',
    'taoTests/runner/plugin',
    'taoTests/runner/proxy',
    'taoReview/review/provider/qtiTestReviewProvider',
    'json!taoReview/test/mocks/item-1.json',
    'json!taoReview/test/mocks/item-2.json',
    'json!taoReview/test/mocks/item-3.json',
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'tpl!taoReview/test/review/provider/qtiTestReviewProvider/navigation',
    'css!taoReview/review/provider/css/qtiTestReviewProvider'
], function (
    $,
    runnerFactory,
    pluginFactory,
    proxyFactory,
    qtiTestReviewProvider,
    itemData1,
    itemData2,
    itemData3,
    testData,
    testContext,
    testMap,
    testResponses,
    navigationTpl
) {
    'use strict';

    // the provider must be registered
    runnerFactory.registerProvider('qtiTestReviewProvider', qtiTestReviewProvider);

    QUnit.module('API');

    QUnit.test('module', assert => {
        assert.expect(2);
        assert.equal(typeof qtiTestReviewProvider, 'object', 'The module exposes an object');
        assert.equal(qtiTestReviewProvider.name, 'qtiTestReviewProvider', 'The provider has the expected name');
    });

    QUnit.cases.init([
        {title: 'loadAreaBroker'},
        {title: 'loadProxy'},
        {title: 'loadTestStore'},
        {title: 'install'},
        {title: 'init'},
        {title: 'render'},
        {title: 'loadItem'},
        {title: 'renderItem'},
        {title: 'unloadItem'},
        {title: 'destroy'}
    ]).test('provider API ', (data, assert) => {
        assert.expect(1);
        assert.equal(typeof qtiTestReviewProvider[data.title], 'function', `The provider exposes a ${data.title} function`);
    });

    QUnit.module('behavior');

    QUnit.cases.init([{
        title: 'default',
        proxy: 'qtiTestReviewProxy',
        plugin: 'mock1',
        config: {}
    }, {
        title: 'other proxy',
        proxy: 'installProxy',
        plugin: 'mock2',
        config: {
            proxyProvider: 'installProxy'
        }
    }]).test('install / init ', (data, assert) => {
        assert.expect(6);
        const ready = assert.async();
        const $fixture = $('#fixture-install');
        const mockProxy = {
            name: data.proxy,
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve({
                    success: true
                });
            }
        };
        const mockPlugin = {
            name: data.plugin,
            install() {
                assert.ok(true, 'The install method has been called on the plugin');
            },
            init() {
                assert.ok(true, 'The init method has been called on the plugin');
            }
        };
        const config = Object.assign({
            renderTo: $fixture,
            options: {
                plugins: {
                    [mockPlugin.name]: {
                        foo: 'bar'
                    }
                }
            }
        }, data.config || {});
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [pluginFactory(mockPlugin)], config)
            .on('ready', () => {
                const plugin = runner.getPlugin(mockPlugin.name);

                assert.notEqual(plugin, null, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin has been created');
                assert.deepEqual(plugin.getConfig(), config.options.plugins[mockPlugin.name], 'The plugin received the config');

                runner.destroy();
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                runner.destroy();
            })
            .on('destroy', ready)
            .init();
    });

    QUnit.test('init / life-cycle', assert => {
        assert.expect(13);
        const ready = assert.async();
        const $fixture = $('#fixture-init');
        const mockProxy = {
            name: 'initProxy',
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve({
                    success: true
                });
            },
            getItem() {
                assert.ok(true, 'The getItem method has been called on the proxy');
                return Promise.resolve({
                    success: true,
                    content: {
                        type: 'qti',
                        data: itemData1
                    },
                    baseUrl: '',
                    state: {}
                });
            }
        };
        const config = {
            renderTo: $fixture,
            proxyProvider: mockProxy.name
        };
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [], config)
            .on('ready', () => {
                Promise.resolve()
                    .then(() => Promise.all([
                        new Promise(resolve => {
                            runner.on('enabletools.test', () => {
                                assert.ok(true, 'Event enabletools has been triggered');
                                resolve();
                            });
                        }),
                        new Promise(resolve => {
                            runner.on('enablenav.test', () => {
                                assert.ok(true, 'Event enablenav has been triggered');
                                resolve();
                            });
                        }),
                        runner.loadItem('foo')
                    ]))
                    .then(() => {
                        runner.off('.test');
                        const promises = Promise.all([
                            new Promise(resolve => {
                                runner.on('enableitem.test', () => {
                                    assert.ok(true, 'Event enableitem has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('enablenav.test', () => {
                                    assert.ok(true, 'Event enablenav has been triggered');
                                    resolve();
                                });
                            })
                        ]);
                        runner.trigger('resumeitem');
                        return promises;
                    })
                    .then(() => {
                        runner.off('.test');
                        const promises = new Promise(resolve => {
                            runner.on('disabletools.test', () => {
                                assert.ok(true, 'Event disabletools has been triggered');
                                resolve();
                            });
                        });
                        runner.trigger('disableitem');
                        return promises;
                    })
                    .then(() => {
                        runner.off('.test');
                        const promises = new Promise(resolve => {
                            runner.on('enabletools.test', () => {
                                assert.ok(true, 'Event enabletools has been triggered');
                                resolve();
                            });
                        });
                        runner.trigger('enableitem');
                        return promises;
                    })
                    .then(() => {
                        runner.off('.test');
                        const promises = Promise.all([
                            new Promise(resolve => {
                                runner.on('disabletools.test', () => {
                                    assert.ok(true, 'Event disabletools has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('enablenav.test', () => {
                                    assert.ok(true, 'Event enablenav has been triggered');
                                    resolve();
                                });
                            })
                        ]);
                        runner.trigger('error');
                        return promises;
                    })
                    .then(() => {
                        runner.off('.test');
                        const promises = Promise.all([
                            new Promise(resolve => {
                                runner.on('disablenav.test', () => {
                                    assert.ok(true, 'Event disablenav has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('disabletools.test', () => {
                                    assert.ok(true, 'Event disabletools has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('flush.test', () => {
                                    assert.ok(true, 'Event flush has been triggered');
                                    resolve();
                                });
                            })
                        ]);
                        runner.trigger('finish');
                        return promises;
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    });
            })
            .on('destroy', ready)
            .init();
    });

    QUnit.test('render layout', assert => {
        assert.expect(13);
        const ready = assert.async();
        const $fixture = $('#fixture-render');
        const mockProxy = {
            name: 'renderProxy',
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve({
                    success: true
                });
            }
        };
        const config = {
            renderTo: $fixture,
            proxyProvider: mockProxy.name
        };
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [], config)
            .on('ready', () => {
                const areaBroker = runner.getAreaBroker();
                Promise.resolve()
                    .then(() => {
                        const $container = areaBroker.getContainer();
                        assert.equal($container.length, 1, 'The container exists');
                        assert.equal(areaBroker.getContentArea().length, 1, 'The content area exists');
                        assert.equal(areaBroker.getToolboxArea().length, 1, 'The toolbox area exists');
                        assert.equal(areaBroker.getNavigationArea().length, 1, 'The navigation area exists');
                        assert.equal(areaBroker.getControlArea().length, 1, 'The control area exists');
                        assert.equal(areaBroker.getArea('actionsBar').length, 1, 'The actionsBar area exists');
                        assert.equal(areaBroker.getPanelArea().length, 1, 'The panel area exists');
                        assert.equal(areaBroker.getHeaderArea().length, 1, 'The header area exists');
                        assert.equal(areaBroker.getArea('context').length, 1, 'The context area exists');
                        assert.equal(areaBroker.getArea('contentWrapper').length, 1, 'The contentWrapper area exists');
                        assert.equal(areaBroker.getArea('itemTool').length, 1, 'The itemTool area exists');
                        return runner.destroy();
                    })
                    .then(() => {
                        const $container = areaBroker.getContainer();
                        assert.equal($container.length, 1, 'The container still exists');
                    })
                    .catch(err => {
                        assert.ok(false, `Error in init method: ${err.message}`);
                        runner.destroy();
                    });
            })
            .on('destroy', ready)
            .init();
    });

    QUnit.cases.init([{
        title: 'item from testContext',
        initData: {
            success: true,
            testData: testData,
            testContext: testContext,
            testMap: testMap,
            testResponses: testResponses
        }
    }, {
        title: 'manual load',
        itemIdentifier: 'item-3',
        initData: {
            success: true
        }
    }]).test('render item ', (data, assert) => {
        assert.expect(6);
        const ready = assert.async();
        const $fixture = $('#fixture-item');
        const items = {
            'item-1': itemData1,
            'item-2': itemData2,
            'item-3': itemData3
        };
        const mockProxy = {
            name: 'itemProxy',
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve(data.initData);
            },
            getItem(itemIdentifier) {
                return Promise.resolve({
                    success: true,
                    content: {
                        type: 'qti',
                        data: items[itemIdentifier]
                    },
                    baseUrl: '',
                    state: {}
                });
            }
        };
        const config = {
            renderTo: $fixture,
            proxyProvider: mockProxy.name
        };
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [], config)
            .on('ready', () => {
                Promise.resolve()
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('renderitem.test', () => {
                                assert.ok(true, 'The previewer has been rendered');
                                resolve();
                            });
                    }))
                    .then(() => {
                        runner.off('.test');
                        const promises = Promise.all([
                            new Promise(resolve => {
                                runner.on('beforeunloaditem.test', () => {
                                    assert.ok(true, 'Event beforeunloaditem has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('disablenav.test', () => {
                                    assert.ok(true, 'Event disablenav has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('disabletools.test', () => {
                                    assert.ok(true, 'Event disabletools has been triggered');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                runner.on('unloaditem.test', () => {
                                    assert.ok(true, 'Event unloaditem has been triggered');
                                    resolve();
                                });
                            }),
                            runner.unloadItem()
                        ]);
                        return promises;
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => runner.destroy());

                if (data.itemIdentifier) {
                    runner.loadItem(data.itemIdentifier);
                }
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('destroy', ready)
            .init();
    });

    QUnit.cases.init([{
        title: 'all data provided',
        initData: {
            success: true,
            testData: testData,
            testContext: testContext,
            testMap: testMap,
            testResponses: testResponses
        }
    }, {
        title: 'empty jump table',
        initData: {
            success: true,
            testData: testData,
            testContext: testContext,
            testMap: Object.assign({}, testMap, {jumps: []}),
            testResponses: testResponses
        }
    }, {
        title: 'missing jump table',
        initData: {
            success: true,
            testData: testData,
            testContext: testContext,
            testMap: (() => {
                const {scope, parts, stats} = testMap;
                return {scope, parts, stats};
            })(),
            testResponses: testResponses
        }
    }]).test('navigate ', (data, assert) => {
        assert.expect(14);
        const ready = assert.async();
        const $fixture = $('#fixture-navigate');
        const items = {
            'item-1': itemData1,
            'item-2': itemData2,
            'item-3': itemData3
        };
        const mockProxy = {
            name: 'renderProxy',
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve(data.initData);
            },
            getItem(itemIdentifier) {
                assert.ok(true, 'The getItem method has been called on the proxy');
                return Promise.resolve({
                    success: true,
                    content: {
                        type: 'qti',
                        data: items[itemIdentifier]
                    },
                    baseUrl: '',
                    state: {}
                });
            }
        };
        const config = {
            renderTo: $fixture,
            proxyProvider: mockProxy.name
        };
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [], config)
            .on('ready', () => {
                assert.ok(true, 'The test runner is now ready');
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('destroy', ready)
            .init();

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-1', 'The first item is rendered');
                        resolve();
                    });
            }))
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-2', 'The second item is rendered');
                        resolve();
                    })
                    .next();
            }))
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-1', 'The first item is rendered again');
                        resolve();
                    })
                    .previous();
            }))
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-2', 'The third item is rendered again');
                        resolve();
                    })
                    .next();
            }))
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-1', 'The first item is rendered again');
                        resolve();
                    })
                    .jump(0, 'item');
            }))
            .then(() => new Promise(resolve => {
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, 'item-3', 'The third item is rendered');
                        resolve();
                    })
                    .jump(2, 'item');
            }))
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(() => runner.destroy());
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        assert.expect(6);
        const ready = assert.async();
        const items = {
            'item-1': itemData1,
            'item-2': itemData2,
            'item-3': itemData3
        };
        const navigationPlugin = {
            name: 'navigation',
            install() {
                assert.ok(true, 'The install method has been called on the plugin');
            },
            init() {
                assert.ok(true, 'The init method has been called on the plugin');
            },
            render() {
                assert.ok(true, 'The render method has been called on the plugin');
                this.getAreaBroker()
                    .getNavigationArea()
                    .append($(navigationTpl(testMap.jumps.map(jump => Object.assign({label: `Item ${jump.position + 1}`}, jump)))))
                    .on('click', e => this.getTestRunner().jump(e.target.dataset.position, 'item'));
            }
        };
        const mockProxy = {
            name: 'visualProxy',
            init() {
                assert.ok(true, 'The init method has been called on the proxy');
                return Promise.resolve({
                    success: true,
                    testData: testData,
                    testContext: testContext,
                    testMap: testMap,
                    testResponses: testResponses
                });
            },
            getItem(itemIdentifier) {
                return Promise.resolve({
                    success: true,
                    content: {
                        type: 'qti',
                        data: items[itemIdentifier]
                    },
                    baseUrl: '',
                    state: {}
                });
            }
        };
        const config = {
            renderTo: $('#visual-test'),
            proxyProvider: mockProxy.name,
        };
        proxyFactory.registerProvider(mockProxy.name, mockProxy);
        const runner = runnerFactory('qtiTestReviewProvider', [pluginFactory(navigationPlugin)], config)
            .on('ready.test', () => {
                assert.ok(true, 'The previewer is ready');
            })
            .on('renderitem.test', () => {
                runner.off('.test');
                assert.ok(true, 'The previewer has been rendered');
                ready();
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .init();
    });

});
