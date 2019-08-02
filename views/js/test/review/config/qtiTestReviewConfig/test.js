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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([

    'lodash',
    'util/url',
    'taoReview/review/config/qtiTestReviewConfig'
], function(_, urlUtil, reviewConfig) {
    'use strict';

    QUnit.module('review Config');

    QUnit.test('module', function(assert) {
        var config = {
            serviceCallId: 'foo'
        };

        assert.expect(3);
        assert.equal(typeof reviewConfig, 'function', 'The reviewConfig module exposes a function');
        assert.equal(typeof reviewConfig(config), 'object', 'The reviewConfig factory produces an instance');
        assert.notStrictEqual(reviewConfig(config), reviewConfig(config), 'The reviewConfig factory provides a different instance on each call');
    });

    QUnit
        .cases.init([
            {title: 'getParameters'},
            {title: 'getServiceCallId'},
            {title: 'getServiceController'},
            {title: 'getServiceExtension'},
            {title: 'getTestActionUrl'},
            {title: 'getItemActionUrl'},
            {title: 'getTimeout'},
            {title: 'getCommunicationConfig'}
        ])
        .test('proxy API ', function(data, assert) {
            var instance = reviewConfig({
                serviceCallId: 'foo'
            });

            assert.expect(1);

            assert.equal(typeof instance[data.title], 'function', 'The reviewConfig instances expose a "' + data.title + '" function');
        });

    QUnit.test('reviewConfig factory', function(assert) {
        assert.expect(1);

        reviewConfig({
            serviceCallId: 'foo'
        });
        assert.ok(true, 'The reviewConfig() factory must not throw an exception when all the required config entries are provided');
    });

    QUnit
        .cases.init([{
            title: 'No item identifier',
            config: {
                serviceCallId: 'http://tao.rdf/1234#56789'
            },
            expected: {
                serviceCallId: 'http://tao.rdf/1234#56789'
            }
        }, {
            title: 'Standard item identifier',
            config: {
                serviceCallId: 'http://tao.rdf/1234#56789'
            },
            itemId: 'http://tao.rdf/item#123',
            expected: {
                serviceCallId: 'http://tao.rdf/1234#56789',
                itemUri: 'http://tao.rdf/item#123'
            }
        }, {
            title: 'Structured item identifier',
            config: {
                serviceCallId: 'http://tao.rdf/1234#56789'
            },
            itemId: {
                resultId: 'http://tao.rdf/result#123',
                itemDefinition: 'http://tao.rdf/item#123',
                deliveryUri: 'http://tao.rdf/delivery#123'
            },
            expected: {
                serviceCallId: 'http://tao.rdf/1234#56789',
                resultId: 'http://tao.rdf/result#123',
                itemDefinition: 'http://tao.rdf/item#123',
                deliveryUri: 'http://tao.rdf/delivery#123'
            }
        }])
        .test('reviewConfig.getParameters', function(data, assert) {
            var instance = reviewConfig(data.config);

            assert.expect(1);

            assert.deepEqual(instance.getParameters(data.itemId), data.expected, 'The reviewConfig.getParameters() method has returned the expected value');
        });

    QUnit
        .cases.init([
            {title: 'number', itemId: 10},
            {title: 'boolean', itemId: true},
            {title: 'array', itemId: [1, 2, 3]}
        ])
        .test('reviewConfig.getParameters#error', function(data, assert) {
            var expectedServiceCallId = 'http://tao.rdf/1234#56789';
            var config = {
                serviceCallId: expectedServiceCallId
            };
            var instance = reviewConfig(config);

            assert.expect(1);

            assert.throws(function() {
                instance.getParameters(data.itemId);
            }, 'The reviewConfig.getParameters() method should throw an error if the parameter does not have the right type');
        });

    QUnit.test('reviewConfig.getServiceCallId', function(assert) {
        var expectedServiceCallId = 'http://tao.rdf/1234#56789';
        var config = {
            serviceCallId: expectedServiceCallId
        };
        var instance = reviewConfig(config);

        assert.expect(1);

        assert.equal(instance.getServiceCallId(), expectedServiceCallId, 'The reviewConfig.getServiceCallId() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getServiceController', function(assert) {
        var expectedServiceController = 'MockRunner';
        var config = {
            serviceCallId: 'foo'
        };
        var instance = reviewConfig(config);

        assert.expect(3);

        assert.notEqual(instance.getServiceController(), expectedServiceController, 'The reviewConfig.getServiceController() method must return the default value');
        assert.ok(!!instance.getServiceController(), 'The reviewConfig.getServiceController() method must not return a null value');

        config.bootstrap = {
            serviceController: expectedServiceController
        };
        instance = reviewConfig(config);
        assert.equal(instance.getServiceController(), expectedServiceController, 'The reviewConfig.getServiceController() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getServiceExtension', function(assert) {
        var expectedServiceExtension = 'MockExtension';
        var config = {
            serviceCallId: 'foo'
        };
        var instance = reviewConfig(config);

        assert.expect(3);

        assert.notEqual(instance.getServiceExtension(), expectedServiceExtension, 'The reviewConfig.getServiceExtension() method must return the default value');
        assert.ok(!!instance.getServiceExtension(), 'The reviewConfig.getServiceExtension() method must not return a null value');

        config.bootstrap = {
            serviceExtension: expectedServiceExtension
        };
        instance = reviewConfig(config);
        assert.equal(instance.getServiceExtension(), expectedServiceExtension, 'The reviewConfig.getServiceExtension() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getTestActionUrl', function(assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var expectedUrl = urlUtil.route('action1', config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId
        });
        var expectedUrl2 = urlUtil.route('action2', config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId
        });
        var instance = reviewConfig(config);

        assert.expect(2);

        assert.equal(instance.getTestActionUrl('action1'), expectedUrl, 'The reviewConfig.getTestActionUrl() method has returned the expected value');
        assert.equal(instance.getTestActionUrl('action2'), expectedUrl2, 'The reviewConfig.getTestActionUrl() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getItemActionUrl', function(assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var actionName = 'MockAction';
        var expectedUrl = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemUri: 'item1'
        });
        var expectedUrl2 = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemUri: 'item2'
        });
        var instance = reviewConfig(config);

        assert.expect(2);

        assert.equal(instance.getItemActionUrl('item1', actionName), expectedUrl, 'The reviewConfig.getItemActionUrl() method has returned the expected value');
        assert.equal(instance.getItemActionUrl('item2', actionName), expectedUrl2, 'The reviewConfig.getItemActionUrl() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getTimeout', function(assert) {
        var config = {
            serviceCallId: 'foo'
        };
        var instance = reviewConfig(config);

        assert.expect(2);

        assert.equal(typeof instance.getTimeout(), 'undefined', 'The reviewConfig.getTimeout() method must return an undefined value if no timeout has been set');

        config.timeout = 10;
        instance = reviewConfig(config);
        assert.equal(instance.getTimeout(), 10000, 'The reviewConfig.getTimeout() method has returned the expected value');
    });

    QUnit.test('reviewConfig.getCommunicationConfig', function(assert) {
        var config = {
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var expected = {
            enabled: undefined,
            type: undefined,
            params: {
                service: urlUtil.route(
                    'message',
                    config.bootstrap.serviceController,
                    config.bootstrap.serviceExtension,
                    {
                        serviceCallId: config.serviceCallId
                    }
                ),
                timeout: undefined
            },
            syncActions: []
        };
        var instance = reviewConfig(config);

        assert.expect(3);

        assert.deepEqual(
            instance.getCommunicationConfig(),
            expected,
            'The reviewConfig.getCommunicationConfig() method has returned the default values'
        );

        config.timeout = 10;
        config.bootstrap.communication = {
            controller: 'CommunicationRunner',
            extension: 'CommunicationExtension',
            action: 'message',
            syncActions: ['move', 'skip'],
            service: 'http://my.service.tao/1234',
            enabled: true,
            type: 'foo',
            params: {
                interval: 20
            }
        };
        expected.enabled = true;
        expected.type = 'foo';
        expected.syncActions = config.bootstrap.communication.syncActions;
        expected.params = {
            service: config.bootstrap.communication.service,
            timeout: 10000,
            interval: 20000
        };
        instance = reviewConfig(config);
        assert.deepEqual(
            instance.getCommunicationConfig(),
            expected,
            'The reviewConfig.getCommunicationConfig() method has returned the expected values'
        );

        config.bootstrap.communication.params.timeout = 5;
        expected.params.timeout = 5000;

        instance = reviewConfig(config);
        assert.deepEqual(
            instance.getCommunicationConfig(),
            expected,
            'The reviewConfig.getCommunicationConfig() method has returned the expected values'
        );
    });
});
