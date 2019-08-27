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
    'lodash',
    'taoReview/review/services/navigation-data',
    'json!taoReview/test/review/services/navigation-data/map-correct.json',
    'json!taoReview/test/review/services/navigation-data/map-incorrect.json',
    'json!taoReview/test/review/services/navigation-data/computed-map-correct.json',
    'json!taoReview/test/review/services/navigation-data/computed-map-incorrect.json',
    'json!taoReview/test/review/services/navigation-data/filtered-map-correct-correct.json',
    'json!taoReview/test/review/services/navigation-data/filtered-map-correct-incorrect.json',
    'json!taoReview/test/review/services/navigation-data/filtered-map-incorrect-correct.json',
    'json!taoReview/test/review/services/navigation-data/filtered-map-incorrect-incorrect.json',
    'json!taoReview/test/review/services/navigation-data/review-data-correct.json',
    'json!taoReview/test/review/services/navigation-data/review-data-incorrect.json'
], function (
    _,
    navigationDataFactory,
    testMapCorrect,
    testMapIncorrect,
    computedMapCorrect,
    computedMapIncorrect,
    filteredMapCorrectCorrect,
    filteredMapCorrectIncorrect,
    filteredMapIncorrectCorrect,
    filteredMapIncorrectIncorrect,
    reviewDataCorrect,
    reviewDataIncorrect
) {
    'use strict';

    const emptyMap = {
        parts: {},
        score: 0,
        maxScore: 0
    };

    QUnit.dump.maxDepth = 20;

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        assert.expect(3);
        assert.equal(typeof navigationDataFactory, 'function', 'The module exposes a function');
        assert.equal(typeof navigationDataFactory(testMapCorrect), 'object', 'The factory produces an object');
        assert.notStrictEqual(navigationDataFactory(testMapCorrect), navigationDataFactory(testMapCorrect), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'before'},
        {title: 'after'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const instance = navigationDataFactory(testMapCorrect);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.cases.init([
        {title: 'getMap'},
        {title: 'getFilteredMap'},
        {title: 'setMap'},
        {title: 'filterMap'},
        {title: 'computeMap'},
        {title: 'getReviewPanelMap'}
    ]).test('service API', (data, assert) => {
        const instance = navigationDataFactory(testMapCorrect);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('API');

    QUnit.cases.init([{
        title: 'correct',
        testMap: testMapCorrect,
        expected: computedMapCorrect
    }, {
        title: 'incorrect',
        testMap: testMapIncorrect,
        expected: computedMapIncorrect
    }]).test('factory', (data, assert) => {
        const instance = navigationDataFactory(data.testMap);
        assert.expect(1);
        assert.deepEqual(instance.getMap(), data.expected, 'The instance has been initialized with the expected data');
    });

    QUnit.cases.init([{
        title: 'correct',
        testMap: testMapCorrect,
        expected: computedMapCorrect
    }, {
        title: 'incorrect',
        testMap: testMapIncorrect,
        expected: computedMapIncorrect
    }]).test('getMap/setMap', (data, assert) => {
        const ready = assert.async();
        const instance = navigationDataFactory();
        assert.expect(4);
        Promise
            .resolve()
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapchange.test', newMap => {
                        assert.deepEqual(newMap, data.expected, 'The event mapchange has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getMap(), emptyMap, 'The instance has been initialized with empty data');
                assert.deepEqual(instance.setMap(data.testMap), instance, 'The method setMap() is fluent');
            }))
            .then(() => {
                assert.deepEqual(instance.getMap(), data.expected, 'The method getMap() returned the expected data');
            })
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(ready);
    });

    QUnit.test('error using filter', assert => {
        const instance = navigationDataFactory(testMapCorrect);

        assert.expect(3);
        assert.deepEqual(instance.getMap(), computedMapCorrect, 'The instance has been initialized with the expected data');
        assert.throws(() => instance.filterMap('wrong'), 'The method filterMap() must receive a function');
        assert.throws(() => instance.filterMap(null), 'The method filterMap() must receive a function');

        try {
            instance.filterMap();
        } catch (e) {
            assert.ok(false, 'The method filterMap() should not throw an error if using the default callback');
        }

        try {
            instance.filterMap(() => false);
        } catch (e) {
            assert.ok(false, 'The method filterMap() should not throw an error if using a callback');
        }
    });

    QUnit.test('filter from correct map', assert => {
        const ready = assert.async();
        const instance = navigationDataFactory(testMapCorrect);
        const filterIncorrect = item => !item.informational && (!item.maxScore || item.score !== item.maxScore);
        const filterCorrect = item => item.informational || (item.maxScore && item.score === item.maxScore);

        assert.expect(10);
        Promise
            .resolve()
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, filteredMapCorrectIncorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), computedMapCorrect, 'The instance has been initialized with the expected data');
                assert.deepEqual(instance.filterMap(filterIncorrect), instance, 'The method filterMap() is fluent - filter by incorrect');
            }))
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, filteredMapCorrectCorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), filteredMapCorrectIncorrect, 'The exposed test map has been updated to match the filter');
                assert.deepEqual(instance.filterMap(filterCorrect), instance, 'The method filterMap() is fluent - filter by correct');
            }))
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, computedMapCorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), filteredMapCorrectCorrect, 'The exposed test map has been updated to match the filter');
                assert.deepEqual(instance.filterMap(), instance, 'The method filterMap() is fluent - no filter');
            }))
            .then(() => {
                assert.deepEqual(instance.getFilteredMap(), computedMapCorrect, 'The exposed test map has been reverted to former value');
            })
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(ready);
    });

    QUnit.test('filter from incorrect map', assert => {
        const ready = assert.async();
        const instance = navigationDataFactory(testMapIncorrect);
        const filterIncorrect = item => !item.informational && (!item.maxScore || item.score !== item.maxScore);
        const filterCorrect = item => item.informational || (item.maxScore && item.score === item.maxScore);

        assert.expect(10);
        Promise
            .resolve()
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, filteredMapIncorrectIncorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), computedMapIncorrect, 'The instance has been initialized with the expected data');
                assert.deepEqual(instance.filterMap(filterIncorrect), instance, 'The method filterMap() is fluent - filter by incorrect');
            }))
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, filteredMapIncorrectCorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), filteredMapIncorrectIncorrect, 'The exposed test map has been updated to match the filter');
                assert.deepEqual(instance.filterMap(filterCorrect), instance, 'The method filterMap() is fluent - filter by correct');
            }))
            .then(() => new Promise(resolve => {
                instance
                    .off('.test')
                    .on('mapfilter.test', filterMap => {
                        assert.deepEqual(filterMap, computedMapIncorrect, 'The event mapfilter has been emitted');
                        resolve();
                    });
                assert.deepEqual(instance.getFilteredMap(), filteredMapIncorrectCorrect, 'The exposed test map has been updated to match the filter');
                assert.deepEqual(instance.filterMap(), instance, 'The method filterMap() is fluent - no filter');
            }))
            .then(() => {
                assert.deepEqual(instance.getFilteredMap(), computedMapIncorrect, 'The exposed test map has been reverted to former value');
            })
            .catch(err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
            })
            .then(ready);
    });

    QUnit.cases.init([{
        title: 'correct',
        testMap: testMapCorrect,
        expected: computedMapCorrect
    }, {
        title: 'incorrect',
        testMap: testMapIncorrect,
        expected: computedMapIncorrect
    }]).test('computeMap', (data, assert) => {
        const instance = navigationDataFactory();
        assert.expect(2);
        assert.deepEqual(instance.getMap(), emptyMap, 'The instance has been initialized with empty data');
        assert.deepEqual(instance.computeMap(data.testMap), data.expected, 'The method computeMap() returns the expected data');
    });

    QUnit.cases.init([{
        title: 'correct',
        testMap: testMapCorrect,
        expected: reviewDataCorrect
    }, {
        title: 'incorrect',
        testMap: testMapIncorrect,
        expected: reviewDataIncorrect
    }]).test('getReviewPanelMap', (data, assert) => {
        const instance = navigationDataFactory(data.testMap);
        assert.expect(1);
        assert.deepEqual(instance.getReviewPanelMap(), data.expected, 'The method getReviewPanelMap() returns the expected data');
    });

});
