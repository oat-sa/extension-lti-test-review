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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoTests/runner/runner',
    'taoTests/runner/areaBroker',
    'taoQtiTest/runner/helpers/map',
    'ltiTestReview/review/plugins/navigation/review-panel/plugin',
    'tpl!ltiTestReview/test/review/plugins/navigation/review-panel/plugin/layout',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/plugin/map.json'
], function (
    $,
    _,
    runnerFactory,
    areaBrokerFactory,
    mapHelper,
    reviewPanelPlugin,
    layoutTpl,
    testMap
) {
    'use strict';

    /**
     * Builds a test runner instance, injecting the plugin
     * @param {String} fixture
     * @returns {runner}
     */
    const getTestRunner = (fixture, config = {}) => {
        runnerFactory.registerProvider('mock', {
            loadAreaBroker() {
                const $fixture = $(fixture);
                $fixture.html(layoutTpl());
                return areaBrokerFactory($fixture, {
                    header: $('.header', $fixture),
                    panel: $('.panel', $fixture),
                    content: $('.item', $fixture),
                    toolbox: $('.footer', $fixture),
                    navigation: $('.footer', $fixture),
                    control: $('.footer', $fixture)
                });
            },
            install() {
                const defaultSetTestMap = this.setTestMap;
                this.setTestMap = (...args) => {
                    const result = defaultSetTestMap.apply(this, args);
                    this.trigger('testmapchange', this.getTestMap());
                    return result;
                };
            },
            init() {
                this.setTestMap(testMap);
            }
        });
        return runnerFactory('mock', [reviewPanelPlugin], config);
    };

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        assert.expect(3);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-api');
        const plugin1 = reviewPanelPlugin(runner);
        const plugin2 = reviewPanelPlugin(runner);
        assert.equal(typeof reviewPanelPlugin, 'function', 'The module exposes a function');
        assert.equal(typeof plugin1, 'object', 'The factory produces an instance');
        assert.notStrictEqual(plugin1, plugin2, 'The factory provides a different instance on each call');
        runner.on('destroy', () => {
            plugin1.destroy();
            plugin2.destroy();
            ready();
        });
        runner.destroy();
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'render'},
        {title: 'finish'},
        {title: 'destroy'},
        {title: 'trigger'},
        {title: 'getTestRunner'},
        {title: 'getAreaBroker'},
        {title: 'getConfig'},
        {title: 'setConfig'},
        {title: 'getState'},
        {title: 'setState'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'}
    ]).test('plugin API ', (data, assert) => {
        assert.expect(1);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-api')
            .on('destroy', ready);
        const plugin = reviewPanelPlugin(runner);
        assert.equal(typeof plugin[data.title], 'function', `The instances expose a ${data.title} function`);
        runner.destroy();
    });

    QUnit.module('Life cycle');

    QUnit.test('render / destroy', assert => {
        assert.expect(18);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-render');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-header .review-panel-label').length, 1, 'The header label is rendered');
                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '70%', 'The header score is rendered');

                assert.equal($container.find('.review-panel-footer .review-panel-label').length, 1, 'The header label is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '12/17', 'The header score is rendered');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');

                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
            })
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
                assert.equal($container.find('.review-panel-part').length, 0, 'The test parts have been removed');
                assert.equal($container.find('.review-panel-section').length, 0, 'The test sections have been removed');
                assert.equal($container.find('.review-panel-item').length, 0, 'The test items have been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.test('enable / disable', assert => {
        assert.expect(7);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-enable');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
            })
            .then(() => new Promise(resolve => {
                assert.equal($container.find('.review-panel.disabled').length, 0, 'The component is not disabled');
                runner
                    .after('disablenav', resolve)
                    .trigger('disablenav');
            }))
            .then(() => new Promise(resolve => {
                assert.equal($container.find('.review-panel.disabled').length, 1, 'The component is disabled');
                runner
                    .after('enablenav', resolve)
                    .trigger('enablenav');
            }))
            .then(() => {
                assert.equal($container.find('.review-panel.disabled').length, 0, 'The component is enabled');
            })
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.test('show / hide', assert => {
        assert.expect(7);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-show');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
            })
            .then(() => {
                assert.equal($container.find('.review-panel:visible').length, 1, 'The component is visible');
                return runner.getPlugin('review-panel').hide();
            })
            .then(() => {
                assert.equal($container.find('.review-panel:visible').length, 0, 'The component is hidden');
                return runner.getPlugin('review-panel').show();
            })
            .then(() => {
                assert.equal($container.find('.review-panel:visible').length, 1, 'The component is visible');
            })
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.module('Behavior');

    QUnit.test('reflect the position', assert => {
        assert.expect(29);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-reflect');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No expanded test part');
                assert.equal($container.find('.review-panel-part.active').length, 0, 'No active test part');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No expanded test section');
                assert.equal($container.find('.review-panel-section.active').length, 0, 'No active test section');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                assert.equal($container.find('.review-panel-item.active').length, 0, 'No active test item');
            })
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 0);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is expanded');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is active');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is expanded');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is active');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    })
                    .loadItem(item.id);
            }))
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 5);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is expanded');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is active');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is expanded');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is active');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    })
                    .loadItem(item.id);
            }))
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
                assert.equal($container.find('.review-panel-part').length, 0, 'The test parts have been removed');
                assert.equal($container.find('.review-panel-section').length, 0, 'The test sections have been removed');
                assert.equal($container.find('.review-panel-item').length, 0, 'The test items have been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.test('modify the position', assert => {
        assert.expect(29);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-modify');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .on('move', (direction, scope, position) => {
                        const item = mapHelper.getItemAt(runner.getTestMap(), position);
                        if (item) {
                            runner.loadItem(item.id);
                        }
                    })
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No expanded test part');
                assert.equal($container.find('.review-panel-part.active').length, 0, 'No active test part');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No expanded test section');
                assert.equal($container.find('.review-panel-section.active').length, 0, 'No active test section');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                assert.equal($container.find('.review-panel-item.active').length, 0, 'No active test item');
            })
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 0);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is expanded');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is active');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is expanded');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is active');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    });
                $container.find(`.review-panel-item[data-control="${item.id}"]`).click();
            }))
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 3);
                runner
                    .off('.test')
                    .on('renderitem.test', () => {
                        assert.ok(false, 'The renderitem event should not be triggered');
                    })
                    .on('loaditem.test', () => {
                        assert.ok(false, 'The loaditem event should not be triggered');
                    })
                    .after('disablenav.test', () => $container.find(`.review-panel-item[data-control="${item.id}"]`).click())
                    .trigger('disablenav');
                window.setTimeout(resolve, 300);
            }))
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 5);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is expanded');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is active');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is expanded');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is active');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    })
                    .after('enablenav.test', () => $container.find(`.review-panel-item[data-control="${item.id}"]`).click())
                    .trigger('enablenav');
            }))
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
                assert.equal($container.find('.review-panel-part').length, 0, 'The test parts have been removed');
                assert.equal($container.find('.review-panel-section').length, 0, 'The test sections have been removed');
                assert.equal($container.find('.review-panel-item').length, 0, 'The test items have been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.test('update the filter', assert => {
        assert.expect(37);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-filter');
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .on('move', (direction, scope, position) => {
                        const item = mapHelper.getItemAt(runner.getTestMap(), position);
                        if (item) {
                            runner.loadItem(item.id);
                        }
                    })
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
            })
            .then(() => new Promise(resolve => {
                const item = mapHelper.getItemAt(runner.getTestMap(), 0);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    });
                $container.find(`.review-panel-item[data-control="${item.id}"]`).click();
            }))
            .then(() => new Promise(resolve => {
                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');

                const item = mapHelper.getItemAt(runner.getTestMap(), 1);
                runner
                    .off('.test')
                    .on('renderitem.test', itemRef => {
                        assert.equal(itemRef, item.id, 'The expected item has been rendered');
                        assert.equal($container.find(`.review-panel-item.active[data-control="${itemRef}"]`).length, 1, 'A test item is active');
                        resolve();
                    });
                $container.find('.review-panel-filter:nth(1)').click();
            }))
            .then(() => new Promise(resolve => {
                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is active');

                assert.equal($container.find('.review-panel-part').length, 1, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, 1, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, 4, 'The test items are rendered');

                $container.find('.review-panel-filter:nth(0)').click();

                window.setTimeout(resolve, 200);
            }))

            .then(() => {
                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
            })
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
                assert.equal($container.find('.review-panel-part').length, 0, 'The test parts have been removed');
                assert.equal($container.find('.review-panel-section').length, 0, 'The test sections have been removed');
                assert.equal($container.find('.review-panel-item').length, 0, 'The test items have been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.cases.init([{
        title: 'enabled',
        showScore: true
    }, {
        title: 'disabled',
        showScore: false
    }]).test('show score ', (data, assert) => {
        assert.expect(13);
        const ready = assert.async();
        const runner = getTestRunner('#fixture-score', {options: {showScore: data.showScore}});
        const areaBroker = runner.getAreaBroker();
        const $container = areaBroker.getArea('panel');

        Promise.resolve()
            .then(() => new Promise(resolve => {
                runner
                    .on('ready', resolve)
                    .on('move', (direction, scope, position) => {
                        const item = mapHelper.getItemAt(runner.getTestMap(), position);
                        if (item) {
                            runner.loadItem(item.id);
                        }
                    })
                    .init();
            }))
            .then(() => {
                const plugin = runner.getPlugin('review-panel');
                assert.ok(!!plugin, 'The plugin exists');
                assert.equal(typeof plugin, 'object', 'The plugin is returned');
                assert.equal($container.find('.review-panel').length, 1, 'The component has been inserted');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, 2, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');

                if (data.showScore) {
                    assert.equal($container.find('.review-panel-score').length, 11, 'The score values are rendered');
                } else {
                    assert.equal($container.find('.review-panel-score').length, 0, 'No score values are rendered');
                }
            })
            .then(() => new Promise(resolve => {
                runner
                    .on('destroy', resolve)
                    .destroy();
            }))
            .then(() => {
                assert.equal($container.find('.review-panel').length, 0, 'The component has been removed');
                assert.equal($container.find('.review-panel-part').length, 0, 'The test parts have been removed');
                assert.equal($container.find('.review-panel-section').length, 0, 'The test sections have been removed');
                assert.equal($container.find('.review-panel-item').length, 0, 'The test items have been removed');
            })
            .catch(err => {
                assert.ok(false, `Error in init method: ${err.message}`);
            })
            .then(ready);
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        assert.expect(1);
        const ready = assert.async();
        let currentItem = null;
        getTestRunner('#visual-test')
            .on('error', console.error)
            .on('ready', function() {
                assert.ok(true, 'The instance has been initialized');
                const first = mapHelper.getItemAt(this.getTestMap(), 0);
                this.loadItem(first.id);
                this.getAreaBroker().getNavigationArea().on('click', 'button', e => {
                    if (e.currentTarget.dataset.control === 'previous') {
                        this.previous();
                    } else {
                        this.next();
                    }
                });
                ready();
            })
            .on('move', function (direction, scope, position) {
                let item = null;
                if (direction === 'previous') {
                    const first = _.find(mapHelper.getJumps(this.getTestMap()), jump => jump.identifier);
                    if (currentItem && currentItem !== first) {
                        position = currentItem.position - 1;
                        do {
                            item = mapHelper.getItemAt(this.getTestMap(), position --);
                        } while (position >= 0 && !item);
                    }
                } else if (direction === 'next') {
                    const last = _.findLast(mapHelper.getJumps(this.getTestMap()), jump => jump.identifier);
                    if (currentItem && currentItem !== last) {
                        position = currentItem.position + 1;
                        do {
                            item = mapHelper.getItemAt(this.getTestMap(), position ++);
                        } while (position <= last.position && !item);
                    }
                } else {
                    item = mapHelper.getItemAt(this.getTestMap(), position);
                }
                if (item) {
                    this.loadItem(item.id);
                }
            })
            .on('renderitem', function(itemRef) {
                currentItem = mapHelper.getItem(this.getTestMap(), itemRef);
                this.getAreaBroker().getContentArea().html(`<h1>${currentItem.label}</h1><p>${itemRef} at #${currentItem.position}</p>`);
            })
            .init();
    });
});
