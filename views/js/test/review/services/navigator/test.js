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
    'ltiTestReview/review/services/navigator',
    'json!ltiTestReview/test/review/services/navigator/testMap.json',
    'json!ltiTestReview/test/review/services/navigator/testMapFiltered.json',
    'json!ltiTestReview/test/review/services/navigator/testContexts.json'
], function (testNavigator, testMap, testMapFiltered, testContexts) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', assert => {
        assert.expect(1);

        assert.equal(typeof testNavigator, 'function', 'The navigator is a function');
    });

    QUnit.test('factory', assert => {
        assert.expect(5);

        assert.throws(testNavigator, TypeError, 'factory called without parameter');
        assert.throws(() => testNavigator({}), TypeError, 'factory called without all parameters');
        assert.throws(() => testNavigator(testContexts.context1), TypeError, 'factory called without all parameters');

        assert.equal(typeof testNavigator({}, testMap), 'object', 'The factory creates an object');
        assert.notEqual(testNavigator({}, testMap), testNavigator({}, testMap), 'The factory creates new objects');
    });

    QUnit.cases.init([
        {title: 'navigate'},
        {title: 'nextItem'},
        {title: 'previousItem'},
        {title: 'nextSection'},
        {title: 'jumpItem'}
    ]).test('Method ', (data, assert) => {
        assert.expect(1);

        assert.equal(
            typeof testNavigator({}, testMap)[data.title],
            'function',
            `The instance exposes a "${data.title}" method`
        );
    });

    QUnit.module('navigator.nextItem');

    QUnit.test('is moving to the next item inside a section', assert => {
        assert.expect(6);

        const updatedContext = testNavigator(testContexts.context1, testMap).nextItem();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-2',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 1, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-1',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
        assert.deepEqual(updatedContext.timeConstraints, [], 'The updated context has no time constraints');
        assert.deepEqual(
            updatedContext.options,
            {
                reviewScreen: true,
                markReview: true,
                endTestWarning: true,
                zoom: true,
                allowComment: false,
                allowSkipping: true,
                exitButton: false,
                logoutButton: false
            },
            'The updated context contains the correct options'
        );
    });

    QUnit.test('is moving to the next item over a section', assert => {
        assert.expect(6);

        const updatedContext = testNavigator(testContexts.context2, testMap).nextItem();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-4',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 3, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-2',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
        assert.deepEqual(
            updatedContext.timeConstraints,
            [
                {
                    label: 'Rubric block',
                    source: 'assessmentSection-2',
                    seconds: '60',
                    extraTime: 0,
                    allowLateSubmission: false,
                    qtiClassName: 'assessmentSection'
                }
            ],
            'The updated context contains the new section time constraints'
        );
        assert.deepEqual(
            updatedContext.options,
            {
                calculator: true,
                zoom: true,
                fooBarBaz: true,
                awesomeCategory: true,
                allowComment: false,
                allowSkipping: true,
                exitButton: false,
                logoutButton: false
            },
            'The updated context contains the correct options'
        );
    });

    QUnit.test('is moving to the next item over a testPart', assert => {
        assert.expect(6);

        const updatedContext = testNavigator(testContexts.context3, testMap).nextItem();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-15',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 14, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-6',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-2', 'The updated context contains the correct test part id');
        assert.equal(updatedContext.isLinear, false, 'The updated context contains the correct isLinear option');
        assert.equal(updatedContext.itemAnswered, false, 'The item is not answered since the test part is not linear');
    });

    QUnit.test('is moving to the next item over timed sections', assert => {
        assert.expect(6);

        const updatedContext = testNavigator(testContexts.context4, testMap).nextItem();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-7',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 6, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-3',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
        assert.equal(updatedContext.isLinear, false, 'The updated context contains the correct isLinear option');
        assert.deepEqual(
            updatedContext.timeConstraints,
            [
                {
                    label: 'Timed section',
                    source: 'assessmentSection-3',
                    seconds: '90',
                    extraTime: 0,
                    allowLateSubmission: false,
                    qtiClassName: 'assessmentSection'
                }
            ],
            'The updated context contains the new section time constraints'
        );
    });

    QUnit.test('is moving to the next item to the end', assert => {
        assert.expect(1);

        const updatedContext = testNavigator(testContexts.context5, testMap).nextItem();
        assert.equal(updatedContext, false, 'There is no next item');
    });

    QUnit.module('navigator.previousItem');

    QUnit.test('is moving to the previous item inside a section', assert => {
        assert.expect(5);

        const updatedContext = testNavigator(testContexts.context2, testMap).previousItem();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-2',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 1, 'The updated context contains the correct item position');
        assert.equal(updatedContext.itemAnswered, false, 'The item has already been answered');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-1',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
    });

    QUnit.module('navigator.nextSection');

    QUnit.test('is moving to the next section', assert => {
        assert.expect(6);

        const updatedContext = testNavigator(testContexts.context4, testMap).nextSection();

        assert.equal(
            updatedContext.itemIdentifier,
            'item-7',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 6, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-3',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
        assert.equal(updatedContext.isLinear, false, 'The updated context contains the correct isLinear option');
        assert.deepEqual(
            updatedContext.timeConstraints,
            [
                {
                    label: 'Timed section',
                    source: 'assessmentSection-3',
                    seconds: '90',
                    extraTime: 0,
                    allowLateSubmission: false,
                    qtiClassName: 'assessmentSection'
                }
            ],
            'The updated context contains the new section time constraints'
        );
    });

    QUnit.module('navigator.jumpItem');

    QUnit.test('is jumping to the 2nd previous item', assert => {
        assert.expect(5);

        const updatedContext = testNavigator(testContexts.context4, testMap).jumpItem(3);

        assert.equal(
            updatedContext.itemIdentifier,
            'item-4',
            'The updated context contains the correct item identifier'
        );
        assert.equal(updatedContext.itemPosition, 3, 'The updated context contains the correct item position');
        assert.equal(
            updatedContext.sectionId,
            'assessmentSection-2',
            'The updated context contains the correct section id'
        );
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
        assert.deepEqual(
            updatedContext.timeConstraints,
            [
                {
                    label: 'Rubric block',
                    source: 'assessmentSection-2',
                    seconds: '60',
                    extraTime: 0,
                    allowLateSubmission: false,
                    qtiClassName: 'assessmentSection'
                }
            ],
            'The updated context contains the new section time constraints'
        );
    });

    QUnit.module('navigator.navigate');

    QUnit.test('executes the correct movement', assert => {
        const aTestNavigator = testNavigator(testContexts.context4, testMap);
        let newTestContext;

        assert.expect(9);

        newTestContext = aTestNavigator.navigate('next', 'item');
        assert.deepEqual(newTestContext, aTestNavigator.nextItem());
        assert.equal(newTestContext.itemPosition, 6);

        newTestContext = aTestNavigator.navigate('previous', 'item');
        assert.deepEqual(newTestContext, aTestNavigator.previousItem());
        assert.equal(newTestContext.itemPosition, 4);

        newTestContext = aTestNavigator.navigate('next', 'section');
        assert.deepEqual(newTestContext, aTestNavigator.nextSection());
        assert.equal(newTestContext.itemPosition, 6);

        newTestContext = aTestNavigator.navigate('jump', 'item', 3);
        assert.deepEqual(newTestContext, aTestNavigator.jumpItem(3));
        assert.equal(newTestContext.itemPosition, 3);

        assert.equal(typeof aTestNavigator.navigate('forward', 'test-part', 3), 'undefined');
    });

    QUnit.test('still work with a filtered map', assert => {
        const aTestNavigator = testNavigator(testContexts.context4, testMapFiltered);
        let newTestContext;

        assert.expect(11);

        newTestContext = aTestNavigator.navigate('next', 'item');
        assert.deepEqual(newTestContext, aTestNavigator.nextItem());
        assert.equal(newTestContext.itemPosition, 7);

        newTestContext = aTestNavigator.navigate('previous', 'item');
        assert.deepEqual(newTestContext, aTestNavigator.previousItem());
        assert.equal(newTestContext.itemPosition, 0);

        newTestContext = aTestNavigator.navigate('next', 'section');
        assert.deepEqual(newTestContext, aTestNavigator.nextSection());
        assert.equal(newTestContext.itemPosition, 7);

        newTestContext = aTestNavigator.navigate('jump', 'item', 14);
        assert.deepEqual(newTestContext, aTestNavigator.jumpItem(14));
        assert.equal(newTestContext.itemPosition, 14);

        newTestContext = aTestNavigator.navigate('jump', 'item', 3);
        assert.deepEqual(newTestContext, aTestNavigator.jumpItem(3));
        assert.equal(newTestContext, false);

        assert.equal(typeof aTestNavigator.navigate('forward', 'test-part', 3), 'undefined');
    });
});
