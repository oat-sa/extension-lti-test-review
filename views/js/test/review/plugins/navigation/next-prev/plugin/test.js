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
    'taoReview/review/component/qtiTestReviewComponent',
    'taoReview/review/plugins/navigation/next-prev/plugin',
    'json!taoReview/test/mocks/item-1.json',
    'json!taoReview/test/mocks/item-2.json',
    'json!taoReview/test/mocks/item-3.json',
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax',
    'css!taoReview/review/provider/css/qtiTestReviewProvider'
], function (
    $,
    reviewFactory,
    pluginFactory,
    itemData1,
    itemData2,
    itemData3,
    testData,
    testContext,
    testMap,
    testResponses
) {
    'use strict';

    const componentConfig = {
        serviceCallId: 'foo',
        plugins: [{
            module: 'taoReview/review/plugins/navigation/next-prev/plugin',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'navigation'
        }]
    };

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Mock the queries
    $.mockjax({
        url: '/init*',
        responseText: {
            success: true,
            itemIdentifier: 'item-1',
            testData: testData,
            testContext: testContext,
            testMap: testMap,
            testResponses: testResponses
        }
    });
    $.mockjax({
        url: '/getItem*item-1',
        responseText: {
            success: true,
            content: {
                type: 'qti',
                data: itemData1
            },
            baseUrl: '',
            state: {}
        }
    });
    $.mockjax({
        url: '/getItem*item-2',
        responseText: {
            success: true,
            content: {
                type: 'qti',
                data: itemData2
            },
            baseUrl: '',
            state: {}
        }
    });
    $.mockjax({
        url: '/getItem*item-3',
        responseText: {
            success: true,
            content: {
                type: 'qti',
                data: itemData3
            },
            baseUrl: '',
            state: {}
        }
    });

    QUnit.module('API');

    QUnit.test('module', assert => {
        const ready = assert.async();
        assert.expect(3);

        reviewFactory('#fixture-api', componentConfig)
            .on('ready', runner => {
                assert.equal(typeof pluginFactory, 'function', 'The module exposes a function');
                assert.equal(typeof pluginFactory(runner), 'object', 'The factory produces an instance');
                assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), 'The factory provides a different instance on each call');
                runner.destroy();
            })
            .on('destroy', ready);
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
        const ready = assert.async();
        assert.expect(1);
        reviewFactory('#fixture-api', componentConfig)
            .on('ready', runner => {
                const plugin = pluginFactory(runner);
                assert.equal(typeof plugin[data.title], 'function', `The instances expose a ${data.title} function`);
                runner.destroy();
            })
            .on('destroy', ready);
    });

    QUnit.module('UI');

    QUnit.test('render / destroy / enable / disable', assert => {
        const ready = assert.async();
        assert.expect(11);

        reviewFactory('#fixture-render', componentConfig)
            .on('ready', runner => {
                const areaBroker = runner.getAreaBroker();
                const plugin = runner.getPlugin('next-prev');
                const $navigation = areaBroker.getNavigationArea();
                const $element = $navigation.find('.next-prev');
                const $nextButton = $navigation.find('[data-control="next"]');
                const $prevButton = $navigation.find('[data-control="prev"]');
                Promise.resolve()
                    .then(() => {
                        assert.equal($element.length, 1, 'The element has been inserted');
                        assert.equal($nextButton.length, 1, 'The next button has been inserted');
                        assert.equal($prevButton.length, 1, 'The prev button has been inserted');
                        assert.equal($element.hasClass('disabled'), true, 'The navigation has been rendered disabled');
                        return plugin.enable();
                    })
                    .then(() => {
                        assert.equal($element.hasClass('disabled'), false, 'The navigation has been enabled');
                        return new Promise(resolve => {
                            runner
                                .after('disablenav', resolve)
                                .trigger('disablenav');
                        });
                    })
                    .then(() => {
                        assert.equal($element.hasClass('disabled'), true, 'The navigation has been disabled');
                        return new Promise(resolve => {
                            runner
                                .after('enablenav', resolve)
                                .trigger('enablenav');
                        });
                    })
                    .then(() => {
                        assert.equal($element.hasClass('disabled'), false, 'The navigation has been enabled');
                        return plugin.disable();
                    })
                    .then(() => {
                        assert.equal($element.hasClass('disabled'), true, 'The navigation has been disabled');
                        return plugin.destroy();
                    })
                    .then(() => {
                        assert.equal($navigation.find('.next-prev').length, 0, 'The element has been removed');
                        assert.equal($navigation.find('[data-control="next"]').length, 0, 'The next button has been removed');
                        assert.equal($navigation.find('[data-control="prev"]').length, 0, 'The prev button has been removed');
                        runner.destroy();
                    })
                    .catch(err => {
                        assert.ok(false, `Error in init method: ${err.message}`);
                        runner.destroy();
                    });
            })
            .on('destroy', ready);
    });

    QUnit.module('behavior');

    QUnit.test('Navigation', assert => {
        const ready = assert.async();
        assert.expect(17);
        reviewFactory('#fixture-navigation', componentConfig)
            .on('ready', runner => {
                const areaBroker = runner.getAreaBroker();
                const $navigation = areaBroker.getNavigationArea();
                let $element = $navigation.find('.next-prev');
                let $nextButton = $navigation.find('[data-control="next"]');
                let $prevButton = $navigation.find('[data-control="prev"]');
                Promise.resolve()
                    .then(() => new Promise(resolve => {
                        runner.after('renderitem', resolve);
                    }))
                    .then(() => {
                        assert.equal($element.length, 1, 'The element has been inserted');
                        assert.equal($nextButton.length, 1, 'The next button has been inserted');
                        assert.equal($prevButton.length, 1, 'The prev button has been inserted');
                        assert.equal($prevButton.is(':disabled'), true, 'The prevButton has been rendered disabled');
                    })
                    .then(() => new Promise(resolve => {
                        runner.after('move.test', direction => {
                            assert.equal(direction, 'next', 'The move with direction === next is submitted');
                            resolve();
                        });
                        $nextButton.click();
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('renderitem.test', itemRef => {
                                assert.equal(itemRef, 'item-2', 'Item "item-2" is rendered');
                                assert.equal($prevButton.is(':disabled'), false, 'The prevButton has been enabled');
                                resolve();
                            });
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('move.test', direction => {
                                assert.equal(direction, 'next', 'The move with direction === next is submitted');
                                resolve();
                            });
                        $nextButton.click();
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('renderitem.test', itemRef => {
                                assert.equal(itemRef, 'item-3', 'Item "item-3" is rendered');
                                assert.equal($nextButton.is(':disabled'), true, 'The nextButton has been disabled');
                                resolve();
                            });
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('move.test', direction => {
                                assert.equal(direction, 'previous', 'The move with direction === previous is submitted');
                                resolve();
                            });
                        $prevButton.click();
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('renderitem.test', itemRef => {
                                assert.equal(itemRef, 'item-2', 'Item "item-2" is rendered');
                                assert.equal($nextButton.is(':disabled'), false, 'The nextButton has been enabled');
                                assert.equal($prevButton.is(':disabled'), false, 'The prevButton has been enabled');
                                resolve();
                            });
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('move.test', direction => {
                                assert.equal(direction, 'previous', 'The move with direction === previous is submitted');
                                resolve();
                            });
                        $prevButton.click();
                    }))
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .after('renderitem.test', itemRef => {
                                assert.equal(itemRef, 'item-1', 'Item "item-1" is rendered');
                                resolve();
                            });
                    }))
                    .then(() => {
                        assert.ok($element.is(':visible'), 'The element is visible');
                        return runner.destroy();
                    })
                    .catch(err => {
                        assert.ok(false, `Error in init method: ${err.message}`);
                        runner.destroy();
                    });
            })
            .on('destroy', ready);
    });


    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test');

        assert.expect(1);

        reviewFactory($container, componentConfig)
            .on('error', err => {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', runner => {
                runner
                    .after('renderitem.test', () => {
                        runner.off('.test');
                        assert.ok(true, 'The review has been rendered');
                        ready();
                    });
            });
    });

});
