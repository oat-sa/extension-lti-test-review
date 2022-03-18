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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'ui/feedback',
    'core/logger',
    'ltiTestReview/review/component/qtiTestReviewComponent'
], function (
    $,
    feedback,
    loggerFactory,
    reviewFactory
) {
    'use strict';

    /**
     * Create a dedicated logger
     */
    const logger = loggerFactory('ltiTestReview/controller');

    /**
     * Controls the ltiTestReview delivery page
     *
     * @type {Object}
     */
    return {
        /**
         * Entry point of the page
         */
        start() {

            const $container = $('.container');
            const { execution, delivery, showScore, showCorrect, displaySectionTitles, displayItemTooltip, reviewLayout } = $container.data();

            reviewFactory($(".content-wrap", document), {
                testUri: {
                    resultId: execution,
                    deliveryUri: delivery
                },
                showScore: !!showScore,
                showCorrect: !!showCorrect,
                displaySectionTitles: !!displaySectionTitles,
                displayItemTooltip: !!displayItemTooltip,
                reviewLayout,
                readOnly: true,
                plugins: [{
                    module: 'ltiTestReview/review/plugins/navigation/review-panel/plugin',
                    bundle: 'ltiTestReview/loader/ltiTestReview.min',
                    category: 'navigation'
                }, {
                    module: 'ltiTestReview/review/plugins/navigation/next-prev/plugin',
                    bundle: 'ltiTestReview/loader/ltiTestReview.min',
                    category: 'navigation'
                }, {
                    module: 'ltiTestReview/review/plugins/content/item-answer/plugin',
                    bundle: 'ltiTestReview/loader/ltiTestReview.min',
                    category: 'content'
                }]
            })
            .on('error', err => {
                logger.error(err);
                if (err && err.message) {
                    feedback().error(err.message);
                }
            } );
        }
    };
});
