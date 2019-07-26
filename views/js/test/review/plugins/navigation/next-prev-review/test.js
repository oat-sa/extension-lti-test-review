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
    'i18n',
    'ui/hider',
    'taoReview/review/runner',
    'taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
    'json!taoReview/test/mocks/item-1.json',
    'json!taoReview/test/mocks/item-2.json',
    'json!taoReview/test/mocks/item-3.json',
    'json!taoReview/test/mocks/testData.json',
    'json!taoReview/test/mocks/testContext.json',
    'json!taoReview/test/mocks/testMap.json',
    'json!taoReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax',
    'css!taoReview/review/provider/test/css/test'
], function (
    $,
    _,
    __,
    hider,
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

    const runnerConfig = {
        serviceCallId : 'foo',
        providers : {
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
            plugins: [{
                module: 'taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
                bundle: 'taoReview/loader/qtiReview.min',
                category: 'navigation'
            }]
        },
        options : {
            fullPage: false,
            readOnly: true
        }
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

    QUnit.test('module', assert =>  {
        const ready = assert.async();
        assert.expect(3);

        reviewFactory('#fixture-api', runnerConfig)
            .on('ready', function (runner) {
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
    ]).test('plugin API ', (data, assert) =>  {
        const ready = assert.async();
        assert.expect(1);
        reviewFactory('#fixture-api', runnerConfig)
            .on('ready', function (runner) {
                const plugin = pluginFactory(runner);
                assert.equal(typeof plugin[data.title], 'function', `The instances expose a ${data.title} function`);
                runner.destroy();
            })
            .on('destroy', ready);
    });

    QUnit.module('UI');

    QUnit.test('render / destroy / enable / disable', assert =>  {
        const ready = assert.async();
        assert.expect(11);

        reviewFactory('#fixture-enable', runnerConfig)
            .on('ready', function (runner) {
                const areaBroker = runner.getAreaBroker();
                const plugin = runner.getPlugin('next-prev-review');
                const $navigation = areaBroker.getPanelArea();
                let $element = $navigation.find('[data-control="next-prev-review"]');
                let $nextButton = $navigation.find('[data-control="next"]');
                let $prevButton = $navigation.find('[data-control="prev"]');
                Promise.resolve()
                    .then(function () {
                        assert.equal($element.length, 1, 'The element has been inserted');
                        assert.equal($nextButton.length, 1, 'The next button has been inserted');
                        assert.equal($prevButton.length, 1, 'The prev button has been inserted');
                        assert.equal($element.hasClass('disabled'), true, 'The button has been rendered disabled');
                        return plugin.enable();
                    })
                    .then(function () {
                        assert.equal($element.hasClass('disabled'), false, 'The element has been enabled');
                        return new Promise(function (resolve) {
                            runner
                                .after('disablenav', resolve)
                                .trigger('disablenav');
                        });
                    })
                    .then(function () {
                        assert.equal($element.hasClass('disabled'), true, 'The element has been disabled');
                        return new Promise(function (resolve) {
                            runner
                                .after('enablenav', resolve)
                                .trigger('enablenav');
                        });
                    })
                    .then(function () {
                        assert.equal($element.hasClass('disabled'), false, 'The element has been enabled');
                        return plugin.disable();
                    })
                    .then(function () {
                        assert.equal($element.hasClass('disabled'), true, 'The element has been disabled');
                        return plugin.destroy();
                    })
                    .then(function () {
                        const $element = $navigation.find('[data-control="next-prev-review"]');
                        const $nextButton = $navigation.find('[data-control="next"]');
                        const $prevButton = $navigation.find('[data-control="prev"]');
                        assert.equal($element.length, 0, 'The element has been removed');
                        assert.equal($nextButton.length, 0, 'The next button has been removed');
                        assert.equal($prevButton.length, 0, 'The prev button has been removed');
                        runner.destroy();
                    })
                    .catch(function (err) {
                        assert.ok(false, `Error in init method: ${err.message}`);
                        runner.destroy();
                    });
            })
            .on('destroy', ready);
    });

    QUnit.module('behavior');

    // QUnit.test('submit', assert =>  {
    //     const ready = assert.async();
    //     assert.expect(14);
    //     reviewFactory('#fixture-show', runnerConfig)
    //         .on('ready', function (runner) {
    //             const areaBroker = runner.getAreaBroker();
    //             const plugin = runner.getPlugin('submit');
    //             Promise.resolve()
    //                 .then(function () {
    //                     return new Promise(function (resolve) {
    //                         runner
    //                             .after('renderitem', resolve)
    //                             .loadItem('item-1');
    //                     });
    //                 })
    //                 .then(function () {
    //                     const $container = areaBroker.getContainer();
    //                     const $navigation = areaBroker.getNavigationArea();
    //                     const $button = $navigation.find('[data-control="submit"]');
    //                     const $closer = $navigation.find('.preview-console-closer');
    //                     const $console = $container.find('.preview-console');
    //                     assert.equal($closer.length, 1, 'The console closer has been inserted');
    //                     assert.equal($console.length, 1, 'The console has been inserted');
    //                     assert.equal($button.length, 1, 'The button has been inserted');
    //                     assert.equal($button.hasClass('disabled'), false, 'The button has been enabled');
    //                 })
    //                 .then(function () {
    //                     return new Promise(function (resolve) {
    //                         const $navigation = areaBroker.getNavigationArea();
    //                         const $button = $navigation.find('[data-control="submit"]');
    //                         runner.after('scoreitem', function() {
    //                             assert.ok('The score is submitted');
    //                             resolve();
    //                         });
    //                         $button.click();
    //                     });
    //                 })
    //                 .then(function () {
    //                     const $container = areaBroker.getContainer();
    //                     const $navigation = areaBroker.getNavigationArea();
    //                     const $button = $navigation.find('[data-control="submit"]');
    //                     const $closer = $navigation.find('.preview-console-closer');
    //                     const $console = $container.find('.preview-console');
    //                     assert.ok(!hider.isHidden($button), 'The button is visible');
    //                     assert.ok(!hider.isHidden($closer), 'The console closer is visible');
    //                     assert.ok(!hider.isHidden($console), 'The console is visible');
    //                     $closer.click();
    //                 })
    //                 .then(function () {
    //                     const $container = areaBroker.getContainer();
    //                     const $navigation = areaBroker.getNavigationArea();
    //                     const $button = $navigation.find('[data-control="submit"]');
    //                     const $closer = $navigation.find('.preview-console-closer');
    //                     const $console = $container.find('.preview-console');
    //                     assert.ok(!hider.isHidden($button), 'The button is visible');
    //                     assert.ok(hider.isHidden($closer), 'The console closer is hidden');
    //                     assert.ok(hider.isHidden($console), 'The console is hidden');
    //                     return plugin.destroy();
    //                 })
    //                 .then(function () {
    //                     const $container = areaBroker.getContainer();
    //                     const $navigation = areaBroker.getNavigationArea();
    //                     const $button = $navigation.find('[data-control="submit"]');
    //                     const $closer = $navigation.find('.preview-console-closer');
    //                     const $console = $container.find('.preview-console');
    //                     assert.equal($button.length, 0, 'The trigger button has been removed');
    //                     assert.equal($closer.length, 0, 'The console closer has been removed');
    //                     assert.equal($console.length, 0, 'The console has been removed');
    //                     runner.destroy();
    //                 })
    //                 .catch(function (err) {
    //                     assert.ok(false, `Error in init method: ${err.message}`);
    //                     runner.destroy();
    //                 });
    //         })
    //         .on('destroy', ready);
    // });



    QUnit.module('Visual');

    QUnit.test('Visual test', assert =>  {
        const ready = assert.async();
        const $container = $('#visual-test');
        const itemRef = 'item-1';

        assert.expect(1);

        reviewFactory($container, runnerConfig)
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
            });
    });

});
