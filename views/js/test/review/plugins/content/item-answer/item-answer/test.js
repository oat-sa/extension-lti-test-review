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
    'ltiTestReview/review/plugins/content/item-answer/item-answer'
], function (
    $,
    _,
    itemAnswerFactory
) {
    'use strict';

    function getInstance(fixture, config = {}) {
        return itemAnswerFactory(fixture, config)
            .on('ready', function () {
                this.destroy();
            });
    }

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        const fixture = '#fixture-api';
        assert.expect(3);
        assert.strictEqual(typeof itemAnswerFactory, 'function', 'The module exposes a function');
        assert.strictEqual(typeof getInstance(fixture), 'object', 'The factory produces an object');
        assert.notStrictEqual(getInstance(fixture), getInstance(fixture), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'destroy'},
        {title: 'render'},
        {title: 'setSize'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'},
        {title: 'is'},
        {title: 'setState'},
        {title: 'getContainer'},
        {title: 'getElement'},
        {title: 'getTemplate'},
        {title: 'setTemplate'},
        {title: 'getConfig'}
    ]).test('inherited API', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.strictEqual(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });


    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.strictEqual(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.cases.init([
        {title: 'getScore'},
        {title: 'setScore'},
        {title: 'getStatus'},
        {title: 'setStatus'},
        {title: 'getActiveTab'},
    ]).test('component API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.strictEqual(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('Life cycle');

    QUnit.cases.init([{
        title: 'default',
        expected: {
            status: 'informational',
            score: '',
            correct: false,
            skipped: false,
            informational: true,
        }
    }, {
        title: 'score',
        config: {
            score: '3/4'
        },
        expected: {
            status: 'informational',
            score: '3/4',
            correct: false,
            skipped: false,
            informational: true,
        }
    }, {
        title: 'informational',
        config: {
            status: 'informational'
        },
        expected: {
            status: 'informational',
            score: '',
            correct: false,
            skipped: false,
            informational: true,
        }
    }, {
        title: 'correct',
        config: {
            status: 'correct'
        },
        expected: {
            status: 'correct',
            score: '',
            correct: true,
            skipped: false,
            informational: false,
        }
    }, {
        title: 'incorrect',
        config: {
            status: 'incorrect'
        },
        expected: {
            status: 'incorrect',
            score: '',
            correct: false,
            skipped: false,
            informational: false,
        }
    }, {
        title: 'skipped',
        config: {
            status: 'skipped'
        },
        expected: {
            status: 'skipped',
            score: '',
            correct: false,
            skipped: true,
            informational: false,
        }
    }]).test('init ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-init');

        assert.expect(4);

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual(instance.getScore(), data.expected.score, 'The expected score is set');
                assert.strictEqual(instance.getStatus(), data.expected.status, 'The expected status is set');

                instance.destroy();
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('render', assert => {
        const ready = assert.async();
        const $container = $('#fixture-render');

        assert.expect(10);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                instance.destroy();
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('show/hide', assert => {
        const ready = assert.async();
        const $container = $('#fixture-hide');

        assert.expect(17);
        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                assert.strictEqual($container.find('.item-answer:visible').length, 1, 'The component is visible');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('hide.test', () => {
                                assert.ok(true, 'The hide event is emitted');
                                resolve();
                            })
                            .hide();
                    }))
                    .then(() => {
                        assert.ok(instance.is('hidden'), 'The component is hidden');
                        assert.strictEqual($container.find('.item-answer:visible').length, 0, 'The component is hidden');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('show.test', () => {
                                assert.ok(true, 'The show event is emitted');
                                resolve();
                            })
                            .show();
                    }))
                    .then(() => {
                        assert.ok(!instance.is('hidden'), 'The component is visible');
                        assert.strictEqual($container.find('.item-answer:visible').length, 1, 'The component is visible');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('enable/disable', assert => {
        const ready = assert.async();
        const $container = $('#fixture-disable');

        assert.expect(27);
        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                assert.strictEqual($container.find('.item-answer').is('.disabled'), false, 'The component is enabled');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual($container.find('.action').length, 1, '1 tab is rendered');
                assert.strictEqual($container.find('.action:enabled').length, 1, 'The tab actions are enabled');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable.test', () => {
                                assert.ok(true, 'The disable event is emitted');
                                resolve();
                            })
                            .disable();
                    }))
                    .then(() => {
                        assert.ok(instance.is('disabled'), 'The component is disabled');
                        assert.strictEqual($container.find('.item-answer').is('.disabled'), true, 'The component is disabled');
                        assert.strictEqual($container.find('.action:enabled').length, 0, 'The tab actions are disabled');
                    })
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', () => {
                                    assert.strictEqual(instance.getConfig().status, 'incorrect', 'The status changed to incorrect');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        instance.setStatus('incorrect', true);

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'incorrect', 'The current status is "incorrect"');
                        assert.strictEqual($container.find('.action').length, 2, '2 tabs are rendered');
                        assert.strictEqual($container.find('.action:enabled').length, 0, 'The tab actions are disabled');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('enable.test', () => {
                                assert.ok(true, 'The enable event is emitted');
                                resolve();
                            })
                            .enable();
                    }))
                    .then(() => {
                        assert.ok(!instance.is('disabled'), 'The component is enabled');
                        assert.strictEqual($container.find('.item-answer').is('.disabled'), false, 'The component is enabled');
                        assert.strictEqual($container.find('.action:enabled').length, 2, 'The tab actions are enabled');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('destroy', assert => {
        const ready = assert.async();
        const $container = $('#fixture-destroy');

        assert.expect(4);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                instance.destroy();
            })
            .after('destroy', () => {
                assert.strictEqual($container.children().length, 0, 'The container is now empty');
                ready();
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.module('API');

    QUnit.cases.init([{
        title: 'showScore enabled',
        config: {
            showScore: true,
            scoreText: 'score:'
        },
        score: '5/5',
        expected: {
            scoreText: 'score:',
            score: '5/5',
            scoreLine: 'score: 5/5'
        }
    }, {
        title: 'showScore disabled',
        config: {
            showScore: false,
            scoreText: 'score:'
        },
        score: '5/5',
        expected: {
            scoreText: '',
            score: '',
            scoreLine: ''
        }
    }]).test('score', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-score');

        assert.expect(16);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'Not score set yet');

                assert.strictEqual(instance.setScore(data.score), instance, 'setScore() is fluent');
                assert.strictEqual(instance.getScore(), data.expected.score, `Score is set to "${data.expected.score}"`);

                assert.strictEqual($container.find('.item-answer-score').text().trim(), data.expected.scoreLine, 'The score has been set');

                instance.setScore('');
                assert.strictEqual(instance.getScore(), '', 'Score is set to ""');
                assert.strictEqual($container.find('.item-answer-score').text().trim(), '', 'The score is empty');

                instance.destroy();
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'default',
        config: {},
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false,
            iconCorrect: '.icon-correct',
            iconIncorrect: '.icon-incorrect',
            iconSkipped: '.icon-no-score',
            iconInformational: '.icon-informational',
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false,
            iconCorrect: '.icon-answered',
            iconIncorrect: '.icon-answered',
            iconSkipped: '.icon-skipped',
            iconInformational: '.icon-informational',
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
            hidden: true,
            iconCorrect: '.icon-answered',
            iconIncorrect: '.icon-answered',
            iconSkipped: '.icon-skipped',
            iconInformational: '.icon-informational',
        }
    }]).test('status ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-status');

        assert.expect(69);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');
                assert.strictEqual($container.children().is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.children().is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');

                assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconInformational), true, 'The expected icon is set for the informational status');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'skipped', 'The status changed to skipped');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('skipped', false), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'skipped', 'The item is skipped');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), true, 'The component got the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconSkipped), false, 'The expected icon is set for the skipped status');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconSkipped), true, 'The expected icon is set for the skipped status');
                        }

                        assert.strictEqual($container.find('[data-tab-name="correct"]').length, 0, 'No correct tab should exist');
                    })
                    .then(() => {
                        instance.off('.test');

                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'correct', 'The status changed to correct');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('correct', false), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'correct', 'The item is correct');
                        assert.strictEqual($container.children().is('.correct'), true, 'The component got the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconCorrect), true, 'The expected icon is set for the correct status');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconCorrect), false, 'The expected icon is set for the correct status');
                        }
                    })
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'incorrect', 'The status changed to incorrect');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('incorrect', true), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'incorrect', 'The status changed to incorrect');
                                    assert.strictEqual(change, false, 'The status has not actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('incorrect', true), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'incorrect', 'The item is incorrect');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), true, 'The component got the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconIncorrect), true, 'The expected icon is set for the incorrect status');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.iconIncorrect), false, 'The expected icon is set for the incorrect status');
                        }
                    })
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'informational', 'The status changed to informational');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('info', false), instance, 'setStatus(info) is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'informational', 'The item is informational');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), true, 'The component got the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });


    QUnit.cases.init([{
        title: 'default',
        config: {},
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false,
            icon: '.icon-correct'
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false,
            icon: '.icon-answered'
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
            hidden: true,
            icon: '.icon-answered'
        }
    }]).test('correct ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-correct');

        assert.expect(32);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');
                assert.strictEqual($container.children().is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.children().is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'correct', 'The status changed to correct');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('correct', false), instance, 'setStatus(correct) is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'correct', 'The item is correct');
                        assert.strictEqual($container.children().is('.correct'), true, 'The component got the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), true, 'The expected icon is set');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), false, 'The expected icon is set');
                        }
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'default',
        config: {},
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false,
            icon: '.icon-incorrect',
            tabs: 2,
            tabAnswer: 1,
            tabCorrect: 1
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false,
            icon: '.icon-answered',
            tabs: 1,
            tabAnswer: 1,
            tabCorrect: 0
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
            hidden: true,
            icon: '.icon-answered',
            tabs: 1,
            tabAnswer: 1,
            tabCorrect: 0
        }
    }]).test('incorrect ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-incorrect');

        assert.expect(33);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');
                assert.strictEqual($container.children().is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.children().is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'incorrect', 'The status changed to incorrect');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('incorrect', true), instance, 'setStatus(incorrect) is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'incorrect', 'The item is incorrect');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), true, 'The component got the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, data.expected.tabs, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, data.expected.tabAnswer, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="correct"]').length, data.expected.tabCorrect, 'The tab "correct" is set');
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), true, 'The expected icon is set');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), false, 'The expected icon is set');
                        }
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'default',
        config: {},
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false,
            icon: '.icon-incorrect',
            tabs: 1,
            tabAnswer: 1,
            tabCorrect: 0
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false,
            icon: '.icon-skipped',
            tabs: 1,
            tabAnswer: 1,
            tabCorrect: 0
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
            hidden: true,
            icon: '.icon-skipped',
            tabs: 1,
            tabAnswer: 1,
            tabCorrect: 0
        }
    }]).test('skipped ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-skipped');
        const skippedText = '';

        assert.expect(33);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, Object.assign({skippedText}, data.config))
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');
                assert.strictEqual($container.children().is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.children().is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'skipped', 'The status changed to skipped');
                                    assert.strictEqual(change, true, 'The status has actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('skipped', false), instance, 'setStatus(skipped) is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'skipped', 'The item is skipped');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), true, 'The component got the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), skippedText, 'The status area is not empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, data.expected.tabs, 'Expected tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, data.expected.tabAnswer, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="correct"]').length, data.expected.tabCorrect, 'The tab "correct" is set');
                        if (data.expected.showCorrect) {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), false, 'The expected icon is set');
                        } else {
                            assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), true, 'The expected icon is set');
                        }
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'default',
        config: {},
        expected: {
            showScore: true,
            showCorrect: true,
            hidden: false,
            icon: '.icon-informational'
        }
    }, {
        title: 'correct responses disabled',
        config: {
            showCorrect: false
        },
        expected: {
            showScore: true,
            showCorrect: false,
            hidden: false,
            icon: '.icon-informational'
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
            hidden: true,
            icon: '.icon-informational'
        }
    }]).test('informational ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-informational');

        assert.expect(32);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual($container.children().length, 1, 'The container contains an element');
                assert.strictEqual($container.children().is('.item-answer'), true, 'The container contains the expected element');
                assert.strictEqual($container.children().is('.show-score'), data.expected.showScore, 'The show score option is reflected');
                assert.strictEqual($container.children().is('.show-correct'), data.expected.showCorrect, 'The show correct option is reflected');

                assert.strictEqual($container.find('.item-answer-bar').length, 1, 'The component has rendered the bar');
                assert.strictEqual($container.find('.item-answer-tabs').length, 1, 'The component has rendered the tabs area');
                assert.strictEqual($container.find('.item-answer-tabs .answer-tabs').length, 1, 'The component has rendered the tabs bar');
                assert.strictEqual($container.find('.item-answer-score').length, 1, 'The component has rendered the score area');
                assert.strictEqual($container.find('.item-answer-status').length, 1, 'The component has rendered the status area');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual($container.find('.item-answer-bar').is(':hidden'), data.expected.hidden, 'The bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-tabs').is(':hidden'), data.expected.hidden, 'The tabs bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-score').is(':hidden'), data.expected.hidden, 'The score bar is hidden as expected');
                assert.strictEqual($container.find('.item-answer-status').is(':hidden'), false, 'The status bar is visible');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', (change) => {
                                    assert.strictEqual(instance.getConfig().status, 'informational', 'The status changed to informational');
                                    assert.strictEqual(change, false, 'The status has not actually changed');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('tabchange.test', name => {
                                    assert.strictEqual(name, 'answer', 'The answer tab is active');
                                    resolve();
                                });
                            })
                        ]);

                        assert.strictEqual(instance.setStatus('info', false), instance, 'setStatus(info) is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.getStatus(), 'informational', 'The item is informational');
                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), true, 'The component got the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('[data-tab-name="answer"] .icon').is(data.expected.icon), true, 'The expected icon is set');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', ready)
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test .tool');
        const $item = $('#visual-test .item-content');
        const $status = $('#visual-test .header');
        const $state = $('#visual-test .footer .state');
        const $score = $('#visual-test .footer .score');
        const $correct = $('#visual-test .footer .correct');
        const config = {
            showScore: true,
            showCorrect: true
        };
        const btnCls = 'btn-success';
        let instance = null;
        let componentDisabled = false;
        let currentStatus = 'correct';
        let currentHasCorrectResponse = false;

        const setStatus = (status, hasCorrectResponse) => {
            currentStatus = status;
            currentHasCorrectResponse = hasCorrectResponse;
            switch (status) {
                case 'correct':
                    instance.setScore('5/5');
                    instance.setStatus('correct', currentHasCorrectResponse);
                    break;

                case 'incorrect':
                    instance.setScore('3/5');
                    instance.setStatus('incorrect', currentHasCorrectResponse);
                    break;

                case 'skipped':
                    instance.setScore('0/5');
                    instance.setStatus('skipped', currentHasCorrectResponse);
                    break;

                case 'info':
                    instance.setScore('');
                    instance.setStatus('info', currentHasCorrectResponse);
                    break;
            }
        };

        const monitorClick = ($target, callback) => {
            $target.on('click', '[data-control]', e => {
                const control = e.currentTarget.dataset.control;
                $target.find('[data-control]')
                    .removeClass(btnCls)
                    .filter(`[data-control="${control}"]`)
                    .addClass(btnCls);
                callback(control);
            });
        };
        const activateFirst = $target => $target.find('[data-control]:first-child').click();

        const setup = () => new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => instance && instance.destroy())
                .then(() => {
                    instance = itemAnswerFactory($container, config)
                        .on('ready', () => {
                            if (componentDisabled) {
                                instance.disable();
                            }
                            setStatus(currentStatus, currentHasCorrectResponse);
                            resolve();
                        })
                        .on('statuschange tabchange', () => {
                            $item.html(`<h1>Item status: ${instance.getStatus()} / ${instance.getActiveTab()}</h1>`);
                        })
                        .on('error', reject);
                })
                .catch(reject);
        });

        assert.expect(2);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        setup()
            .then(() => {
                monitorClick($status, setStatus);
                monitorClick($state, status => {
                    if (status === 'disable') {
                        instance.disable();
                    } else {
                        instance.enable();
                    }
                    componentDisabled = instance.is('disabled');
                });
                monitorClick($score, status => {
                    const showScore = status === 'yes';
                    if (showScore !== config.showScore) {
                        config.showScore = showScore;
                        setup();
                    }
                });
                monitorClick($correct, status => {
                    const showCorrect = status === 'yes';
                    if (showCorrect !== config.showCorrect) {
                        config.showCorrect = showCorrect;
                        setup();
                    }
                });

                activateFirst($status);
                activateFirst($state);
                activateFirst($score);
                activateFirst($correct);

                assert.equal($container.children().length, 1, 'The container contains an element');
                ready();
            })
            .catch(err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });
});
