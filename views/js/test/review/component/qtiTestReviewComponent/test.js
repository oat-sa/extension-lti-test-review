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
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoReview/review/component/qtiTestReviewComponent',
    'json!taoReview/test/mocks/item-1.json',
    'json!taoReview/test/mocks/item-2.json',
    'json!taoReview/test/mocks/item-3.json',
    'json!taoReview/test/mocks/item-4.json',
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function (
    $,
    _,
    qtiTestReviewFactory,
    itemData1,
    itemData2,
    itemData3,
    itemData4,
    testData,
    testContext,
    testMap,
    testResponses
) {
    'use strict';

    QUnit.module('API');

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Restore AJAX method after each test
    QUnit.testDone(details => {
        if (details.name !== 'Visual test') {
            $.mockjax.clear();
        }
    });

    QUnit.test('module', assert => {
        const ready = assert.async();
        const config = {};

        const review1 = qtiTestReviewFactory('#fixture-api', config);
        const review2 = qtiTestReviewFactory('#fixture-api', config);

        assert.expect(4);
        $.mockjax({
            url: '/*',
            responseText: {
                success: true
            }
        });

        Promise.all([
            new Promise(resolve => review1.on('ready', resolve)),
            new Promise(resolve => review2.on('ready', resolve))
        ])
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(() => {
                assert.equal(typeof qtiTestReviewFactory, 'function', 'The review module exposes a function');
                assert.equal(typeof review1, 'object', 'The review factory returns an object');
                assert.equal(typeof review2, 'object', 'The review factory returns an object');
                assert.notEqual(review1, review2, 'The review factory returns a different instance on each call');
                review1.destroy();
                review2.destroy();
            })
            .then(() => {
                ready();
            });

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
        const ready = assert.async();
        const $container = $('#fixture-render');
        const config = {
            itemUri: data.itemIdentifier
        };

        assert.expect(1);

        $.mockjax([{
            url: '/init*',
            responseText: data.initData
        }, {
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData1
                },
                baseUrl: '',
                state: {}
            }
        }]);

        qtiTestReviewFactory($container, config)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', runner => {
                runner.after('renderitem', () => {
                    assert.ok(true, 'The review has been rendered');
                    runner.destroy();
                });

                if (data.itemIdentifier) {
                    runner.loadItem(data.itemIdentifier);
                }
            })
            .after('destroy', ready);
    });

    QUnit.test('destroy', assert => {
        const ready = assert.async();
        const $container = $('#fixture-destroy');
        const config = {};

        assert.expect(2);

        $.mockjax({
            url: '/init*',
            responseText: {
                success: true
            }
        });

        qtiTestReviewFactory($container, config)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', runner => {
                assert.equal($container.children().length, 1, 'The review has been rendered');
                runner.destroy();
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The review has been destroyed');
                ready();
            });
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test');
        const config = {
            itemUri: 'item-1',
            fullPage: false,
            readOnly: true,
            plugins: [{
                module: 'taoReview/review/plugins/navigation/review-panel/plugin',
                bundle: 'taoReview/loader/qtiReview.min',
                category: 'navigation'
            }, {
                module: 'taoReview/review/plugins/navigation/next-prev/plugin',
                bundle: 'taoReview/loader/qtiReview.min',
                category: 'navigation'
            }, {
                module: 'taoReview/review/plugins/content/item-answer/plugin',
                bundle: 'taoReview/loader/qtiReview.min',
                category: 'content'
            }]
        };

        assert.expect(1);

        $.mockjax([{
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-1',
                testData: testData,
                testContext: testContext,
                testMap: testMap,
                testResponses: testResponses
            }
        }, {
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
        }, {
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
        }, {
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
        }, {
            url: '/getItem*item-4',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData4
                },
                baseUrl: '',
                state: {}
            }
        }]);

        qtiTestReviewFactory($container, config)
            .on('error', err => {
                console.error(err);
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', runner => {
                runner.after('renderitem.test', () => {
                    runner.off('.test');
                    assert.ok(true, 'The review has been rendered');
                    ready();
                });
            });
    });
});
