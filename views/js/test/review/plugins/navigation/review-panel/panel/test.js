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
    'json!taoReview/test/review/plugins/navigation/review-panel/panel/list.json'
], function (
    $,
    _,
    __,
    reviewPanelFactory,
    panelData
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
        {title: 'getActiveFilter'},
        {title: 'setActiveFilter'},
        {title: 'getActiveItem'},
        {title: 'setActiveItem'},
        {title: 'expand'},
        {title: 'collapse'},
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
                label: 'test'
            }]
        },
        expected: {
            headerLabel: defaultHeader.label,
            footerLabel: defaultFooter.label,
            header: defaultHeader,
            footer: defaultFooter,
            filters: [{
                id: 'test',
                label: 'test'
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
                    config.filters.forEach(filter => {
                        if (filter.filter) {
                            delete filter.filter;
                        }
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

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test .panel');
        const instance = reviewPanelFactory($container, {}, panelData);

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
