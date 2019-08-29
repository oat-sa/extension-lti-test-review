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
 * Copyright (c) 2019 Open Assessment Technologies SA ;
 */

/**
 * Extends the navigator service supplied by the QTI test runner,
 * supporting filtered jumps tables (created after test map filtering).
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/testContextBuilder',
    'taoQtiTest/runner/navigator/navigator'
], function (_, mapHelper, testContextBuilder, runnerNavigatorFactory) {

    /**
     * Gives you a navigator
     * @param {Object} testContext
     * @param {Object} testMap
     * @returns {Object} the navigator
     * @throws {TypeError} if the given parameters aren't objects
     */
    function navigatorFactory(testContext, testMap) {
        const navigator = runnerNavigatorFactory(testContext, testMap);

        // extends the default navigator, taking care of corrupted jumps table
        return Object.assign({}, navigator, {
            /**
             * Navigate to the next item
             * @returns {testContext} the new test context
             */
            nextItem() {
                const itemPosition = testContext.itemPosition + 1;
                return testContextBuilder.buildTestContextFromPosition(testContext, testMap, itemPosition);
            },

            /**
             * Navigate to the next item
             * @returns {testContext} the new test context
             */
            previousItem() {
                const itemPosition = testContext.itemPosition - 1;
                return testContextBuilder.buildTestContextFromPosition(testContext, testMap, itemPosition);
            },

            /**
             * Navigate to the next item
             * @returns {testContext} the new test context
             */
            nextSection() {
                const sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                const section = mapHelper.getSection(testMap, testContext.sectionId);
                const itemPosition = section.position + sectionStats.total;
                return testContextBuilder.buildTestContextFromPosition(testContext, testMap, itemPosition);
            }
        });
    }

    return navigatorFactory;
});
