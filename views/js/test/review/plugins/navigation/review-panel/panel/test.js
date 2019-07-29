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
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-correct.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-correct-all.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-incorrect.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-incorrect-all.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/review-data-incorrect-filtered.json'
], function (
    $,
    _,
    __,
    reviewPanelFactory,
    reviewDataCorrect,
    reviewDataCorrectAll,
    reviewDataIncorrect,
    reviewDataIncorrectAll,
    reviewDataIncorrectFiltered
) {
    'use strict';

    const defaultHeader = {
        label: __('TEST SCORE:'),
        score: '0%'
    };
    const defaultFooter = {
        label: __('TOTAL'),
        score: '0/0'
    };
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
            filters: defaultFilters
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
                const config = this.getConfig();
                if (Array.isArray(config.filters)) {
                    // remove callbacks to simplify testing
                    config.filters = config.filters.map(filter => {
                        const {id, label, title} = filter;
                        return {id, label, title};
                    });
                }
                assert.deepEqual(config, data.expected, 'The expected config has been built');
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

    QUnit.test('render', assert => {
        const ready = assert.async();
        const $container = $('#fixture-render');
        const config = {};

        assert.expect(16);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, config)
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

    QUnit.test('destroy', assert => {
        const ready = assert.async();
        const $container = $('#fixture-destroy');

        assert.expect(6);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

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

        assert.expect(20);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {filters: defaultFilters})
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.equal(instance.getActiveFilter(), defaultFilters[0], 'The first filter is activated by default');

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
                                assert.equal(filterId, defaultFilters[1].id, 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        assert.equal(instance.setActiveFilter(defaultFilters[1].id), instance, 'setActiveFilter is fluent');
                        assert.equal(instance.getActiveFilter(), defaultFilters[1], 'The second filter is now activated');

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('filterchange.test', filterId => {
                                assert.equal(filterId, defaultFilters[0].id, 'The filterchange event is triggered with the expected parameter');
                                resolve();
                            });

                        $container.find('.review-panel-filter:nth(0)').click();

                        assert.equal(instance.getActiveFilter(), defaultFilters[0], 'The filter filter is now activated');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is now active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active anymore');
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

    QUnit.test('data with correct responses', assert => {
        const ready = assert.async();
        const $container = $('#fixture-data-correct');
        const initialData = {
            parts: [{
                id: 'part',
                label: 'part',
                sections: [{
                    id: 'section',
                    label: 'section',
                    items: [{
                        id: 'item',
                        label: 'item',
                        position: 0,
                        score: 0,
                        maxScore: 1
                    }]
                }]
            }]
        };
        const initialDataAll = {
            testMap: {
                parts: [{
                    id: 'part',
                    label: 'part',
                    sections: [{
                        id: 'section',
                        label: 'section',
                        items: [{
                            id: 'item',
                            label: 'item',
                            cls: 'item-incorrect',
                            position: 0,
                            score: 0,
                            maxScore: 1
                        }]
                    }]
                }]
            },
            score: 0,
            maxScore: 1
        };

        assert.expect(96);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData(), initialDataAll, 'The initial data is set');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-part').length, 1, 'A test part is rendered');
                assert.equal($container.find('.review-panel-part > .review-panel-label').text().trim(), initialData.parts[0].label, 'The rendered test part got the expected label');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-section > .review-panel-label').text().trim(), initialData.parts[0].sections[0].label, 'The rendered test section got the expected label');
                assert.equal($container.find('.review-panel-item').length, 1, 'A test item is rendered');
                assert.equal($container.find('.review-panel-item').is('.item-incorrect'), true, 'The item got the expected icon');
                assert.equal($container.find('.review-panel-item > .review-panel-label').text().trim(), initialData.parts[0].sections[0].items[0].label, 'The rendered test item got the expected label');

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
                                instance.on('datachange.test', newData => {
                                    assert.deepEqual(newData, reviewDataCorrectAll, 'The datachange event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', filteredData => {
                                    assert.deepEqual(filteredData, reviewDataCorrectAll, 'The update event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                        ];
                        assert.equal(instance.setData(reviewDataCorrect), instance, 'setData is fluent');
                        assert.deepEqual(instance.getData(), reviewDataCorrectAll, 'The updated data is set');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].label, 'The first test part got the expected label');
                        assert.equal($container.find('.review-panel-part:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].label, 'The second test part got the expected label');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].sections[0].label, 'The 1st rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].label, 'The 2nd rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(2) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].label, 'The 2nd rendered test section got the expected label');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].sections[0].items[0].label, 'The 1st rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[0].label, 'The 2nd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(2) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[1].label, 'The 3rd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(3) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[2].label, 'The 4th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(4) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[3].label, 'The 5th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(5) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[0].label, 'The 6th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(6) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[1].label, 'The 7th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(7) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[2].label, 'The 8th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(8) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[3].label, 'The 9th rendered test item got the expected label');

                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-info'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(1)').is('.item-correct'), true, 'The 2nd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(2)').is('.item-correct'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(3)').is('.item-correct'), true, 'The 4th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(4)').is('.item-correct'), true, 'The 5th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(5)').is('.item-correct'), true, 'The 6th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(6)').is('.item-correct'), true, 'The 7th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(7)').is('.item-correct'), true, 'The 8th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(8)').is('.item-correct'), true, 'The 9th item got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '17/17', 'The header score is rendered');

                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 0, 'The filters are not displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');
                    })
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('filterchange.test', filterId => {
                                    assert.equal(filterId, defaultFilters[1].id, 'The filterchange event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', filteredData => {
                                    assert.deepEqual(filteredData, reviewDataCorrectAll, 'The update event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                        ];
                        instance.setActiveFilter(defaultFilters[1].id);

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].label, 'The first test part got the expected label');
                        assert.equal($container.find('.review-panel-part:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].label, 'The second test part got the expected label');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].sections[0].label, 'The 1st rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].label, 'The 2nd rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(2) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].label, 'The 2nd rendered test section got the expected label');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:nth(0) > .review-panel-label').text().trim(), reviewDataCorrect.parts[0].sections[0].items[0].label, 'The 1st rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(1) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[0].label, 'The 2nd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(2) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[1].label, 'The 3rd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(3) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[2].label, 'The 4th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(4) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[0].items[3].label, 'The 5th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(5) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[0].label, 'The 6th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(6) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[1].label, 'The 7th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(7) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[2].label, 'The 8th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(8) > .review-panel-label').text().trim(), reviewDataCorrect.parts[1].sections[1].items[3].label, 'The 9th rendered test item got the expected label');

                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-info'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(1)').is('.item-correct'), true, 'The 2nd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(2)').is('.item-correct'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(3)').is('.item-correct'), true, 'The 4th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(4)').is('.item-correct'), true, 'The 5th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(5)').is('.item-correct'), true, 'The 6th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(6)').is('.item-correct'), true, 'The 7th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(7)').is('.item-correct'), true, 'The 8th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(8)').is('.item-correct'), true, 'The 9th item got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '100%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '17/17', 'The header score is rendered');

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
            parts: [{
                id: 'part',
                label: 'part',
                sections: [{
                    id: 'section',
                    label: 'section',
                    items: [{
                        id: 'item',
                        label: 'item',
                        position: 0,
                        score: 1,
                        maxScore: 1
                    }]
                }]
            }]
        };
        const initialDataAll = {
            testMap: {
                parts: [{
                    id: 'part',
                    label: 'part',
                    sections: [{
                        id: 'section',
                        label: 'section',
                        items: [{
                            id: 'item',
                            label: 'item',
                            cls: 'item-correct',
                            position: 0,
                            score: 1,
                            maxScore: 1
                        }]
                    }]
                }]
            },
            score: 1,
            maxScore: 1
        };

        assert.expect(77);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, initialData)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData(), initialDataAll, 'The initial data is set');

                assert.equal($container.find('.review-panel-content').length, 1, 'The content area is rendered');
                assert.equal($container.find('.review-panel-part').length, 1, 'A test part is rendered');
                assert.equal($container.find('.review-panel-part > .review-panel-label').text().trim(), initialData.parts[0].label, 'The rendered test part got the expected label');
                assert.equal($container.find('.review-panel-section').length, 1, 'A test section is rendered');
                assert.equal($container.find('.review-panel-section > .review-panel-label').text().trim(), initialData.parts[0].sections[0].label, 'The rendered test section got the expected label');
                assert.equal($container.find('.review-panel-item').length, 1, 'A test item is rendered');
                assert.equal($container.find('.review-panel-item').is('.item-correct'), true, 'The item got the expected icon');
                assert.equal($container.find('.review-panel-item > .review-panel-label').text().trim(), initialData.parts[0].sections[0].items[0].label, 'The rendered test item got the expected label');

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
                                instance.on('datachange.test', newData => {
                                    assert.deepEqual(newData, reviewDataIncorrectAll, 'The datachange event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', filteredData => {
                                    assert.deepEqual(filteredData, reviewDataIncorrectAll, 'The update event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                        ];
                        assert.equal(instance.setData(reviewDataIncorrect), instance, 'setData is fluent');
                        assert.deepEqual(instance.getData(), reviewDataIncorrectAll, 'The updated data is set');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 2, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[0].label, 'The first test part got the expected label');
                        assert.equal($container.find('.review-panel-part:nth(1) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].label, 'The second test part got the expected label');

                        assert.equal($container.find('.review-panel-section').length, 3, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[0].sections[0].label, 'The 1st rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(1) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].label, 'The 2nd rendered test section got the expected label');
                        assert.equal($container.find('.review-panel-section:nth(2) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[1].label, 'The 2nd rendered test section got the expected label');

                        assert.equal($container.find('.review-panel-item').length, 9, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[0].sections[0].items[0].label, 'The 1st rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(1) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].items[0].label, 'The 2nd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(2) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].items[1].label, 'The 3rd rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(3) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].items[2].label, 'The 4th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(4) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].items[3].label, 'The 5th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(5) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[1].items[0].label, 'The 6th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(6) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[1].items[1].label, 'The 7th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(7) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[1].items[2].label, 'The 8th rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(8) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[1].items[3].label, 'The 9th rendered test item got the expected label');

                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-info'), true, 'The 1st item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(1)').is('.item-correct'), true, 'The 2nd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(2)').is('.item-incorrect'), true, 'The 3rd item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(3)').is('.item-correct'), true, 'The 4th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(4)').is('.item-correct'), true, 'The 5th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(5)').is('.item-correct'), true, 'The 6th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(6)').is('.item-correct'), true, 'The 7th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(7)').is('.item-correct'), true, 'The 8th item got the expected icon');
                        assert.equal($container.find('.review-panel-item:nth(8)').is('.item-correct'), true, 'The 9th item got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '94%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '16/17', 'The header score is rendered');

                        assert.equal($container.find('.review-panel-filter').length, 2, 'The expected number of filters is renderer');
                        assert.equal($container.find('.review-panel-filter:visible').length, 2, 'The filters are displayed');
                        assert.equal($container.find('.review-panel-filter.active').length, 1, 'A filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), true, 'The first filter is active');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), false, 'The second filter is not active');
                    })
                    .then(() => {
                        instance.off('.test');
                        const promises = [
                            new Promise(resolve => {
                                instance.on('filterchange.test', filterId => {
                                    assert.equal(filterId, defaultFilters[1].id, 'The filterchange event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                            new Promise(resolve => {
                                instance.on('update.test', filteredData => {
                                    assert.deepEqual(filteredData, reviewDataIncorrectFiltered, 'The update event is triggered with the expected parameter');
                                    resolve();
                                });
                            }),
                        ];
                        instance.setActiveFilter(defaultFilters[1].id);

                        assert.equal($container.find('.review-panel-filter:nth(0)').is('.active'), false, 'The first filter is not active anymore');
                        assert.equal($container.find('.review-panel-filter:nth(1)').is('.active'), true, 'The second filter is now active');
                        return Promise.all(promises);
                    })
                    .then(() => {
                        assert.equal($container.find('.review-panel-part').length, 1, 'The test parts are rendered');
                        assert.equal($container.find('.review-panel-part:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].label, 'The first test part got the expected label');

                        assert.equal($container.find('.review-panel-section').length, 1, 'The test sections are rendered');
                        assert.equal($container.find('.review-panel-section:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].label, 'The 1st rendered test section got the expected label');

                        assert.equal($container.find('.review-panel-item').length, 1, 'The test items are rendered');
                        assert.equal($container.find('.review-panel-item:nth(0) > .review-panel-label').text().trim(), reviewDataIncorrect.parts[1].sections[0].items[1].label, 'The 1st rendered test item got the expected label');
                        assert.equal($container.find('.review-panel-item:nth(0)').is('.item-incorrect'), true, 'The 1st item got the expected icon');

                        assert.equal($container.find('.review-panel-header .review-panel-score').text().trim(), '94%', 'The header score is rendered');
                        assert.equal($container.find('.review-panel-footer .review-panel-score').text().trim(), '16/17', 'The header score is rendered');

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

        assert.expect(84);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, reviewDataIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData(), reviewDataIncorrectAll, 'The initial data is set');

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

        assert.expect(73);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, reviewDataIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData(), reviewDataIncorrectAll, 'The initial data is set');

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

        assert.expect(60);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = reviewPanelFactory($container, {}, reviewDataIncorrect)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.equal($container.children().length, 1, 'The container contains an element');

                assert.deepEqual(instance.getData(), reviewDataIncorrectAll, 'The initial data is set');

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

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test .panel');
        const instance = reviewPanelFactory($container, {}, reviewDataIncorrect);

        assert.expect(3);

        assert.equal($container.children().length, 0, 'The container is empty');

        instance
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.equal($container.children().length, 1, 'The container contains an element');
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

});
