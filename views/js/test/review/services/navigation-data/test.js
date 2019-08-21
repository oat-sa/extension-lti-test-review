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
    'json!taoReview/test/review/services/navigation-data/review-data-correct.json',
    'json!taoReview/test/review/services/navigation-data/review-data-incorrect.json'
], function (
    _,
    reviewPanelDataService,
    testMapCorrect,
    testMapIncorrect,
    reviewDataCorrect,
    reviewDataIncorrect
) {
    'use strict';

    /**
     * Simple mock for the test runner
     * @param {Object} testMap
     * @returns {Object}
     */
    const getTestRunner = testMap => {
        return {
            getTestMap() {
                return testMap;
            }
        };
    };

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        const testRunner = getTestRunner(testMapCorrect);
        assert.expect(3);
        assert.equal(typeof reviewPanelDataService, 'function', 'The module exposes a function');
        assert.equal(typeof reviewPanelDataService(testRunner), 'object', 'The factory produces an object');
        assert.notStrictEqual(reviewPanelDataService(testRunner), reviewPanelDataService(testRunner), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'getReviewPanelMap'}
    ]).test('inherited API', (data, assert) => {
        const testRunner = getTestRunner(testMapCorrect);
        const instance = reviewPanelDataService(testRunner);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('API');

    QUnit.cases.init([{
        title: 'correct',
        testMap: testMapCorrect,
        expected: reviewDataCorrect
    }, {
        title: 'incorrect',
        testMap: testMapIncorrect,
        expected: reviewDataIncorrect
    }]).test('getReviewPanelMap', (data, assert) => {
        const testRunner = getTestRunner(data.testMap);
        const instance = reviewPanelDataService(testRunner);
        assert.expect(1);
        assert.deepEqual(instance.getReviewPanelMap(), data.expected, 'The method getReviewPanelMap() returns the expected data');
    });

});
