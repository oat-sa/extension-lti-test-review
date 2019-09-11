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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'util/url',
    'core/communicator',
    'taoTests/runner/proxy',
    'ltiTestReview/review/proxy/qtiTestReviewProxy',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, _, urlUtil, communicatorFactory, proxyFactory, testProxy) {
    'use strict';

    QUnit.module('testProxy');

    // Prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // Restore AJAX method after each test
    QUnit.testDone(() => {
        $.mockjax.clear();
    });

    QUnit.test('module', assert => {
        assert.expect(7);
        assert.equal(typeof testProxy, 'object', 'The testProxy module exposes an object');
        assert.equal(testProxy.name, 'qtiTestReviewProxy', 'The factory has the expected name');
        assert.equal(typeof proxyFactory, 'function', 'The proxyFactory module exposes a function');
        assert.equal(typeof proxyFactory.registerProvider, 'function', 'The proxyFactory module exposes a registerProvider method');
        assert.equal(typeof proxyFactory.getProvider, 'function', 'The proxyFactory module exposes a getProvider method');

        proxyFactory.registerProvider('testProxy', testProxy);

        assert.equal(typeof proxyFactory('testProxy'), 'object', 'The proxyFactory factory has registered the testProxy definition and produces an instance');
        assert.notStrictEqual(proxyFactory('testProxy'), proxyFactory('testProxy'), 'The proxyFactory factory provides a different instance of testProxy on each call');
    });

    QUnit.cases.init([
        {title: 'install'},
        {title: 'init'},
        {title: 'destroy'},
        {title: 'callTestAction'},
        {title: 'getItem'},
        {title: 'callItemAction'}
    ]).test('proxy API ', (data, assert) => {
        assert.expect(1);
        assert.equal(typeof testProxy[data.title], 'function', `The testProxy definition exposes a "${data.title}" function`);
    });

    QUnit.cases.init([{
        title: 'success',
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            success: true
        },
        ajaxSuccess: true,
        success: true
    }, {
        title: 'failing data',
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            errorCode: 1,
            errorMessage: 'oops',
            success: false
        },
        ajaxSuccess: true,
        success: false
    }, {
        title: 'failing request',
        sendToken: '1234',
        receiveToken: '4567',
        response: 'error',
        ajaxSuccess: false,
        success: false
    }]).test('testProxy.init ', (caseData, assert) => {
        const ready = assert.async();
        const initConfig = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        const expectedUrl = urlUtil.route('init', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
            serviceCallId: initConfig.serviceCallId
        });

        assert.expect(7);

        proxyFactory.registerProvider('testProxy', testProxy);

        $.mockjax({
            url: '/*',
            status: caseData.ajaxSuccess ? 200 : 500,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: caseData.response,
            response(settings) {
                assert.equal(settings.url, expectedUrl, 'The proxy has called the right service');
            }
        });

        const proxy = proxyFactory('testProxy', initConfig);
        const tokenHandler = proxy.getTokenHandler();

        proxy
            .install()
            .then(() => tokenHandler.clearStore())
            .then(() => proxy.getTokenHandler().setToken(caseData.sendToken))
            .then(() => {
                proxy.on('init', (promise, config) => {
                    assert.ok(true, 'The proxy has fired the "init" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "init" event');
                    assert.equal(config, initConfig, 'The proxy has provided the config object through the "init" event');
                });

                const result = proxy.init();

                assert.equal(typeof result, 'object', 'The proxy.init method has returned a promise');

                return result;
            })
            .then(data => {
                if (caseData.success) {
                    assert.deepEqual(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
            })
            .catch(err => {
                assert.ok(!caseData.success, `The proxy has thrown an error! #${err}`);
            })
            .then(() => proxy.getTokenHandler().getToken().then(token => {
                assert.equal(token, caseData.receiveToken, 'The proxy must update the security token');
            }))
            .then(ready);
    });

    QUnit.test('testProxy.destroy', assert => {
        const ready = assert.async();
        const initConfig = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        assert.expect(5);

        proxyFactory.registerProvider('testProxy', testProxy);

        $.mockjax([{
            url: '/init*',
            status: 200,
            responseText: {
                success: true
            }
        }, {
            url: '/*',
            status: 500,
            response() {
                assert.ok(false, 'The proxy must not use an ajax request to destroy the instance!');
            }
        }]);

        const proxy = proxyFactory('testProxy', initConfig);
        const tokenHandler = proxy.getTokenHandler();

        proxy.install()
            .then(() => tokenHandler.clearStore())
            .then(() => proxy.init())
            .then(() => {
                proxy.on('destroy', (promise) => {
                    assert.ok(true, 'The proxyFactory has fired the "destroy" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "destroy" event');
                });

                const result = proxy.destroy();

                assert.equal(typeof result, 'object', 'The proxy.destroy method has returned a promise');

                return result;
            })
            .then(() => {
                assert.ok(true, 'The proxy has resolved the promise provided by the "destroy" method!');

                return proxy.getTestContext()
                    .then(() => {
                        assert.ok(false, 'The proxy must be initialized');
                    })
                    .catch(() => {
                        assert.ok(true, 'The proxy must be initialized');
                    });
            })
            .catch(() => {
                assert.ok(false, 'The proxy should not fail!');
            })
            .then(ready);
    });

    QUnit.cases.init([{
        title: 'success',
        sendToken: '1234',
        receiveToken: '4567',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            success: true
        },
        ajaxSuccess: true,
        success: true
    }, {
        title: 'failing data',
        sendToken: '1234',
        receiveToken: '4567',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            errorCode: 1,
            errorMessage: 'oops',
            success: false
        },
        ajaxSuccess: true,
        success: false
    }, {
        title: 'failing request',
        sendToken: '1234',
        receiveToken: '4567',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: 'error',
        ajaxSuccess: false,
        success: false
    }]).test('testProxy.callTestAction ', (caseData, assert) => {
        const ready = assert.async();
        const initConfig = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        const expectedUrl = urlUtil.route(caseData.action, initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
            serviceCallId: initConfig.serviceCallId
        });

        assert.expect(9);

        proxyFactory.registerProvider('testProxy', testProxy);

        $.mockjax([{
            url: '/init*',
            status: 200,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: {
                success: true
            }
        }, {
            url: '/*',
            status: caseData.ajaxSuccess ? 200 : 500,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: caseData.response,
            response(settings) {
                assert.equal(settings.url, expectedUrl, 'The proxy has called the right service');
            }
        }]);

        const proxy = proxyFactory('testProxy', initConfig);
        const tokenHandler = proxy.getTokenHandler();

        proxy
            .install()
            .then(() => tokenHandler.clearStore())
            .then(() => proxy.getTokenHandler().setToken(caseData.sendToken))
            .then(() => proxy.callTestAction(caseData.action, caseData.params))
            .then(() => {
                assert.ok(false, 'The proxy must be initialized');
            })
            .catch(() => {
                assert.ok(true, 'The proxy must be initialized');
            })
            .then(() => proxy.init())
            .then(() => {
                proxy.on('callTestAction', function (promise, action, params) {
                    assert.ok(true, 'The proxy has fired the "callTestAction" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callTestAction" event');
                    assert.equal(action, caseData.action, 'The proxy has provided the action through the "callTestAction" event');
                    assert.deepEqual(params, caseData.params, 'The proxy has provided the params through the "callTestAction" event');
                });

                const result = proxy.callTestAction(caseData.action, caseData.params);

                assert.equal(typeof result, 'object', 'The proxy.callTestAction method has returned a promise');

                return result;
            })
            .then(data => {
                if (caseData.success) {
                    assert.deepEqual(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
            })
            .catch(err => {
                assert.ok(!caseData.success, `The proxy has thrown an error! #${err}`);
            })
            .then(() => proxy.getTokenHandler().getToken().then(token => {
                assert.equal(token, caseData.receiveToken, 'The proxy must update the security token');
            }))
            .then(ready);
    });

    QUnit.cases.init([{
        title: 'success',
        uri: 'http://tao.dev/mockItemDefinition#123',
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            itemData: {
                interactions: [{}]
            },
            itemState: {
                response: [{}]
            },
            success: true
        },
        ajaxSuccess: true,
        success: true
    }, {
        title: 'failing data',
        uri: 'http://tao.dev/mockItemDefinition#123',
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            errorCode: 1,
            errorMessage: 'oops',
            success: false
        },
        ajaxSuccess: true,
        success: false
    }, {
        title: 'failing request',
        uri: 'http://tao.dev/mockItemDefinition#123',
        sendToken: '1234',
        receiveToken: '4567',
        response: 'error',
        ajaxSuccess: false,
        success: false
    }]).test('testProxy.getItem ', (caseData, assert) => {
        const ready = assert.async();
        const initConfig = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        const expectedUrl = urlUtil.route('getItem', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
            serviceCallId: initConfig.serviceCallId,
            itemUri: caseData.uri
        });

        assert.expect(8);

        proxyFactory.registerProvider('testProxy', testProxy);

        $.mockjax([{
            url: '/init*',
            status: 200,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: {
                success: true
            }
        }, {
            url: '/*',
            status: caseData.ajaxSuccess ? 200 : 500,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: caseData.response,
            response(settings) {
                assert.equal(settings.url, expectedUrl, 'The proxy has called the right service');
            }
        }]);

        const proxy = proxyFactory('testProxy', initConfig);
        const tokenHandler = proxy.getTokenHandler();

        proxy
            .install()
            .then(() => tokenHandler.clearStore())
            .then(() => proxy.getTokenHandler().setToken(caseData.sendToken))
            .then(() => proxy.getItem(caseData.uri))
            .then(() => {
                assert.ok(false, 'The proxy must be initialized');
            })
            .catch(() => {
                assert.ok(true, 'The proxy must be initialized');
            })
            .then(() => proxy.init())
            .then(() => {
                proxy.on('getItem', (promise, uri) => {
                    assert.ok(true, 'The proxy has fired the "getItem" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getItem" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "getItem" event');
                });

                const result = proxy.getItem(caseData.uri);

                assert.equal(typeof result, 'object', 'The proxy.getItem method has returned a promise');

                return result;
            })
            .then(data => {
                if (caseData.success) {
                    assert.deepEqual(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
            })
            .catch(err => {
                assert.ok(!caseData.success, `The proxy has thrown an error! #${err}`);
            })
            .then(() => proxy.getTokenHandler().getToken().then(token => {
                assert.equal(token, caseData.receiveToken, 'The proxy must update the security token');
            }))
            .then(ready);
    });

    QUnit.cases.init([{
        title: 'success',
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            success: true
        },
        ajaxSuccess: true,
        success: true
    }, {
        title: 'failing data',
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        sendToken: '1234',
        receiveToken: '4567',
        response: {
            errorCode: 1,
            errorMessage: 'oops',
            success: false
        },
        ajaxSuccess: true,
        success: false
    }, {
        title: 'failing request',
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        sendToken: '1234',
        receiveToken: '4567',
        response: 'error',
        ajaxSuccess: false,
        success: false
    }]).test('testProxy.callItemAction ', (caseData, assert) => {
        const ready = assert.async();
        const initConfig = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        const expectedUrl = urlUtil.route(caseData.action, initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
            serviceCallId: initConfig.serviceCallId,
            itemUri: caseData.uri
        });

        assert.expect(10);

        proxyFactory.registerProvider('testProxy', testProxy);

        $.mockjax([{
            url: '/init*',
            status: 200,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: {
                success: true
            }
        }, {
            url: '/*',
            status: caseData.ajaxSuccess ? 200 : 500,
            headers: {
                'X-CSRF-Token': caseData.receiveToken
            },
            responseText: caseData.response,
            response(settings) {
                assert.equal(settings.url, expectedUrl, 'The proxy has called the right service');
            }
        }]);

        const proxy = proxyFactory('testProxy', initConfig);
        const tokenHandler = proxy.getTokenHandler();

        proxy
            .install()
            .then(() => tokenHandler.clearStore())
            .then(() => proxy.getTokenHandler().setToken(caseData.sendToken))
            .then(() => proxy.callItemAction(caseData.uri, caseData.action, caseData.params))
            .then(() => {
                assert.ok(false, 'The proxy must be initialized');
            })
            .catch(() => {
                assert.ok(true, 'The proxy must be initialized');
            })
            .then(() => proxy.init())
            .then(() => {
                proxy.on('callItemAction', (promise, uri, action, params) => {
                    assert.ok(true, 'The proxy has fired the "callItemAction" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callItemAction" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "callItemAction" event');
                    assert.equal(action, caseData.action, 'The proxy has provided the action through the "callItemAction" event');
                    assert.deepEqual(params, caseData.params, 'The proxy has provided the params through the "callItemAction" event');
                });

                const result = proxy.callItemAction(caseData.uri, caseData.action, caseData.params);

                assert.equal(typeof result, 'object', 'The proxy.callItemAction method has returned a promise');

                return result;
            })
            .then(data => {
                if (caseData.success) {
                    assert.deepEqual(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
            })
            .catch(err => {
                assert.ok(!caseData.success, `The proxy has thrown an error! #${err}`);
            })
            .then(() => proxy.getTokenHandler().getToken().then(token => {
                assert.equal(token, caseData.receiveToken, 'The proxy must update the security token');
            }))
            .then(ready);
    });

});
