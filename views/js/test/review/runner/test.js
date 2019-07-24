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
    'taoReview/review/runner',
    'json!taoReview/test/mocks/item-1.json',
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax',
    'css!taoReview/review/provider/test/css/test'
], function($, _, reviewFactory, itemData, testData, testContext, testMap, testResponses) {
    'use strict';

    const providers = {
        runner: {
            id: 'qtiTestReviewProvider',
            module: 'taoReview/review/provider/test/qtiTestReviewProvider',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'runner'
        },
        proxy: {
            id: 'qtiTestReviewProxy',
            module: 'taoReview/review/proxy/qtiTestReviewProxy',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'proxy'
        },
        communicator: {
            id: 'request',
            module: 'core/communicator/request',
            bundle: 'loader/vendor.min',
            category: 'communicator'
        },
    };

    QUnit.module('API');

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Restore AJAX method after each test
    QUnit.testDone(function() {
        $.mockjax.clear();
    });

    QUnit.test('module', assert =>  {
        const ready = assert.async();
        const config = {
            serviceCallId: 'foo',
            providers,
            options : {}
        };

        const review1 = reviewFactory('#fixture-1', config);
        const review2 = reviewFactory('#fixture-2', config);

        assert.expect(4);
        $.mockjax({
            url: '/*',
            responseText: {
                success: true
            }
        });
        
        Promise.all([
            new Promise(resolve => review1.on('ready', resolve) ),
            new Promise(resolve => review2.on('ready', resolve) )
        ]).catch(function(err) {
            assert.pushResult({
                result: false,
                message: err
            });
        })
        .then( () => {
            assert.equal(typeof reviewFactory, 'function', 'The review module exposes a function');
            assert.equal(typeof review1, 'object', 'The review factory returns an object');
            assert.equal(typeof review2, 'object', 'The review factory returns an object');
            assert.notEqual(review1, review2, 'The review factory returns a different instance on each call');
            review1.destroy()
            review2.destroy()
        })
        .then( ready );
    });

    QUnit.cases.init([{
        title: 'itemData in init',
        fixture: '#fixture-item-1',
        mock: {
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-1',
                itemData: {
                    content: {
                        type: 'qti',
                        data: itemData
                    },
                    baseUrl: '',
                    state: {}
                }
            }
        }
    }, {
        title: 'itemRef in init',
        fixture: '#fixture-item-2',
        mock: [{
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-2'
            }
        }, {
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        }]
    }, {
        title: 'manual load',
        fixture: '#fixture-item-3',
        itemIdentifier: 'item-3',
        mock: [{
            url: '/init*',
            responseText: {
                success: true
            }
        }, {
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        }]
    }]).test('render item ', (data, assert) =>  {
        const ready = assert.async();
        const $container = $(data.fixture);
        const serviceCallId = 'review';
        const config = {
            serviceCallId: serviceCallId,
            providers,
            options : {}
        };

        assert.expect(1);

        $.mockjax(data.mock);

        reviewFactory($container, config)
            .on('error', function(err) {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', function(runner) {
                runner
                    .after('renderitem', function() {
                        assert.ok(true, 'The review has been rendered');
                        runner.destroy();
                    })
                    .after('destroy', function() {
                        ready();
                    });

                if (data.itemIdentifier) {
                    runner.loadItem(data.itemIdentifier);
                }
            });
    });

    QUnit.test('destroy', assert =>  {
        const ready = assert.async();
        const $container = $('#fixture-destroy');
        const serviceCallId = 'review';
        const config = {
            serviceCallId,
            providers,
            options : {}
        };

        assert.expect(2);

        $.mockjax({
            url: '/init*',
            responseText: {
                success: true
            }
        });

        reviewFactory($container, config)
            .on('error', function(err) {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', function(runner) {
                assert.equal($container.children().length, 1, 'The review has been rendered');
                runner.destroy();
            })
            .after('destroy', function() {
                assert.equal($container.children().length, 0, 'The review has been destroyed');
                ready();
            });
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', function (assert) {
        const ready = assert.async();
        const $container = $('#visual-test');
        const serviceCallId = 'review';
        const itemRef = 'item-1';
        const config = {
            serviceCallId: serviceCallId,
            providers: {
                runner : providers.runner,
                proxy : providers.proxy,
                plugins: [{
                    module: 'taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
                    bundle: 'taoReview/loader/qtiReview.min',
                    category: 'navigation'
                }]
            },
            options : {
                fullPage: false,
                readOnly: true
            },
        };

        assert.expect(1);

        $.mockjax({
            url: '/init*',
            responseText: {
                success: true,
                testData: testData,
                testContext: testContext,
                testMap: testMap,
                testResponses: testResponses
            }
        });
        $.mockjax({
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        });

        reviewFactory($container, config)
            .on('error', function(err) {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', function(runner) {
                runner
                    .after('renderitem.runnerComponent', function() {
                        assert.ok(true, 'The review has been rendered');
                        ready();
                    })
                    .loadItem(itemRef);
            });
    });
});
