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
 * Test runner provider for the QTI item review
 */
define([
    'taoQtiTestPreviewer/previewer/provider/item/item',
    'taoQtiTest/runner/ui/toolbox/toolbox',
    'css!taoReview/review/provider/item/css/item',
    'css!taoQtiTestPreviewer/previewer/provider/item/css/item',
], function (
    qtiItemPreviewer,
    toolboxFactory
) {
    'use strict';

    /**
     * A Test runner provider to be registered against the runner
     */
    const qtiItemReviewer = qtiItemPreviewer;

    //provider name
    qtiItemReviewer.name = 'qtiItemReview';

    qtiItemPreviewer.init = function () {
        const dataHolder = this.getDataHolder();
        const areaBroker = this.getAreaBroker();

        areaBroker.setComponent('toolbox', toolboxFactory());
        areaBroker.getToolbox().init();

        /*
         * Install behavior on events
         */
        this
            .on('ready', () => {
                const itemIdentifier = dataHolder.get('itemIdentifier');
                const itemData = dataHolder.get('itemData');

                if (itemIdentifier) {
                    if (itemData) {
                        this.renderItem(itemIdentifier, itemData);
                    } else {
                        this.loadItem(itemIdentifier);
                    }
                }
            })
            .on('loaditem', (itemRef, itemData) => {
                dataHolder.set('itemIdentifier', itemRef);
                dataHolder.set('itemData', itemData);
            })
            .on('renderitem', () => {
                this.trigger('enabletools enablenav');
            })
            .on('resumeitem', () => {
                this.trigger('enableitem enablenav');
            })
            .on('disableitem', () => {
                this.trigger('disabletools');
            })
            .on('enableitem', () => {
                this.trigger('enabletools');
            })
            .on('error', () => {
                this.trigger('disabletools enablenav');
            })
            .on('finish leave', () => {
                this.trigger('disablenav disabletools');
                this.flush();
            })
            .on('flush', () => {
                this.destroy();
            });

        return this.getProxy()
            .init()
            .then(data => {
                dataHolder.set('itemIdentifier', data.itemIdentifier);
                dataHolder.set('itemData', data.itemData);
                dataHolder.set('testMap', data.testMap);
                dataHolder.set('testContext', data.testContext);
                // dataHolder.set('testData', data.testData);
            });
    };

    return qtiItemReviewer;
});
