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
    'i18n',
    'ltiTestReview/review/component/qtiTestReviewComponent',
    'ltiTestReview/review/plugins/content/item-answer/plugin',
    'json!ltiTestReview/test/mocks/item-1.json',
    'json!ltiTestReview/test/mocks/item-2.json',
    'json!ltiTestReview/test/mocks/item-3.json',
    'json!ltiTestReview/test/mocks/item-4.json',
    'json!ltiTestReview/test/mocks/testData.json',
    'json!ltiTestReview/test/mocks/testContext.json',
    'json!ltiTestReview/test/mocks/testMap.json',
    'json!ltiTestReview/test/mocks/testResponses.json',
    'lib/jquery.mockjax/jquery.mockjax',
    'css!ltiTestReview/review/provider/css/qtiTestReviewProvider'
], function (
    $,
    __,
    reviewFactory,
    pluginFactory,
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

    const componentConfig = {
        serviceCallId: 'foo',
        plugins: [{
            module: 'ltiTestReview/review/plugins/navigation/next-prev/plugin',
            bundle: 'ltiTestReview/loader/ltiTestReview.min',
            category: 'navigation'
        }, {
            module: 'ltiTestReview/review/plugins/content/item-answer/plugin',
            bundle: 'ltiTestReview/loader/ltiTestReview.min',
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
    $.mockjax({
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

    QUnit.test('status', assert => {
        const ready = assert.async();
        const config = Object.assign({
            showScore: true,
            showCorrect: true,
        }, componentConfig);
        assert.expect(47);

        reviewFactory('#fixture-status', config)
            .on('ready', runner => {
                const areaBroker = runner.getAreaBroker();
                const plugin = runner.getPlugin('item-answer');
                const $container = areaBroker.getArea('itemTool');
                const $item = areaBroker.getContentArea();

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
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-1', 'The first item is rendered');
                                resolve();
                            });
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.correct'), true, 'The component is set to "correct"');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 1/1`, 'The score is set');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');

                        assert.strictEqual($item.find('[data-identifier="choice_1"]').is('.user-selected'), false, 'Choice #1 is not checked');
                        assert.strictEqual($item.find('[data-identifier="choice_2"]').is('.user-selected'), true, 'Choice #2 is checked');
                        assert.strictEqual($item.find('[data-identifier="choice_3"]').is('.user-selected'), false, 'Choice #3 is not checked');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-2', 'The second item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.incorrect'), true, 'The component is set to "incorrect"');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 0/1`, 'The score is set');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), __('No response'), 'The status is set');

                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_1"]').length, 1, 'Choice #1 is not selected');
                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_3"]').length, 1, 'Choice #3 is not selected');
                        assert.strictEqual($item.find('.result-area [data-identifier="choice_2"]').length, 1, 'Choice #2 is selected');
                        assert.strictEqual($item.find('.result-area [data-identifier="choice_4"]').length, 1, 'Choice #4 is selected');

                        $container.find('.item-answer .tab[data-tab-name="correct"] .action').click();
                    })
                    .then(() => {
                        assert.strictEqual($item.find('.result-area [data-identifier="choice_1"]').length, 1, 'Choice #1 is selected');
                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_2"]').length, 1, 'Choice #2 is not selected');
                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_3"]').length, 1, 'Choice #3 is not selected');
                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_4"]').length, 1, 'Choice #4 is not selected');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-3', 'The third item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.incorrect'), true, 'The component is set to "incorrect"');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 0/1`, 'The score is set');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-4', 'The fourth item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.informational'), true, 'The component is set to "informational"');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is empty');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');
                    })
                    .then(() => plugin.destroy())
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

    QUnit.cases.init([{
        title: 'default',
        config: {
            showScore: true,
            showCorrect: true,
        },
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false
        }
    }, {
        title: 'score disabled',
        config: {
            showScore: false,
            showCorrect: true
        },
        expected: {
            showScore: false,
            showCorrect: true,
            hidden: false
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showScore: true,
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false
        }
    }, {
        title: 'correct responses and score disabled',
        config: {
            showScore: false,
            showCorrect: false
        },
        expected: {
            showScore: false,
            showCorrect: false,
            hidden: true
        }
    }]).test('options', (data, assert) => {
        const ready = assert.async();
        assert.expect(54);

        reviewFactory('#fixture-options', Object.assign(data.config, componentConfig))
            .on('ready', runner => {
                const areaBroker = runner.getAreaBroker();
                const plugin = runner.getPlugin('item-answer');
                const $container = areaBroker.getArea('itemTool');
                const $item = areaBroker.getContentArea();

                assert.strictEqual($container.find('.item-answer').length, 1, 'The itemAnswer component has been rendered');
                assert.strictEqual($container.find('.item-answer').is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.find('.item-answer').is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');
                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                Promise.resolve()
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-1', 'The first item is rendered');
                                resolve();
                            });
                    }))
                    .then(() => {
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer').is('.correct'), true, 'The component is set to "correct"');
                        } else {
                            assert.strictEqual($container.find('.item-answer').is('.default'), true, 'The component is set to "default"');
                        }
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        } else {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one should be present');
                        }
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 1/1`, 'The score is set');
                        } else {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is not presented');
                        }
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');

                        assert.strictEqual($item.find('[data-identifier="choice_1"]').is('.user-selected'), false, 'Choice #1 is not checked');
                        assert.strictEqual($item.find('[data-identifier="choice_2"]').is('.user-selected'), true, 'Choice #2 is checked');
                        assert.strictEqual($item.find('[data-identifier="choice_3"]').is('.user-selected'), false, 'Choice #3 is not checked');

                        assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                        assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                        assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                        assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-2', 'The second item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer').is('.incorrect'), true, 'The component is set to "incorrect"');
                        } else {
                            assert.strictEqual($container.find('.item-answer').is('.skipped'), true, 'The component is set to "skipped"');
                        }
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        } else {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        }
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 0/1`, 'The score is set');
                        } else {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is not presented');
                        }
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), __('No response'), 'The status is set');

                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_1"]').length, 1, 'Choice #1 is not selected');
                        assert.strictEqual($item.find('.choice-area [data-identifier="choice_3"]').length, 1, 'Choice #3 is not selected');
                        assert.strictEqual($item.find('.result-area [data-identifier="choice_2"]').length, 1, 'Choice #2 is selected');
                        assert.strictEqual($item.find('.result-area [data-identifier="choice_4"]').length, 1, 'Choice #4 is selected');

                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('.item-answer .tab[data-tab-name="correct"]').length, 1, 'The tab correct is presented');
                            $container.find('.item-answer .tab[data-tab-name="correct"] .action').click();
                        } else {
                            assert.strictEqual($container.find('.item-answer .tab[data-tab-name="correct"]').length, 0, 'The tab correct is not presented');
                        }
                    })
                    .then(() => {
                        if (data.expected.showCorrect) {
                            assert.strictEqual($item.find('.result-area [data-identifier="choice_1"]').length, 1, 'Choice #1 is selected');
                            assert.strictEqual($item.find('.choice-area [data-identifier="choice_2"]').length, 1, 'Choice #2 is not selected');
                            assert.strictEqual($item.find('.choice-area [data-identifier="choice_3"]').length, 1, 'Choice #3 is not selected');
                            assert.strictEqual($item.find('.choice-area [data-identifier="choice_4"]').length, 1, 'Choice #4 is not selected');
                        } else {
                            assert.strictEqual($item.find('.choice-area [data-identifier="choice_1"]').length, 1, 'Choice #1 is not selected');
                            assert.strictEqual($item.find('.choice-area [data-identifier="choice_3"]').length, 1, 'Choice #3 is not selected');
                            assert.strictEqual($item.find('.result-area [data-identifier="choice_2"]').length, 1, 'Choice #2 is selected');
                            assert.strictEqual($item.find('.result-area [data-identifier="choice_4"]').length, 1, 'Choice #4 is selected');
                        }
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-3', 'The third item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer').is('.incorrect'), true, 'The component is set to "incorrect"');
                        } else {
                            assert.strictEqual($container.find('.item-answer').is('.default'), true, 'The component is set to "default"');
                        }
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        } else {
                            assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        }
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        if (data.expected.showScore) {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), `${__('Your Score:')} 0/1`, 'The score is set');
                        } else {
                            assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is not presented');
                        }
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');
                    })
                    .then(() => new Promise(resolve => {
                        runner
                            .off('.test')
                            .on('renderitem.test', itemRef => {
                                assert.strictEqual(itemRef, 'item-4', 'The fourth item is rendered');
                                resolve();
                            })
                            .next();
                    }))
                    .then(() => {
                        assert.strictEqual($container.find('.item-answer').is('.informational'), true, 'The component is set to "informational"');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is empty');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status is empty');
                    })
                    .then(() => plugin.destroy())
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
