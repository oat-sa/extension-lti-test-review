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
    'taoReview/review/plugins/navigation/review-panel/review-data',
    'json!taoReview/test/review/plugins/navigation/review-panel/review-data/map-correct.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/review-data/map-incorrect.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/review-data/review-data-correct.json',
    'json!taoReview/test/review/plugins/navigation/review-panel/review-data/review-data-incorrect.json'
], function (
    _,
    reviewDataHelper,
    testMapCorrect,
    testMapIncorrect,
    reviewDataCorrect,
    reviewDataIncorrect
) {
    'use strict';

    QUnit.dump.maxDepth = 20;

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        assert.expect(1);
        assert.equal(typeof reviewDataHelper, 'object', 'The module exposes an object');
    });

    QUnit.cases.init([
        {title: 'getReviewPanelMap'}
    ]).test('helper API', (data, assert) => {
        assert.expect(1);
        assert.equal(typeof reviewDataHelper[data.title], 'function', `The helper exposes a "${data.title}" function`);
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
        assert.expect(1);
        assert.deepEqual(reviewDataHelper.getReviewPanelMap(data.testMap), data.expected, 'The method getReviewPanelMap() returns the expected data');
    });

});
