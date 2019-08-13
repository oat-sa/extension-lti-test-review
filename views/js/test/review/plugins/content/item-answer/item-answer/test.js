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
    'taoReview/review/plugins/content/item-answer/item-answer'
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
        {title: 'isCorrect'},
        {title: 'isSkipped'},
        {title: 'isInformational'},
        {title: 'setCorrect'},
        {title: 'setIncorrect'},
        {title: 'setSkipped'},
        {title: 'setInformational'}
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

        assert.expect(7);

        const instance = itemAnswerFactory($container, data.config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The instance is ready to work');

                assert.strictEqual(instance.getScore(), data.expected.score, 'The expected score is set');
                assert.strictEqual(instance.getStatus(), data.expected.status, 'The expected status is set');
                assert.strictEqual(instance.isCorrect(), data.expected.correct, 'The correct status is set as expected');
                assert.strictEqual(instance.isSkipped(), data.expected.skipped, 'The skipped status is set as expected');
                assert.strictEqual(instance.isInformational(), data.expected.informational, 'The informational status is set as expected');

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
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'incorrect', 'The status changed to incorrect');
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

                        instance.setIncorrect();

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

    QUnit.test('score', assert => {
        const ready = assert.async();
        const $container = $('#fixture-score');
        const scoreText = 'score:';
        const score = '5/5';

        assert.expect(16);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, {scoreText})
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

                assert.strictEqual(instance.setScore(score), instance, 'setScore() is fluent');
                assert.strictEqual(instance.getScore(), score, `Score is set to "${score}"`);

                assert.strictEqual($container.find('.item-answer-score').text().trim(), `${scoreText} ${score}`, 'The score has been set');

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

    QUnit.test('status', assert => {
        const ready = assert.async();
        const $container = $('#fixture-status');

        assert.expect(47);

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

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'skipped', 'The status changed to skipped');
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

                        assert.strictEqual(instance.setStatus('skipped'), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), false, 'The item is not correct');
                        assert.strictEqual(instance.isSkipped(), true, 'The item is skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), true, 'The component got the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), instance.getConfig().skippedText, 'The status area is not empty');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('tabchange.test', name => {
                                assert.strictEqual(name, 'correct', 'The correct tab is active');
                                resolve();
                            });
                        $container.find('[data-tab-name="correct"]').click();
                    }))
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'correct', 'The status changed to correct');
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

                        assert.strictEqual(instance.setStatus('correct'), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), true, 'The item is correct');
                        assert.strictEqual(instance.isSkipped(), false, 'The item is not skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), true, 'The component got the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');
                    })
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'incorrect', 'The status changed to incorrect');
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

                        assert.strictEqual(instance.setStatus('incorrect'), instance, 'setStatus() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), false, 'The item is not correct');
                        assert.strictEqual(instance.isSkipped(), false, 'The item is not skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), true, 'The component got the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
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

    QUnit.test('correct', assert => {
        const ready = assert.async();
        const $container = $('#fixture-correct');

        assert.expect(26);

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
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'correct', 'The status changed to correct');
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

                        assert.strictEqual(instance.setCorrect(), instance, 'setCorrect() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), true, 'The item is correct');
                        assert.strictEqual(instance.isSkipped(), false, 'The item is not skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), true, 'The component got the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
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

    QUnit.test('incorrect', assert => {
        const ready = assert.async();
        const $container = $('#fixture-incorrect');

        assert.expect(27);

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
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'incorrect', 'The status changed to incorrect');
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

                        assert.strictEqual(instance.setIncorrect(), instance, 'setIncorrect() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), false, 'The item is not correct');
                        assert.strictEqual(instance.isSkipped(), false, 'The item is not skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), true, 'The component got the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="correct"]').length, 1, 'The tab "correct" is set');
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

    QUnit.test('skipped', assert => {
        const ready = assert.async();
        const $container = $('#fixture-skipped');
        const skippedText = 'skipped item';

        assert.expect(27);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, {skippedText})
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
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'skipped', 'The status changed to skipped');
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

                        assert.strictEqual(instance.setSkipped(), instance, 'setSkipped() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), false, 'The item is not correct');
                        assert.strictEqual(instance.isSkipped(), true, 'The item is skipped');
                        assert.strictEqual(instance.isInformational(), false, 'The item is not informational');

                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), true, 'The component got the state skipped');
                        assert.strictEqual($container.children().is('.informational'), false, 'The component did not get the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), skippedText, 'The status area is not empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 2, 'Two tabs should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="correct"]').length, 1, 'The tab "correct" is set');
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

    QUnit.test('informational', assert => {
        const ready = assert.async();
        const $container = $('#fixture-informational');

        assert.expect(26);

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
                assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                assert.strictEqual(instance.getStatus(), 'informational', 'The current status is "informational"');
                assert.strictEqual(instance.getActiveTab(), 'answer', 'The active tab is "answer"');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');

                        const promise = Promise.all([
                            new Promise(resolve => {
                                instance.on('statuschange.test', status => {
                                    assert.strictEqual(status, 'informational', 'The status changed to informational');
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

                        assert.strictEqual(instance.setInformational(), instance, 'setInformational() is fluent');

                        return promise;
                    })
                    .then(() => {
                        assert.strictEqual(instance.isCorrect(), false, 'The item is not correct');
                        assert.strictEqual(instance.isSkipped(), false, 'The item is not skipped');
                        assert.strictEqual(instance.isInformational(), true, 'The item is informational');

                        assert.strictEqual($container.children().is('.correct'), false, 'The component did not get the state correct');
                        assert.strictEqual($container.children().is('.incorrect'), false, 'The component did not get the state incorrect');
                        assert.strictEqual($container.children().is('.skipped'), false, 'The component did not get the state skipped');
                        assert.strictEqual($container.children().is('.informational'), true, 'The component got the state informational');
                        assert.strictEqual($container.find('.item-answer-status').text().trim(), '', 'The status area is empty');

                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab').length, 1, 'Only one tab should be present');
                        assert.strictEqual($container.find('.item-answer-tabs .answer-tabs .tab[data-tab-name="answer"]').length, 1, 'The tab "answer" is set');
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
        const $header = $('#visual-test .header');
        const $footer = $('#visual-test .footer');
        const config = {};
        const btnCls = 'btn-success';

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

        assert.expect(3);

        assert.strictEqual($container.children().length, 0, 'The container is empty');

        const instance = itemAnswerFactory($container, config)
            .on('init', function () {
                assert.strictEqual(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.strictEqual($container.children().length, 1, 'The container contains an element');

                monitorClick($header, status => {
                    switch (status) {
                        case 'correct':
                            instance.setScore('5/5');
                            instance.setCorrect();
                            break;

                        case 'incorrect':
                            instance.setScore('3/5');
                            instance.setIncorrect();
                            break;

                        case 'skipped':
                            instance.setScore('0/5');
                            instance.setSkipped();
                            break;

                        case 'informational':
                            instance.setInformational();
                            break;
                    }
                });
                monitorClick($footer, status => {
                    if (status === 'disable') {
                        instance.disable();
                    } else {
                        instance.enable();
                    }
                });

                activateFirst($header);
                activateFirst($footer);

                ready();
            })
            .on('statuschange tabchange', () => {
                $item.html(`<h1>Item status: ${instance.getStatus()} / ${instance.getActiveTab()}</h1>`);
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });
});
