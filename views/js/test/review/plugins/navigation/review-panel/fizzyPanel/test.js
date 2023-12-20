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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ltiTestReview/review/plugins/navigation/review-panel/fizzyPanel',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/fixtures/map-correct.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/fixtures/map-incorrect.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/fixtures/review-data-correct.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/fixtures/review-data-incorrect.json'
], function (
    $,
    _,
    __,
    reviewPanelFactory,
    testMapCorrect,
    testMapIncorrect,
    reviewDataCorrect,
    reviewDataIncorrect
) {
    'use strict';

    QUnit.dump.maxDepth = 20;

    const reviewLayout = 'fizzy';
    const defaultHeaderTitle = 'Test review';
    const defaultHeader = {
        label: __('Total score:'),
        score: '0%'
    };
    const defaultFooter = {
        label: __('Total'),
        score: '0'
    };
    const defaultShowScore = false;
    const defaultShowCorrect = false;

    function getInstance(fixture, config = {}) {
        return reviewPanelFactory(fixture, config)
            .on('ready', function () {
                this.destroy();
            });
    }

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        const fixture = '#fixture-api';
        assert.expect(3);
        assert.equal(typeof reviewPanelFactory, 'function', 'The module exposes a function');
        assert.equal(typeof getInstance(fixture), 'object', 'The factory produces an object');
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
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.cases.init([
        {title: 'getData'},
        {title: 'setData'},
        {title: 'getActiveItem'},
        {title: 'setActiveItem'},
        {title: 'update'}
    ]).test('component API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('Life cycle');

    QUnit.cases.init([{
        title: 'default',
        config: {
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            headerLabel: false,
            footerLabel: false,
            showScore: defaultShowScore,
            showCorrect: defaultShowCorrect
        }
    }, {
        title: 'enabled showScore + header + footer',
        config: {
            showScore: true,
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            headerLabel: defaultHeader.label,
            footerLabel: defaultFooter.label,
            header: defaultHeader,
            footer: defaultFooter,
            showScore: true,
            showCorrect: defaultShowCorrect
        }
    }, {
        title: 'enabled showCorrect + displayItemTooltip',
        config: {
            showCorrect: true,
            displayItemTooltip: true,
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            headerLabel: false,
            footerLabel: false,
            showScore: defaultShowScore,
            showCorrect: true,
            displayItemTooltip: true
        }
    }, {
        title: 'disabled displaySectionTitles + displayItemTooltip',
        config: {
            displaySectionTitles: false,
            displayItemTooltip: false,
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            headerLabel: false,
            footerLabel: false,
            showScore: defaultShowScore,
            showCorrect: defaultShowCorrect,
            displaySectionTitles: false,
            displayItemTooltip: false
        }
    }, {
        title: 'disabled only header',
        config: {
            showScore: true,
            headerLabel: false,
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            headerLabel: false,
            footerLabel: defaultFooter.label,
            footer: defaultFooter,
            showScore: true,
            showCorrect: defaultShowCorrect
        }
    }, {
        title: 'disabled only footer',
        config: {
            showScore: true,
            footerLabel: false,
            reviewLayout
        },
        expected: {
            reviewLayout,
            headerTitle: defaultHeaderTitle,
            footerLabel: false,
            headerLabel: defaultHeader.label,
            header: defaultHeader,
            showScore: true,
            showCorrect: defaultShowCorrect
        }
    }]).test('init ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-init');
        const instance = reviewPanelFactory($container, data.config);

        assert.expect(2);

        instance
            .after('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
                assert.deepEqual(this.getConfig(), data.expected, 'The expected config has been built');
            })
            .on('ready', () => instance.destroy())
            .on('destroy', () => ready())
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('render default', assert => {
        const ready = assert.async();
        const $container = $('#fixture-render');

        assert.expect(7);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 0, 'The content area is empty');

                assert.equal($container.find('.review-panel-title').text().trim(), defaultHeaderTitle, 'The header title is rendered');

                instance.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'scores enabled',
        config: {
            showScore: true,
            showCorrect: true,
            displaySectionTitles: true,
            displayItemTooltip: true,
            headerLabel: 'HEADER',
            footerLabel: 'FOOTER'
        },
        testMap: testMapIncorrect,
        expected: {
            header: 1,
            headerLabel: 'HEADER',
            headerScore: '80%',
            footer: 1,
            footerLabel: 'FOOTER',
            footerScore: '12/15',
            countSections: 3,
            countItems: 9,
            firstItemTooltip: 'Example_0_Introduction',
            items: [
                {status: 'viewed'},
                {status: 'correct'},
                {status: 'score-partial'},
                {status: 'correct'},
                {status: 'incorrect'},
                {status: 'correct'},
                {status: 'correct'},
                {status: 'correct'},
                {status: 'answered'}
            ]
        }
    }, {
        title: 'scores disabled',
        config: {
            displaySectionTitles: true,
            displayItemTooltip: false,
        },
        testMap: testMapIncorrect,
        expected: {
            header: 0,
            headerLabel: '',
            headerScore: '',
            footer: 0,
            footerLabel: '',
            footerScore: '',
            countSections: 3,
            countItems: 9,
            firstItemTooltip: void 0,
            items: [
                {status: 'viewed'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'answered'},
                {status: 'viewed'}
            ]
        }
    }]).test('render with data ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-render-data');

        assert.expect(28);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, data.config, data.testMap)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.children().is('.show-score'), instance.getConfig().showScore, 'The show score option is reflected');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-score-header').length, data.expected.header ? 1 : 0, 'The header is rendered');
                assert.equal($container.find('.review-panel-score-header .review-panel-label').text().trim(), data.expected.headerLabel, 'The header label is rendered');
                assert.equal($container.find('.review-panel-score-header .review-panel-score').text().trim(), data.expected.headerScore, 'The header score is rendered');

                assert.equal($container.find('.review-panel-footer').length, data.expected.footer ? 1 : 0, 'The footer is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-label').text().trim(), data.expected.footerLabel, 'The header label is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), data.expected.footerScore, 'The header score is rendered');

                assert.equal($container.find('.review-panel-section').length, data.expected.countSections, 'The test sections are rendered');
                assert.equal($container.find('.buttonlist-item').length, data.expected.countItems, 'The test items are rendered');

                instance.getData().sections.forEach((section, i) => {
                    assert.equal(
                        $container.find('.review-panel-section .review-panel-text').eq(i).text().trim(),
                        section.label,
                        `The test section "${section.label}" exists`
                    );
                });

                data.expected.items.forEach((item, index) => {
                    assert.ok(
                        $container.find(`.buttonlist-item:nth(${index})`).hasClass(item.status),
                        `The item #${index} got the expected class: ${item.status}`
                    );
                });

                assert.equal(
                    $container.find('.buttonlist-btn').first().attr('title'),
                    data.expected.firstItemTooltip,
                    `The item tooltip depends on displayItemTooltip=${data.config.displayItemTooltip}`);

                instance.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
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

        assert.expect(8);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapCorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                instance.destroy();
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The container is now empty');
                assert.ok(!instance.is('ready'), 'The component is not ready anymore');
                ready();
            })
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.module('API');

    QUnit.test('data with correct responses', assert => {
        const ready = assert.async();
        const $container = $('#fixture-data-correct');
        const initialData = {
            scope: 'test',
            parts: {
                part: {
                    id: 'part',
                    label: 'part',
                    position: 0,
                    sections: {
                        section: {
                            id: 'section',
                            label: 'section',
                            position: 0,
                            items: [{
                                id: 'item',
                                label: 'item',
                                informational: false,
                                skipped: true,
                                position: 0,
                                score: 0,
                                maxScore: 1
                            }],
                            score: 0,
                            maxScore: 1
                        }
                    },
                    score: 0,
                    maxScore: 1
                }
            },
            jumps: [{
                identifier: 'item',
                section: 'section',
                part: 'part',
                position: 0
            }],
            score: 0,
            maxScore: 1
        };
        const initialDataAll = {
            sections: [{
                id: 'section',
                label: 'section',
                position: 0,
                items: [{
                    id: 'item',
                    label: 'item',
                    informational: false,
                    skipped: true,
                    withScore: true,
                    maxScore: 1,
                    score: 0,
                    status: "answered",
                    position: 0,
                    "accordionScoreLabel": "0/1",
                    ariaLabel: "Question 1",
                    icon: null,
                    numericLabel: "1",
                    scoreType: "incorrect",
                    type: "incorrect"
                }],
                withScore: true,
                maxScore: 1,
                score: 0
            }],
            withScore: true,
            maxScore: 1,
            score: 0
        };

        assert.expect(43);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, { showScore: true, showCorrect: true, displaySectionTitles: true }, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().sections, initialDataAll.sections, 'The initial data is set: sections');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, initialDataAll.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, initialDataAll.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-section .buttonlist-item').length, 1, 'A test item is rendered');

                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '0%', 'The header score is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '0/1', 'The footerr score is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('datachange.test', data => {
                                    assert.ok(true, 'The datachange event is emitted');
                                    assert.deepEqual(data.parts, reviewDataCorrect.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataCorrect.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataCorrect.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', data => {
                                    assert.ok(true, 'The update event is emitted');
                                    assert.deepEqual(data.parts, reviewDataCorrect.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataCorrect.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataCorrect.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                        ];
                        assert.equal(instance.setData(testMapCorrect), instance, 'setData is fluent');
                        assert.deepEqual(instance.getData().parts, reviewDataCorrect.parts, 'The updated data is set');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section .buttonlist-item').length, 9, 'The test items are rendered');

                        instance.getData().sections.forEach((section, i) => {
                            assert.equal(
                                $container.find('.review-panel-section .review-panel-text').eq(i).text().trim(),
                                section.label,
                                `The test section "${section.label}" exists`
                            );
                        });

                        const itemsEntries = Array.from(instance.getData().items.values());
                        itemsEntries.forEach((item, index) => {
                            assert.ok(
                                $container.find(`.buttonlist-item:nth(${index})`).hasClass(item.status),
                                `The item #${index} got the expected class: ${item.status}`
                            );
                        });

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '17/17', 'The footer score is rendered');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The container is now empty');
                assert.ok(!instance.is('ready'), 'The component is not ready anymore');
                ready();
            })
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('data with incorrect responses', assert => {
        const ready = assert.async();
        const $container = $('#fixture-data-incorrect');
        const initialData = {
            scope: 'test',
            parts: {
                part: {
                    id: 'part',
                    label: 'part',
                    position: 0,
                    sections: {
                        section: {
                            id: 'section',
                            label: 'section',
                            position: 0,
                            items: [{
                                id: 'item',
                                label: 'item',
                                informational: false,
                                skipped: false,
                                position: 0,
                                score: 1,
                                maxScore: 1
                            }],
                            score: 1,
                            maxScore: 1
                        }
                    },
                    score: 1,
                    maxScore: 1
                }
            },
            jumps: [{
                identifier: 'item',
                section: 'section',
                part: 'part',
                position: 0
            }],
            score: 1,
            maxScore: 1
        };
        const initialDataAll = {
            sections: [{
                id: 'section',
                label: 'section',
                position: 0,
                items: [{
                    id: 'item',
                    label: 'item',
                    informational: false,
                    skipped: false,
                    withScore: true,
                    maxScore: 1,
                    score: 1,
                    status: "answered",
                    position: 0,
                    "accordionScoreLabel": "1/1",
                    ariaLabel: "Question 1",
                    icon: null,
                    numericLabel: "1",
                    scoreType: "correct",
                    type: "correct"
                }],
                withScore: true,
                score: 1,
                maxScore: 1
            }],
            withScore: true,
            score: 1,
            maxScore: 1
        };

        assert.expect(48);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, { showScore: true, showCorrect: true, displaySectionTitles: true }, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().sections, initialDataAll.sections, 'The initial data is set: sections');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, initialDataAll.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, initialDataAll.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-section .buttonlist-item').length, 1, 'A test item is rendered');

                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is  rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '1/1', 'The footer score is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('datachange.test', data => {
                                    assert.ok(true, 'The datachange event is emitted');
                                    assert.deepEqual(data.parts, reviewDataIncorrect.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataIncorrect.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataIncorrect.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', data => {
                                    assert.ok(true, 'The update event is emitted');
                                    assert.deepEqual(data.parts, reviewDataIncorrect.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataIncorrect.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataIncorrect.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                        ];
                        assert.equal(instance.setData(testMapIncorrect), instance, 'setData is fluent');
                        assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The updated data is set');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section .buttonlist-item').length, 9, 'The test items are rendered');

                        instance.getData().sections.forEach((section, i) => {
                            assert.equal(
                                $container.find('.review-panel-section .review-panel-text').eq(i).text().trim(),
                                section.label,
                                `The test section "${section.label}" exists`
                            );
                        });

                        const itemsEntries = Array.from(instance.getData().items.values());
                        itemsEntries.forEach((item, index) => {
                            assert.ok(
                                $container.find(`.buttonlist-item:nth(${index})`).hasClass(item.status),
                                `The item #${index} got the expected class: ${item.status}`
                            );
                        });

                        assert.equal($container.find('.buttonlist-score-icon:nth(0)').is('.icon-correct'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.buttonlist-score-icon:nth(1)').is('.icon-score-partial'), true, 'The 2nd item got the expected icon');
                        assert.equal($container.find('.buttonlist-score-icon:nth(2)').is('.icon-correct'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.buttonlist-score-icon:nth(3)').is('.icon-incorrect'), true, 'The 4th item got the expected icon');
                        assert.equal($container.find('.buttonlist-score-icon.icon-correct').length, 5, 'The other items got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '80%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '12/15', 'The header score is rendered');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The container is now empty');
                assert.ok(!instance.is('ready'), 'The component is not ready anymore');
                ready();
            })
            .on('error', err => {
                assert.ok(false, 'The operation should not fail!');
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
        const $container = $('#visual-test .panel');
        const $item = $('#visual-test .item');
        const config = {
            showScore: true,
            showCorrect: true,
            displaySectionTitles: true,
            displayItemTooltip: true
        };
        const data = {
            correct: testMapCorrect,
            incorrect: testMapIncorrect
        };
        let instance = null;
        let componentDisabled = false;
        let currentData = data.correct;
        const showItem = id => {
            const item = instance.getData().items.get(id);
            if (item) {
                $item.html(`<pre>${JSON.stringify(item, null, 4)}</pre>`);
            }
        };
        const manageButtons = (selector, selected, callback) => {
            const $selector = $(selector);
            $selector
                .on('click', 'button', e => {
                    $selector.find('button').removeClass('btn-success');
                    e.currentTarget.classList.add('btn-success');
                    const control = e.currentTarget.dataset.control;
                    callback(control);
                })
                .find(`[data-control="${selected}"]`).click();
        };
        const setup = () => new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => instance && instance.destroy())
                .then(() => {
                    instance = reviewPanelFactory($container, config, currentData)
                        .on('ready', () => {
                            instance.setActiveItem(currentData.jumps.find(item => item.identifier).identifier);
                            if (componentDisabled) {
                                instance.disable();
                            }
                            resolve();
                        })
                        .after('update', () => showItem(instance.getActiveItem()))
                        .on('itemchange', showItem)
                        .on('error', reject);
                })
                .catch(reject);
        });
        assert.expect(2);

        assert.equal($container.children().length, 0, 'The container is empty');

        setup()
            .then(() => {
                manageButtons('#visual-test .header .state', 'correct', control => {
                    instance.setData(data[control]);
                });
                manageButtons('#visual-test .header .score', 'yes', control => {
                    const showScore = control === 'yes';
                    if (showScore !== config.showScore) {
                        config.showScore = showScore;
                        setup();
                    }
                });
                manageButtons('#visual-test .footer', 'enable', control => {
                    if (control === 'disable') {
                        instance.disable();
                    } else {
                        instance.enable();
                    }
                    componentDisabled = instance.is('disabled');
                });

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
