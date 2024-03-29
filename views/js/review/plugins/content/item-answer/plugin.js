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
 * Copyright (c) 2019-2024 Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'core/promiseTimeout',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/runner/helpers/map',
    'ltiTestReview/review/plugins/content/item-answer/item-answer'
], function (_, promiseTimeout, pluginFactory, itemHelper, mapHelper, itemAnswerFactory) {
    'use strict';

    /**
     * Gets the response of the current item
     * @param {runner} testRunner
     * @returns {Object}
     */
    const getItemResponse = testRunner => {
        const context = testRunner.getTestContext();
        const dataHolder = testRunner.getDataHolder();
        let response = null;

        if (context) {
            const { itemIdentifier } = context;
            const responses = dataHolder.get('testResponses');
            response = responses[itemIdentifier];
        }

        return response;
    };

    /**
     * Gets the correct response of the current item
     * @param {runner} testRunner
     * @returns {Object}
     */
    const getItemCorrectResponse = testRunner => {
        const declarations = itemHelper.getDeclarations(testRunner);
        const response = {};
        _.forEach(declarations, declaration => {
            const { attributes } = declaration;
            const { identifier, baseType, cardinality } = attributes || {};
            if (!_.isEmpty(declaration.correctResponse)) {
                response[identifier] = {
                    response: itemHelper.toResponse(declaration.correctResponse, baseType, cardinality)
                };
            } else if (declaration.mapEntries && _.size(declaration.mapEntries)) {
                response[identifier] = {
                    response: itemHelper.toResponse(_.keys(declaration.mapEntries), baseType, cardinality)
                };
            } else {
                response[identifier] = {
                    response: itemHelper.toResponse('', baseType, cardinality)
                };
            }
        });
        return response;
    };

    /**
     * Replace the state of the current item
     * @param {String} name
     * @param {runner} testRunner
     */
    const setItemState = (name, testRunner) => {
        const itemRunner = testRunner.itemRunner;
        const { showCorrect } = testRunner.getOptions();
        let response = null;

        if (itemRunner) {
            if (name === 'correct' && showCorrect) {
                response = getItemCorrectResponse(testRunner);
            } else if (testRunner.getTestContext()) {
                response = getItemResponse(testRunner);
            }

            if (response) {
                itemRunner.setState(response);
            }
        }
    };

    /**
     * Should match `review-panel` plugin's item types
     * @param {Object} item
     * @param {Boolean} withScore
     * @returns {String}
     */
    const getItemStatusType = (item, withScore) => {
        if (withScore) {
            if (item.informational) {
                return 'informational';
            }
            if (item.isExternallyScored && item.pendingExternalScore) {
                return 'pending';
            }
            if (item.maxScore && item.score > 0 && item.score === item.maxScore) {
                return 'correct';
            }
            if (item.maxScore && item.score === 0) {
                return 'incorrect';
            }
            if (item.maxScore && item.score > 0 && item.score < item.maxScore) {
                return 'partial';
            }
            return 'no-score';
        } else {
            if (item.informational) {
                return 'informational';
            }
            if (item.skipped) {
                return 'skipped';
            }
            return 'default';
        }
    };

    /**
     * Checks if item should have correct response tab
     *  (`showCorrect` config option should be checked outside)
     * @param {Object} item
     * @returns {Boolean}
     */
    const getHasCorrectResponseTab = item => {
        const statusWithScore = getItemStatusType(item, true);
        return ['pending', 'correct', 'incorrect', 'partial'].includes(statusWithScore);
    };

    /**
     * Test Review Plugin : Item Answer Tabs
     * Displays a tabs bar that allows to switch between responses and correct responses
     */
    return pluginFactory({
        name: 'item-answer',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init() {
            this.getTestRunner()
                .on('enablenav', () => this.enable())
                .on('disablenav', () => this.disable());
        },

        /**
         * Called during the runner's render phase
         * @returns {Promise}
         */
        render() {
            return promiseTimeout(
                new Promise(resolve => {
                    const testRunner = this.getTestRunner();
                    const areaBroker = this.getAreaBroker();
                    const { showScore, showCorrect } = testRunner.getOptions();
                    const itemAnswer = itemAnswerFactory(
                        areaBroker.getArea('itemTool'),
                        Object.assign({ showScore, showCorrect }, this.getConfig())
                    );

                    // control the test runner from the review panel
                    itemAnswer.on('tabchange', name => setItemState(name, testRunner)).on('ready', resolve);

                    // reflect the test runner state to the review panel
                    testRunner
                        .on('renderitem', itemRef => {
                            const item = mapHelper.getItem(testRunner.getTestMap(), itemRef);

                            const statusType = getItemStatusType(item, showScore);
                            const hasCorrectResponseTab = getHasCorrectResponseTab(item);
                            itemAnswer.setStatus(statusType, hasCorrectResponseTab);

                            itemAnswer.setHasNoAnswer(item.skipped);

                            let score = '';
                            if (
                                ['correct', 'incorrect', 'partial', 'pending'].includes(statusType) &&
                                item.maxScore
                            ) {
                                score = `${item.score || 0}/${item.maxScore}`;
                            }
                            itemAnswer.setScore(score);

                            // remove all tabindex's inside item for right navigation
                            areaBroker.getContentArea().find('[tabindex]').attr('tabindex', -1);
                        })
                        .on(`plugin-show.${this.getName()}`, () => itemAnswer.show())
                        .on(`plugin-hide.${this.getName()}`, () => itemAnswer.hide())
                        .on(`plugin-enable.${this.getName()}`, () => itemAnswer.enable())
                        .on(`plugin-disable.${this.getName()}`, () => itemAnswer.disable())
                        .on(`plugin-destroy.${this.getName()}`, () => itemAnswer.destroy());
                })
            );
        }
    });
});
