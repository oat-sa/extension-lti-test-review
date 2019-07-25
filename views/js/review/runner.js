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
 * Copyright (c) 2018-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Component that embeds the QTI previewer for tests and items
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'ui/feedback',
    'taoTests/runner/runnerComponent',
    'tpl!taoReview/review/runner'
], function (_, feedback, runnerComponentFactory, runnerTpl) {
    'use strict';

    /**
     * Builds a test runner to review test
     * @param {jQuery|HTMLElement|String} container - The container in which renders the component
     * @param {Object}   config - The testRunner options
     * @param {Object[]} [config.providers] - A collection of providers to load.
     * @param {Boolean} [config.replace] - When the component is appended to its container, clears the place before
     * @param {Number|String} [config.width] - The width in pixels, or 'auto' to use the container's width
     * @param {Number|String} [config.height] - The height in pixels, or 'auto' to use the container's height
     * @param {Boolean} [config.options.fullPage] - Force the previewer to occupy the full window.
     * @param {Booleanh} [config.options.readOnly] - Do not allow to modify the previewed item.
     * @param {Function} [template] - An optional template for the component
     * @returns {previewer}
     */
    return function reviewFactory(container, config = {}, template = null) {
        const defaultPlugins = [{
            module: 'taoReview/review/plugins/navigation/next-prev-review/next-prev-review',
            bundle: 'taoReview/loader/qtiReview.min',
            category: 'navigation'
        }];

        return runnerComponentFactory(container, config, template || runnerTpl)
            .on('render', function() {
                const {fullPage, readOnly} = this.getConfig().options;
                this.setState('fullpage', fullPage);
                this.setState('readonly', readOnly);
            })
            .on('ready', function(runner) {
                // const loadItem = () => {
                //     const context = runner.getTestContext();
                //     const testUri = { itemDefinition: items[context.itemPosition].itemDefinition};
                //     Object.assign(testUri, config.testUri);
                //     runner.loadItem(testUri);
                // };
                // loadItem(); // temporarily to load first item, see taoQtiTestPreviewer/views/js/previewer/provider/item/item.js 163
                // runner.on('move', function(direction){
                //     const context = runner.getTestContext();
                //     const testMap = runner.getTestMap();
                //     let nextItemPosition;
                //     if(direction === 'next') {
                //         nextItemPosition = context.itemPosition + 1;
                //     }
                //     if(direction === 'previous') {
                //         nextItemPosition = context.itemPosition - 1;
                //     }

                //     runner.on('unloaditem', () => {
                //         runner.off('unloaditem');
                //         context.itemPosition = nextItemPosition;
                //         context.itemIdentifier = testMap.jumps[nextItemPosition].identifier;
                //         runner.setTestContext(context);
                //         loadItem();
                //     });

                //     runner.unloadItem(context.itemIdentifier);

                // });
                // runner.spread(this, 'destroy');
                // runner.spread(this, 'error');
                runner.on('destroy', () => {
                    this.destroy();
                 });
            })
            .on('error', err => {
                console.error(err);
                if (err && err.message) {
                    feedback().error(err.message);
                }
            } );
    };
});
