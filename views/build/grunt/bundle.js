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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

/**
 * Configure the extension bundles
 * @author Ivan Klimchuk <ivan@taotesting.com>
 */
module.exports = function(grunt) {
    'use strict';

    grunt.config.merge({
        bundle : {
            ltitestreview : {
                options : {
                    extension : 'ltiTestReview',
                    outputDir : 'loader',
                    dependencies : ['taoItems', 'taoQtiItem', 'taoTests', 'taoQtiTest', 'taoQtiTestPreviewer'],
                    bundles : [{
                        name : 'ltiTestReview',
                        babel : true,
                        include : [
                            'ltiTestReview/review/**/*'
                        ],
                        dependencies : [
                            'taoItems/loader/taoItemsRunner.min',
                            'taoTests/loader/taoTestsRunner.min',
                            'taoQtiItem/loader/taoQtiItemRunner.min',
                            'taoQtiTest/loader/taoQtiTestRunner.min',
                            'taoQtiTest/loader/testPlugins.min',
                            'taoQtiTestPreviewer/loader/qtiPreviewer.min'
                        ]
                    }]
                }
            }
        }
    });

    // bundle task
    grunt.registerTask('ltitestreviewbundle', ['bundle:ltitestreview']);
};
