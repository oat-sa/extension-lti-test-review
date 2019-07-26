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
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function(
    $, 
    _,
    qtiTestReviewFactory,
    itemData1,
    itemData2,
    itemData3,
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

    QUnit.test('module', assert =>  {
        const ready = assert.async();
        const config = {};

        const review1 = qtiTestReviewFactory('#fixture-api', config);
        const review2 = qtiTestReviewFactory('#fixture-api', config);

        assert.expect(4);
        const idMock = $.mockjax({
            url: '/*',
            responseText: {
                success: true
            }
        });
        
        Promise.all([
            new Promise(resolve => review1.on('ready', resolve) ),
            new Promise(resolve => review2.on('ready', resolve) )
        ])
        .catch(function(err) {
            assert.pushResult({
                result: false,
                message: err
            });
        })
        .then( () => {
            assert.equal(typeof qtiTestReviewFactory, 'function', 'The review module exposes a function');
            assert.equal(typeof review1, 'object', 'The review factory returns an object');
            assert.equal(typeof review2, 'object', 'The review factory returns an object');
            assert.notEqual(review1, review2, 'The review factory returns a different instance on each call');
            review1.destroy()
            review2.destroy()
        })
        .then( ()=> {
            // Restore AJAX method
            $.mockjax.clear(idMock);
            ready();
        });

    });

    QUnit.cases.init([{
        title: 'itemData in init',
        mock: {
            url: '/init*',
            responseText: {
                success: true,
                itemIdentifier: 'item-1',
                itemData: {
                    content: {
                        type: 'qti',
                        data: itemData1
                    },
                    baseUrl: '',
                    state: {}
                }
            }
        }
    }, {
        title: 'itemRef in init',
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
                    data: itemData1
                },
                baseUrl: '',
                state: {}
            }
        }]
    }]).test('render item ', (data, assert) =>  {
        const ready = assert.async();
        const $container = $('#fixture-render');
        const config = {
            itemUri: data.itemIdentifier
        };

        assert.expect(1);

        const idMock = $.mockjax(data.mock);

        qtiTestReviewFactory($container, config)
            .on('error', function(err) {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', function(runner) {
                runner.after('renderitem', function() {
                    assert.ok(true, 'The review has been rendered');
                    runner.destroy();
                });
            })
            .after('destroy', function() {
                // Restore AJAX method
                $.mockjax.clear(idMock); 
                ready();
            });
                  
    });

    QUnit.test('destroy', assert =>  {
        const ready = assert.async();
        const $container = $('#fixture-destroy');
        const config = {};

        assert.expect(2);

        const idMock = $.mockjax({
            url: '/init*',
            responseText: {
                success: true
            }
        });

        qtiTestReviewFactory($container, config)
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
                // Restore AJAX method
                $.mockjax.clear(idMock); 
                ready();
            });
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', function (assert) {
        const ready = assert.async();
        const $container = $('#visual-test');
        const config = {
            itemUri: 'item-1',
            fullPage: false,
            readOnly: true,
            plugins: [{
                module: 'taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
                bundle: 'taoReview/loader/qtiReview.min',
                category: 'navigation'
            }]
        };

        assert.expect(1);

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

        qtiTestReviewFactory($container, config)
            .on('error', function(err) {
                assert.ok(false, 'An error has occurred');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            })
            .on('ready', function(runner) {
                runner.after('renderitem.runnerComponent', function() {
                    assert.ok(true, 'The review has been rendered');
                    ready();
                });
            });
    });
});
