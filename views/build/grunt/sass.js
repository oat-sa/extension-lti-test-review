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
 * Configure the extension styles
 * @author Ivan Klimchuk <ivan@taotesting.com>
 */
module.exports = function (grunt) {
    'use strict';

    let sass = grunt.config('sass') || {};
    let watch = grunt.config('watch') || {};
    let notify = grunt.config('notify') || {};
    let root = grunt.option('root') + '/ltiTestReview/views/';

    sass.ltitestreview = {
        options : {},
        files : [{
            expand: true,
            src: root + 'js/**/scss/*.scss',
            rename : function rename(dest, src){
                return src.replace(/scss/g, 'css');
            }
        }]
    };

    watch.ltitestreviewsass = {
        files : [root + 'scss/**/*.scss'],
        tasks : ['sass:ltitestreview', 'notify:ltitestreviewsass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.ltitestreviewsass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    // Register an alias for main build
    grunt.registerTask('ltitestreviewsass', ['sass:ltitestreview']);
};
