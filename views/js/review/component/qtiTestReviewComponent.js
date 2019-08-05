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
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'context',
    'taoTests/runner/runnerComponent',
    'tpl!taoReview/review/component/tpl/qtiTestReviewComponent',
    'css!taoReview/review/provider/css/qtiTestReviewProvider'
], function (context, runnerComponentFactory, runnerTpl) {
    'use strict';

    /**
     * Builds a component with test runner to review a test
     * @param {jQuery|HTMLElement|String} container - The container in which renders the component
     * @param {Object} [config] - The testRunner options
     * @param {Object[]} [config.plugins] - Additional plugins to load
     * @param {Object[]} [config.pluginsOptions] - Options for the plugins
     * @param {String} [config.fullPage] - Force the review to occupy the full window.
     * @param {String} [config.readOnly] - Do not allow to modify the reviewed item.
     * @param {Function} [template] - An optional template for the component
     * @returns {review}
     */
    return function qtiTestReviewFactory(container, config = {}, template = null) {

        const testRunnerConfig = {
            testDefinition: config.testDefinition || 'test-container',
            serviceCallId: config.testUri && config.testUri.resultId || 'review',
            providers: {
                runner: {
                    id: 'qtiTestReviewProvider',
                    module: 'taoReview/review/provider/qtiTestReviewProvider',
                    bundle: 'taoReview/loader/qtiReview.min',
                    category: 'runner'
                },
                proxy: {
                    id: 'qtiTestReviewProxy',
                    module: 'taoReview/review/proxy/qtiTestReviewProxy',
                    bundle: 'taoReview/loader/qtiReview.min',
                    category: 'proxy'
                },
                communicator: {
                    id: 'request',
                    module: 'core/communicator/request',
                    bundle: 'loader/vendor.min',
                    category: 'communicator'
                },
                plugins: config.plugins || []
            },
            options: {
                readOnly: true,
                plugins: config.pluginsOptions
            }
        };

        //extra context config
        testRunnerConfig.loadFromBundle = !!context.bundle;

        return runnerComponentFactory(container, testRunnerConfig, template || runnerTpl)
            .on('render', function() {
                const {fullPage, readOnly} = this.getConfig().options;
                this.setState('fullpage', fullPage);
                this.setState('readonly', readOnly);
            })
            .on('ready', function(runner) {
                runner.on('destroy', () => {
                    this.destroy();
                });
            });
    };
});
