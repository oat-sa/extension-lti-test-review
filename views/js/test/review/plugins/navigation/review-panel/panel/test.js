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
    'taoReview/review/plugins/navigation/review-panel/panel',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/map-correct.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/map-incorrect.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/map-incorrect-filtered.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-correct.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-incorrect.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-incorrect-filtered.json'
], function (
    $,
    _,
    __,
    reviewPanelFactory,
    testMapCorrect,
    testMapIncorrect,
    testMapIncorrectFiltered,
    reviewDataCorrect,
    reviewDataIncorrect,
    reviewDataIncorrectFiltered
) {
    'use strict';

    QUnit.dump.maxDepth = 20;

    const defaultHeader = {
        label: __('TEST SCORE:'),
        score: '0%'
    };
    const defaultFooter = {
        label: __('TOTAL'),
        score: '0'
    };
    const defaultShowScore = true;
    const defaultFilters = [{
        id: 'all',
        label: __('All'),
        title: __('Show all items')
    }, {
        id: 'incorrect',
        label: __('Incorrect'),
        title: __('Show incorrect items only')
    }];

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
        {title: 'getActiveFilter'},
        {title: 'setActiveFilter'},
        {title: 'getActiveItem'},
        {title: 'getActiveItemPosition'},
        {title: 'setActiveItem'},
        {title: 'expand'},
        {title: 'collapse'},
        {title: 'toggle'},
        {title: 'update'}
    ]).test('component API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('Life cycle');

    QUnit.cases.init([{
        title: 'default',
        expected: {
            headerLabel: defaultHeader.label,
            footerLabel: defaultFooter.label,
            header: defaultHeader,
            footer: defaultFooter,
            showScore: defaultShowScore,
            filters: defaultFilters
        }
    }, {
        title: 'disabled score',
        config: {
            showScore: false
        },
        expected: {
            headerLabel: false,
            footerLabel: false,
            showScore: false,
            filters: false
        }
    }, {
        title: 'disabled header',
        config: {
            headerLabel: false,
        },
        expected: {
            headerLabel: false,
            footerLabel: defaultFooter.label,
            footer: defaultFooter,
            showScore: defaultShowScore,
            filters: defaultFilters
        }
    }, {
        title: 'disabled footer',
        config: {
            footerLabel: false,
        },
        expected: {
            footerLabel: false,
            headerLabel: defaultHeader.label,
            header: defaultHeader,
            showScore: defaultShowScore,
            filters: defaultFilters
        }
    }, {
        title: 'disabled filters',
        config: {
            filters: false
        },
        expected: {
            headerLabel: defaultHeader.label,
            footerLabel: defaultFooter.label,
            header: defaultHeader,
            footer: defaultFooter,
            showScore: defaultShowScore,
            filters: false
        }
    }, {
        title: 'defined filters',
        config: {
            filters: [{
                id: 'test',
                label: 'test',
                title: 'test'
            }]
        },
        expected: {
            headerLabel: defaultHeader.label,
            footerLabel: defaultFooter.label,
            header: defaultHeader,
            footer: defaultFooter,
            showScore: defaultShowScore,
            filters: [{
                id: 'test',
                label: 'test',
                title: 'test'
            }]
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

        assert.expect(16);
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

                assert.equal($container.find('.review-panel-header .review-panel-label').text().trim(), defaultHeader.label, 'The header label is rendered');
                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), defaultHeader.score, 'The header score is rendered');

                assert.equal($container.find('.review-panel-footer .review-panel-label').text().trim(), defaultFooter.label, 'The header label is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), defaultFooter.score, 'The header score is rendered');

                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');
                assert.equal($container.find('.review-panel-filter:nth(0)').text().trim(), defaultFilters[0].label, 'The first filter is rendered');
                assert.equal($container.find('.review-panel-filter:nth(1)').text().trim(), defaultFilters[1].label, 'The second filter is rendered');

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
            countParts: 2,
            countSections: 3,
            countItems: 9,
            items: [
                {type: 'info', score: '-'},
                {type: 'correct', score: '2/2'},
                {type: 'incorrect', score: '2/3'},
                {type: 'correct', score: '2/2'},
                {type: 'incorrect', score: '0/2'},
                {type: 'correct', score: '2/2'},
                {type: 'correct', score: '2/2'},
                {type: 'correct', score: '2/2'},
                {type: 'skipped', score: '0'}
            ],
            filters: [{
                label: defaultFilters[0].label,
                active: true
            }, {
                label: defaultFilters[1].label,
                active: false
            }]
        }
    }, {
        title: 'scores disabled',
        config: {
            showScore: false
        },
        testMap: testMapIncorrect,
        expected: {
            header: 0,
            headerLabel: '',
            headerScore: '',
            footer: 0,
            footerLabel: '',
            footerScore: '',
            countParts: 2,
            countSections: 3,
            countItems: 9,
            items: [
                {type: 'info', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'default', score: ''},
                {type: 'skipped', score: ''}
            ],
            filters: []
        }
    }]).test('render with data ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-render-data');

        assert.expect(17 +
            data.expected.countParts +
            data.expected.countSections +
            data.expected.countItems +
            data.expected.items.length * 2 +
            data.expected.filters.length * 2
        );
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, data.config, data.testMap)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-content').children().length, 1, 'The content area is not empty');

                assert.equal($container.find('.review-panel-header').length, data.expected.header ? 1 : 0, 'The header is rendered');
                assert.equal($container.find('.review-panel-header .review-panel-label').text().trim(), data.expected.headerLabel, 'The header label is rendered');
                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), data.expected.headerScore, 'The header score is rendered');

                assert.equal($container.find('.review-panel-footer').length, data.expected.footer ? 1 : 0, 'The footer is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-label').text().trim(), data.expected.footerLabel, 'The header label is rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), data.expected.footerScore, 'The header score is rendered');

                assert.equal($container.find('.review-panel-part').length, data.expected.countParts, 'The test parts are rendered');
                assert.equal($container.find('.review-panel-section').length, data.expected.countSections, 'The test sections are rendered');
                assert.equal($container.find('.review-panel-item').length, data.expected.countItems, 'The test items are rendered');

                _.forEach(testMapIncorrect.parts, part => {
                    assert.equal(
                        $container.find(`[data-control="${part.id}"] > .review-panel-label`).text().trim(),
                        part.label,
                        `The test part "${part.id}" got the expected label`
                    );

                    _.forEach(part.sections, section => {
                        assert.equal(
                            $container.find(`[data-control="${section.id}"] > .review-panel-label`).text().trim(),
                            section.label,
                            `The test section "${section.id}" got the expected label`
                        );

                        _.forEach(section.items, item => {
                            assert.equal(
                                $container.find(`[data-control="${item.id}"] > .review-panel-label`).text().trim(),
                                item.label,
                                `The test item "${item.id}" got the expected label`
                            );
                        });
                    });
                });

                data.expected.items.forEach((item, index) => {
                    assert.equal($container.find(`.review-panel-item:nth(${index})`).is(`.item-${item.type}`), true, `The item #${index} got the expected icon: ${item.type}`);
                    assert.equal($container.find(`.review-panel-item:nth(${index}) .review-panel-score`).text().trim(), item.score, `The item #${index} got the expected score: ${item.score}`);
                });

                assert.equal($container.find('.review-panel-filter').length, data.expected.filters.length, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter.active').length, data.expected.filters.length ? 1 : 0, 'A filter is active');
                data.expected.filters.forEach((filter, index) => {
                    assert.equal($container.find(`.review-panel-filter:nth(${index})`).is('.active'), filter.active, `The filter #${index} got the expected state`);
                    assert.equal($container.find(`.review-panel-filter:nth(${index})`).text().trim(), filter.label, `The filter #${index} got the expected label`);
                });

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

        assert.expect(10);

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
                assert.equal($container.find('.review-panel-header').length, 1, 'The header area is rendered');
                assert.equal($container.find('.review-panel-footer').length, 1, 'The footer area is rendered');

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

    QUnit.test('filter', assert => {
        const ready = assert.async();
        const $container = $('#fixture-filter');

        assert.expect(22);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {filters: defaultFilters})
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
                assert.equal(instance.getActiveFilter(), 'all', 'The "All" filter is activated by default');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.equal(instance.getActiveFilter(), 'all', 'The "All" filter is activated by default');

                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', filterId => {
                                assert.equal(filterId, 'incorrect', 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        assert.equal(instance.setActiveFilter('incorrect'), instance, 'setActiveFilter is fluent');
                        assert.equal(instance.getActiveFilter(), 'incorrect', 'The "Incorrect" filter is now activated');

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', () => {
                                assert.ok(false, 'The filterchange event should not be triggered');
                            });
                        instance.setActiveFilter('incorrect');
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', filterId => {
                                assert.equal(filterId, 'all', 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        $container.find('.review-panel-filter:nth(0)').click();

                        assert.equal(instance.getActiveFilter(), 'all', 'The "All" filter is now activated');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is now active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active anymore');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', () => {
                                assert.ok(false, 'The filterchange event should not be triggered');
                            });
                        $container.find('.review-panel-filter:nth(0)').click();
                        window.setTimeout(resolve, 300);
                    }))
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
        assert.equal(instance.getActiveFilter(), null, 'No filter is activated yet');
    });

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
            parts: [{
                id: 'part',
                label: 'part',
                position: 0,
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
                        type: 'incorrect',
                        position: 0,
                        score: 0,
                        maxScore: 1
                    }],
                    withScore: true,
                    score: 0,
                    maxScore: 1
                }],
                withScore: true,
                score: 0,
                maxScore: 1
            }],
            withScore: true,
            score: 0,
            maxScore: 1
        };

        assert.expect(67);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, initialDataAll.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, initialDataAll.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, initialDataAll.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-part').length, 1, 'A test part is rendered');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-item').length, 1, 'A test item is rendered');

                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');

                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '0%', 'The header score is  rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '0/1', 'The header score is rendered');

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
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');

                        _.forEach(testMapCorrect.parts, part => {
                            assert.equal(
                                $container.find(`[data-control="${part.id}"] > .review-panel-label`).text().trim(),
                                part.label,
                                `The test part "${part.id}" got the expected label`
                            );

                            _.forEach(part.sections, section => {
                                assert.equal(
                                    $container.find(`[data-control="${section.id}"] > .review-panel-label`).text().trim(),
                                    section.label,
                                    `The test section "${section.id}" got the expected label`
                                );

                                _.forEach(section.items, item => {
                                    assert.equal(
                                        $container.find(`[data-control="${item.id}"] > .review-panel-label`).text().trim(),
                                        item.label,
                                        `The test item "${item.id}" got the expected label`
                                    );
                                });
                            });
                        });

                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-info'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.review-panel-item.item-correct').length, 8, 'The other items got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '17/17', 'The header score is rendered');

                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 0, 'The filters are not displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', filterId => {
                                assert.equal(filterId, 'incorrect', 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        instance.setActiveFilter('incorrect');

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 0, 'The filters are not displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is active');
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
            parts: [{
                id: 'part',
                label: 'part',
                position: 0,
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
                        type: 'correct',
                        position: 0,
                        score: 1,
                        maxScore: 1
                    }],
                    withScore: true,
                    score: 1,
                    maxScore: 1
                }],
                withScore: true,
                score: 1,
                maxScore: 1
            }],
            withScore: true,
            score: 1,
            maxScore: 1
        };

        assert.expect(70);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, initialDataAll.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, initialDataAll.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, initialDataAll.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-part').length, 1, 'A test part is rendered');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-item').length, 1, 'A test item is rendered');

                assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                assert.equal($container.find('.review-panel-filter:visible').length, 0, 'The filters are not displayed');
                assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');

                assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is  rendered');
                assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '1/1', 'The header score is rendered');

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
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');

                        _.forEach(testMapIncorrect.parts, part => {
                            assert.equal(
                                $container.find(`[data-control="${part.id}"] > .review-panel-label`).text().trim(),
                                part.label,
                                `The test part "${part.id}" got the expected label`
                            );

                            _.forEach(part.sections, section => {
                                assert.equal(
                                    $container.find(`[data-control="${section.id}"] > .review-panel-label`).text().trim(),
                                    section.label,
                                    `The test section "${section.id}" got the expected label`
                                );

                                _.forEach(section.items, item => {
                                    assert.equal(
                                        $container.find(`[data-control="${item.id}"] > .review-panel-label`).text().trim(),
                                        item.label,
                                        `The test item "${item.id}" got the expected label`
                                    );
                                });
                            });
                        });

                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-info'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(2)').is('.item-incorrect'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(4)').is('.item-incorrect'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(8)').is('.item-skipped'), true, 'The last item got the expected icon');
                        assert.equal($container.find('.review-panel-item.item-correct').length, 5, 'The other items got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '80%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '12/15', 'The header score is rendered');

                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', filterId => {
                                assert.equal(filterId, 'incorrect', 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        instance.setActiveFilter('incorrect');

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is active');
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

    QUnit.test('expand/collapse', assert => {
        const ready = assert.async();
        const $container = $('#fixture-expand');

        assert.expect(87);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', id => {
                                assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                shouldExpand.delete(id);
                                if (!shouldExpand.size) {
                                    resolve();
                                }
                            })
                            .expand('QTIExamples');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="QTIExamples"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-2"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 2, '2 test sections are now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 4, '4 test items are now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');

                        const shouldCollapse = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        const shouldExpand = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('collapse.test', id => {
                                    assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                    shouldCollapse.delete(id);
                                    if (!shouldCollapse.size) {
                                        resolve();
                                    }
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('expand.test', id => {
                                    assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                    shouldExpand.delete(id);
                                    if (!shouldExpand.size) {
                                        resolve();
                                    }
                                });
                            })
                        ];

                        instance.expand('Introduction');

                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="Introduction"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 1, '1 test sections is now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 1, 'A test item is now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .collapse('QTIExamples');

                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="Introduction"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 1, '1 test sections is now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 1, 'A test item is now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldCollapse = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance
                            .off('.test')
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('collapse.test', id => {
                                assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                shouldCollapse.delete(id);
                                if (!shouldCollapse.size) {
                                    resolve();
                                }
                            })
                            .collapse('Introduction');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-3', true]]);
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', id => {
                                assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                shouldExpand.delete(id);
                                if (!shouldExpand.size) {
                                    resolve();
                                }
                            })
                            .expand('item-7');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="QTIExamples"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-3"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 2, '2 test sections are now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 4, '4 test items are now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
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

    QUnit.test('toggle', assert => {
        const ready = assert.async();
        const $container = $('#fixture-toggle');

        assert.expect(76);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', id => {
                                assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                shouldExpand.delete(id);
                                if (!shouldExpand.size) {
                                    resolve();
                                }
                            })
                            .toggle('QTIExamples');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="QTIExamples"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-2"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 2, '2 test sections are now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 4, '4 test items are now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');

                        const shouldCollapse = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        const shouldExpand = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('collapse.test', id => {
                                    assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                    shouldCollapse.delete(id);
                                    if (!shouldCollapse.size) {
                                        resolve();
                                    }
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('expand.test', id => {
                                    assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                    shouldExpand.delete(id);
                                    if (!shouldExpand.size) {
                                        resolve();
                                    }
                                });
                            })
                        ];

                        instance.toggle('Introduction');

                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="Introduction"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 1, '1 test sections is now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 1, 'A test item is now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldCollapse = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance
                            .off('.test')
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('collapse.test', id => {
                                assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                shouldCollapse.delete(id);
                                if (!shouldCollapse.size) {
                                    resolve();
                                }
                            })
                            .toggle('Introduction');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-3', true]]);
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', id => {
                                assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                shouldExpand.delete(id);
                                if (!shouldExpand.size) {
                                    resolve();
                                }
                            })
                            .toggle('item-7');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="QTIExamples"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-3"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 2, '2 test sections are now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 4, '4 test items are now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
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

    QUnit.test('click toggle', assert => {
        const ready = assert.async();
        const $container = $('#fixture-panel-click');

        assert.expect(63);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', id => {
                                assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                shouldExpand.delete(id);
                                if (!shouldExpand.size) {
                                    resolve();
                                }
                            });
                        $container.find('[data-control="QTIExamples"] > .review-panel-label').click();
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="QTIExamples"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-2"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 2, '2 test sections are now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 4, '4 test items are now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');

                        const shouldCollapse = new Map([['QTIExamples', true], ['assessmentSection-2', true]]);
                        const shouldExpand = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('collapse.test', id => {
                                    assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                    shouldCollapse.delete(id);
                                    if (!shouldCollapse.size) {
                                        resolve();
                                    }
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('expand.test', id => {
                                    assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                                    shouldExpand.delete(id);
                                    if (!shouldExpand.size) {
                                        resolve();
                                    }
                                });
                            })
                        ];

                        $container.find('[data-control="Introduction"] > .review-panel-label').click();

                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'Still 2 test parts');
                        assert.equal($container.find('.review-panel-part.expanded').length, 1, 'A test part is now expanded');
                        assert.equal($container.find('.review-panel-part.expanded').is('[data-control="Introduction"]'), true, 'The expected test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'Still 3 test sections');
                        assert.equal($container.find('.review-panel-section.expanded').length, 1, 'A test section is now expanded');
                        assert.equal($container.find('.review-panel-section.expanded').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is expanded');
                        assert.equal($container.find('.review-panel-section:visible').length, 1, '1 test sections is now visible');
                        assert.equal($container.find('.review-panel-item:visible').length, 1, 'A test item is now visible');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is still visible');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is still visible');
                    })
                    .then(() => new Promise(resolve => {
                        const shouldCollapse = new Map([['Introduction', true], ['assessmentSection-1', true]]);
                        instance
                            .off('.test')
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('collapse.test', id => {
                                assert.ok(shouldCollapse.has(id), `The collapse event is triggered for ${id}`);
                                shouldCollapse.delete(id);
                                if (!shouldCollapse.size) {
                                    resolve();
                                }
                            });

                        $container.find('[data-control="Introduction"] > .review-panel-label').click();
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');
                        assert.equal($container.find('.review-panel-section:visible').length, 0, 'No test section is visible yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:visible').length, 0, 'No test item is visible yet');

                        assert.equal($container.find('.review-panel-header .review-panel-score:visible').length, 1, 'The header score is rendered and visible');
                        assert.equal($container.find('.review-panel-footer .review-panel-score:visible').length, 1, 'The header score is rendered and visible');

                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The expected number of filters is renderer and visible');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
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

    QUnit.test('active item', assert => {
        const ready = assert.async();
        const $container = $('#fixture-item');

        assert.expect(52);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
                const shouldExpand = new Map([['QTIExamples', true], ['assessmentSection-3', true]]);
                instance
                    .off('.test')
                    .on('expand.test', id => {
                        assert.ok(shouldExpand.has(id), `The expand event is triggered for ${id}`);
                    })
                    .on('active.test', id => {
                        assert.equal(id, 'item-8', `The active event is triggered for ${id}`);
                    })
                    .setActiveItem('item-8');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is already active');
                        assert.equal($container.find('.review-panel-part.active').is('[data-control="QTIExamples"]'), true, 'The expected test part is now active');
                        assert.equal($container.find('.review-panel-part.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is already active');
                        assert.equal($container.find('.review-panel-section.active').is('[data-control="assessmentSection-3"]'), true, 'The expected test section is now active');
                        assert.equal($container.find('.review-panel-section.active.expanded').length, 1, 'The test section is expanded');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 1, 'A test item is already active');
                        assert.equal($container.find('.review-panel-item.active').is('[data-control="item-8"]'), true, 'The expected test item is now active');

                        assert.equal($container.find('.review-panel-content .active').length, 3, '3 elements are now active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', id => {
                                assert.equal(id, 'item-3', `The active event is triggered for ${id}`);
                                resolve();
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            })
                            .setActiveItem('item-3');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is now active');
                        assert.equal($container.find('.review-panel-part.active').is('[data-control="QTIExamples"]'), true, 'The expected test part is now active');
                        assert.equal($container.find('.review-panel-part.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is now active');
                        assert.equal($container.find('.review-panel-section.active').is('[data-control="assessmentSection-2"]'), true, 'The expected test section is now active');
                        assert.equal($container.find('.review-panel-section.active.expanded').length, 1, 'The test section is expanded');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 1, 'A test item is now active');
                        assert.equal($container.find('.review-panel-item.active').is('[data-control="item-3"]'), true, 'The expected test item is now active');

                        assert.equal($container.find('.review-panel-content .active').length, 3, '3 elements are now active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            })
                            .setActiveItem('item-3');
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', id => {
                                assert.equal(id, 'item-1', `The active event is triggered for ${id}`);
                                resolve();
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            })
                            .setActiveItem('item-1');
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is now active');
                        assert.equal($container.find('.review-panel-part.active').is('[data-control="Introduction"]'), true, 'The expected test part is now active');
                        assert.equal($container.find('.review-panel-part.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is now active');
                        assert.equal($container.find('.review-panel-section.active').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is now active');
                        assert.equal($container.find('.review-panel-section.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 1, 'A test item is now active');
                        assert.equal($container.find('.review-panel-item.active').is('[data-control="item-1"]'), true, 'The expected test item is now active');

                        assert.equal($container.find('.review-panel-content .active').length, 3, '3 elements are now active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            })
                            .setActiveItem('item-1');
                        window.setTimeout(resolve, 300);
                    }))
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

    QUnit.test('active item click', assert => {
        const ready = assert.async();
        const $container = $('#fixture-item-click');

        assert.expect(50);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 0, 'No test part is active yet');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 0, 'No test section is active yet');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 0, 'No test item is active yet');

                        assert.equal($container.find('.review-panel-content .active').length, 0, 'No element is active yet');
                    })
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('active.test', id => {
                                    assert.equal(id, 'item-3', `The active event is triggered for ${id}`);
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('itemchange.test', (id, position) => {
                                    assert.equal(id, 'item-3', `The itemchange event is triggered for ${id}`);
                                    assert.equal(position, 2, `The itemchange event is triggered for position ${position}`);
                                    resolve();
                                });
                            })
                        ];
                        $container.find('[data-control="item-3"]').click();
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is now active');
                        assert.equal($container.find('.review-panel-part.active').is('[data-control="QTIExamples"]'), true, 'The expected test part is now active');
                        assert.equal($container.find('.review-panel-part.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is now active');
                        assert.equal($container.find('.review-panel-section.active').is('[data-control="assessmentSection-2"]'), true, 'The expected test section is now active');
                        assert.equal($container.find('.review-panel-section.active.expanded').length, 1, 'The test section is expanded');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 1, 'A test item is now active');
                        assert.equal($container.find('.review-panel-item.active').is('[data-control="item-3"]'), true, 'The expected test item is now active');

                        assert.equal($container.find('.review-panel-content .active').length, 3, '3 elements are now active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            });
                        $container.find('[data-control="item-3"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('active.test', id => {
                                    assert.equal(id, 'item-1', `The active event is triggered for ${id}`);
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('itemchange.test', (id, position) => {
                                    assert.equal(id, 'item-1', `The itemchange event is triggered for ${id}`);
                                    assert.equal(position, 0, `The itemchange event is triggered for position ${position}`);
                                    resolve();
                                });
                            })
                        ];
                        $container.find('[data-control="item-1"]').click();
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 1, 'A test part is now active');
                        assert.equal($container.find('.review-panel-part.active').is('[data-control="Introduction"]'), true, 'The expected test part is now active');
                        assert.equal($container.find('.review-panel-part.active.expanded').length, 1, 'The test part is expanded');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 1, 'A test section is now active');
                        assert.equal($container.find('.review-panel-section.active').is('[data-control="assessmentSection-1"]'), true, 'The expected test section is now active');
                        assert.equal($container.find('.review-panel-section.active.expanded').length, 1, 'The test section is expanded');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 1, 'A test item is now active');
                        assert.equal($container.find('.review-panel-item.active').is('[data-control="item-1"]'), true, 'The expected test item is now active');

                        assert.equal($container.find('.review-panel-content .active').length, 3, '3 elements are now active');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            });
                        $container.find('[data-control="item-1"]').click();
                        window.setTimeout(resolve, 300);
                    }))
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

    QUnit.test('active item filter', assert => {
        const ready = assert.async();
        const $container = $('#fixture-item-change');

        assert.expect(23);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.equal(instance.getActiveFilter(), 'all', 'The "All" filter is activated by default');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('active.test', id => {
                                assert.equal(id, 'item-1', `The active event is triggered for ${id}`);
                                resolve();
                            })
                            .setActiveItem('item-1');
                    }))
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('active.test', id => {
                                    assert.equal(id, 'item-3', `The active event is triggered for ${id}`);
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('itemchange.test', (id, position) => {
                                    assert.equal(id, 'item-3', `The itemchange event is triggered for ${id}`);
                                    assert.equal(position, 2, `The itemchange event is triggered for position ${position}`);
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('datachange.test', data => {
                                    assert.ok(true, 'The datachange event is emitted');
                                    assert.deepEqual(data.parts, reviewDataIncorrectFiltered.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataIncorrectFiltered.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataIncorrectFiltered.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', data => {
                                    assert.ok(true, 'The update event is emitted');
                                    assert.deepEqual(data.parts, reviewDataIncorrectFiltered.parts, 'The event data contains: parts');
                                    assert.deepEqual(data.items instanceof Map, true, 'The event data contains: items');
                                    assert.deepEqual(data.score, reviewDataIncorrectFiltered.score, 'The event data contains: score');
                                    assert.deepEqual(data.maxScore, reviewDataIncorrectFiltered.maxScore, 'The event data contains: maxScore');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('filterchange.test', filterId => {
                                    assert.equal(filterId, 'incorrect', 'The filterchange event is triggered with the expected parameter');
                                    instance.setData(testMapIncorrectFiltered);
                                    resolve();
                                });
                            })
                        ];
                        instance.setActiveFilter('incorrect');
                        assert.equal(instance.getActiveFilter(), 'incorrect', 'The "Incorrect" filter is now activated');
                        return Promise.all(promises);
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

    QUnit.test('disable', assert => {
        const ready = assert.async();
        const $container = $('#fixture-disable');

        assert.expect(27);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, testMapIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData().parts, reviewDataIncorrect.parts, 'The initial data is set: parts');
                assert.deepEqual(instance.getData().items instanceof Map, true, 'The initial data is set: items');
                assert.deepEqual(instance.getData().score, reviewDataIncorrect.score, 'The initial data is set: score');
                assert.deepEqual(instance.getData().maxScore, reviewDataIncorrect.maxScore, 'The initial data is set: maxScore');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal(instance.is('disabled'), false, 'The instance is not disabled');

                Promise
                    .resolve()
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part.active').length, 0, 'No test part is active yet');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'No test part is expanded yet');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section.active').length, 0, 'No test section is active yet');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'No test section is expanded yet');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item.active').length, 0, 'No test item is active yet');

                        assert.equal($container.find('.review-panel-content .active').length, 0, 'No element is active yet');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .after('disable.test', () => {
                                assert.equal(instance.is('disabled'), true, 'The instance is disabled');
                                resolve();
                            })
                            .disable();
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            });
                        $container.find('[data-control="item-1"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            });
                        $container.find('[data-control="assessmentSection-2"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('collapse.test', () => {
                                assert.ok(false, 'The collapse event should not be triggered');
                            })
                            .on('expand.test', () => {
                                assert.ok(false, 'The expand event should not be triggered');
                            })
                            .on('active.test', () => {
                                assert.ok(false, 'The active event should not be triggered');
                            })
                            .on('itemchange.test', () => {
                                assert.ok(false, 'The itemchange event should not be triggered');
                            });
                        $container.find('[data-control="QTIExamples"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => {
                        assert.equal($container.find('.review-panel-part.active').length, 0, 'Still no test part is active');
                        assert.equal($container.find('.review-panel-part.expanded').length, 0, 'Still no test part is expanded');
                        assert.equal($container.find('.review-panel-section.active').length, 0, 'Still no test section is active');
                        assert.equal($container.find('.review-panel-section.expanded').length, 0, 'Still no test section is expanded');
                        assert.equal($container.find('.review-panel-item.active').length, 0, 'Still no test item is active');
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
            showScore: true
        };
        const data = {
            correct: testMapCorrect,
            incorrect: testMapIncorrect
        };
        const filterData = {
            all: testMapIncorrect,
            incorrect: testMapIncorrectFiltered
        };
        let instance = null;
        let componentDisabled = false;
        let currentData = data.correct;
        const showItem = (id, position) => {
            const item = instance.getData().items.get(id);
            if (item) {
                $item.html(`<h1>${item.label}</h1><p>${id} at #${position}</p>`);
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
                    console.log(currentData)
                    instance = reviewPanelFactory($container, config, currentData)
                        .on('ready', () => {
                            instance.setActiveItem(currentData.jumps.find(item => item.identifier).identifier);
                            if (componentDisabled) {
                                instance.disable();
                            }
                            resolve();
                        })
                        .after('update', () => showItem(instance.getActiveItem(), instance.getActiveItemPosition()))
                        .on('itemchange', showItem)
                        .on('filterchange', filterId => instance.setData(filterData[filterId]))
                        .on('error', reject);
                })
                .catch(reject);
        });
        assert.expect(2);

        assert.equal($container.children().length, 0, 'The container is empty');

        setup()
            .then(() => {
                manageButtons('#visual-test .header .state', 'correct', control => {
                    if (control === 'incorrect') {
                        currentData = filterData[instance.getActiveFilter() || 'all'];
                    } else {
                        currentData = data[control];
                    }
                    instance.setData(currentData);
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
