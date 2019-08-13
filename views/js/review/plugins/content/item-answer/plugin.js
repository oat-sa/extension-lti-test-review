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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'core/promiseTimeout',
    'taoTests/runner/plugin',
    'taoReview/review/plugins/content/item-answer/item-answer'
], function (
    promiseTimeout,
    pluginFactory,
    itemAnswerFactory
) {
    'use strict';

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
         */
        render() {
            return promiseTimeout(new Promise(resolve => {
                const testRunner = this.getTestRunner();
                const itemAnswer = itemAnswerFactory(this.getAreaBroker().getArea('itemTool'));

                // control the test runner from the review panel
                itemAnswer
                    .on('tabchange', name => {})
                    .on('ready', resolve);

                // reflect the test runner state to the review panel
                testRunner
                    .on('loaditem', itemRef => {})
                    .on(`plugin-show.${this.getName()}`, () => itemAnswer.show())
                    .on(`plugin-hide.${this.getName()}`, () => itemAnswer.hide())
                    .on(`plugin-enable.${this.getName()}`, () => itemAnswer.enable())
                    .on(`plugin-disable.${this.getName()}`, () => itemAnswer.disable())
                    .on(`plugin-destroy.${this.getName()}`, () => itemAnswer.destroy());
            }));
        }
    });
});
