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
    'taoReview/review/plugins/content/item-answer/plugin',
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
        }, {
            module: 'taoReview/review/plugins/content/item-answer/plugin',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'content'
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
        assert.expect(22);

        reviewFactory('#fixture-render', componentConfig)
            .on('ready', runner => {
                const areaBroker = runner.getAreaBroker();
                const plugin = runner.getPlugin('item-answer');
                const $container = areaBroker.getArea('itemTool');

                assert.strictEqual($container.find('.item-answer').length, 1, 'The itemAnswer component has been rendered');
                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                Promise.resolve()
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', () => {
                                resolve();
                            });
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        return plugin.disable();
                    })
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer.disabled').length, 1, 'The itemAnswer component has been disabled');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"] .action:disabled').length, 1, 'The tab "answer" is disabled');
                        return plugin.enable();
                    })
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.disabled'), false, 'The itemAnswer component has been enabled');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"] .action').is(':disabled'), false, 'The tab "answer" is enabled');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .after('disablenav', resolve)
                            .trigger('disablenav');
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer.disabled').length, 1, 'The itemAnswer component has been disabled');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"] .action:disabled').length, 1, 'The tab "answer" is disabled');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .after('enablenav', resolve)
                            .trigger('enablenav');
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.disabled'), false, 'The itemAnswer component has been enabled');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"] .action').is(':disabled'), false, 'The tab "answer" is enabled');
                        return plugin.destroy();
                    })
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').length, 0, 'The itemAnswer component has been removed');
                        assert.strictEqual($container.find('.item-answer-bar').length, 0, 'The component has removed the bar');
                        assert.strictEqual($container.find('.item-answer-tabs').length, 0, 'The component has removed the tabs area');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 0, 'The component has removed the tabs bar');
                        assert.strictEqual($container.find('.item-answer-score').length, 0, 'The component has removed the score area');
                        assert.strictEqual($container.find('.item-answer-status').length, 0, 'The component has removed the status area');
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


    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test');

        assert.expect(1);

        reviewFactory($container, componentConfig)
            .on('error', err => {
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
