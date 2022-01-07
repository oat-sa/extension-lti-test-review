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
 * Copyright (c) 2019-22 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'ltiTestReview/review/plugins/navigation/review-panel/panel-data',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/map-correct.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/map-incorrect.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-correct-with-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-incorrect-with-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-correct-without-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-incorrect-without-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-extended-correct-with-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-extended-incorrect-with-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-extended-correct-without-score.json',
    'json!ltiTestReview/test/review/plugins/navigation/review-panel/panel-data/review-data-extended-incorrect-without-score.json'
], function (
    _,
    reviewDataHelper,
    testMapCorrect,
    testMapIncorrect,
    reviewDataCorrectWithScore,
    reviewDataIncorrectWithScore,
    reviewDataCorrectWithoutScore,
    reviewDataIncorrectWithoutScore,
    reviewDataExtendedCorrectWithScore,
    reviewDataExtendedIncorrectWithScore,
    reviewDataExtendedCorrectWithoutScore,
    reviewDataExtendedIncorrectWithoutScore
) {
    'use strict';

    QUnit.dump.maxDepth = 20;

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        assert.expect(1);
        assert.equal(typeof reviewDataHelper, 'object', 'The module exposes an object');
    });

    QUnit.cases.init([
        {title: 'getAccordionReviewPanelMap'},
        {title: 'getFizzyReviewPanelMap'}
    ]).test('helper API', (data, assert) => {
        assert.expect(1);
        assert.equal(typeof reviewDataHelper[data.title], 'function', `The helper exposes a "${data.title}" function`);
    });

    QUnit.module('API');

    QUnit.cases.init([{
        title: 'correct, score enabled',
        testMap: testMapCorrect,
        withScore: true,
        expected: reviewDataCorrectWithScore
    }, {
        title: 'incorrect, score enabled',
        testMap: testMapIncorrect,
        withScore: true,
        expected: reviewDataIncorrectWithScore
    }, {
        title: 'correct, score disabled',
        testMap: testMapCorrect,
        withScore: false,
        expected: reviewDataCorrectWithoutScore
    }, {
        title: 'incorrect, score disabled',
        testMap: testMapIncorrect,
        withScore: false,
        expected: reviewDataIncorrectWithoutScore
    }]).test('getAccordionReviewPanelMap', (data, assert) => {
        assert.expect(_.size(data.expected) + 1);
        const reviewData = reviewDataHelper.getAccordionReviewPanelMap(data.testMap, data.withScore);
        assert.equal(reviewData.items instanceof Map, true, 'The items collection is set');
        _.forEach(data.expected, (value, key) => {
            assert.deepEqual(reviewData[key], value, `The method getAccordionReviewPanelMap() returns the expected data for the key ${key}`);
        });
    });

    QUnit.cases.init([{
        title: 'correct, score enabled',
        testMap: testMapCorrect,
        withScore: true,
        expected: reviewDataExtendedCorrectWithScore
    }, {
        title: 'incorrect, score enabled',
        testMap: testMapIncorrect,
        withScore: true,
        expected: reviewDataExtendedIncorrectWithScore
    }, {
        title: 'correct, score disabled',
        testMap: testMapCorrect,
        withScore: false,
        expected: reviewDataExtendedCorrectWithoutScore
    }, {
        title: 'incorrect, score disabled',
        testMap: testMapIncorrect,
        withScore: false,
        expected: reviewDataExtendedIncorrectWithoutScore
    }]).test('getFizzyReviewPanelMap', (data, assert) => {
        assert.expect(_.size(data.expected) + 1);
        const reviewData = reviewDataHelper.getFizzyReviewPanelMap(data.testMap, data.withScore, true);
        assert.equal(reviewData.items instanceof Map, true, 'The items collection is set');
        _.forEach(data.expected, (value, key) => {
            assert.deepEqual(reviewData[key], value, `The method getFizzyReviewPanelMap() returns the expected data for the key ${key}`);
        });
    });

});
