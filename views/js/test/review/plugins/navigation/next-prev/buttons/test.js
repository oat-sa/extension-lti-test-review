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
    'i18n',
    'ltiTestReview/review/plugins/navigation/next-prev/buttons',
], function (
    $,
    _,
    __,
    nextPrevButtonsFactory
) {
    'use strict';

    function getInstance(fixture, config = {}) {
        return nextPrevButtonsFactory(fixture, config)
            .on('ready', function () {
                this.destroy();
            });
    }

    QUnit.module('Factory');

    QUnit.test('module', assert => {
        const fixture = '#fixture-api';
        assert.expect(3);
        assert.equal(typeof nextPrevButtonsFactory, 'function', 'The module exposes a function');
        assert.equal(typeof getInstance(fixture), 'object', 'The factory produces an object');
        assert.notStrictEqual(getInstance(fixture), getInstance(fixture), 'The factory provides a different object on each call');
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'destroy'},
        {title: 'render'},
        {title: 'setSize'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'},
        {title: 'is'},
        {title: 'setState'},
        {title: 'getContainer'},
        {title: 'getElement'},
        {title: 'getTemplate'},
        {title: 'setTemplate'},
        {title: 'getConfig'}
    ]).test('inherited API', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });


    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.cases.init([
        {title: 'disableButton'},
        {title: 'enableButton'},
        {title: 'toggleButton'}
    ]).test('component API ', (data, assert) => {
        const instance = getInstance('#fixture-api');
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('Life cycle');

    QUnit.test('init ', assert => {
        const ready = assert.async();
        const $container = $('#fixture-init');

        assert.expect(2);
        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                instance.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.cases.init([{
        title: 'default',
        expected: [{
            title: __('Go to the previous item'),
            icon: 'left',
            control: 'prev',
        }, {
            title: __('Go to the next item'),
            cls: 'right',
            icon: 'right',
            text: __('Next'),
            control: 'next',
        }]
    }, {
        title: 'custom buttons',
        config: {
            buttons: [{
                title: 'BTN1',
                icon: 'left',
                control: 'btn1',
            }, {
                text: 'Btn 2',
                control: 'btn2',
            }, {
                title: 'BTN3',
                cls: 'right',
                icon: 'right',
                text: 'Btn 3',
                control: 'btn3',
            }]
        },
        expected: [{
            title: 'BTN1',
            icon: 'left',
            control: 'btn1',
        }, {
            text: 'Btn 2',
            control: 'btn2',
        }, {
            title: 'BTN3',
            cls: 'right',
            icon: 'right',
            text: 'Btn 3',
            control: 'btn3',
        }]
    }]).test('render ', (data, assert) => {
        const ready = assert.async();
        const $container = $('#fixture-render');

        assert.expect(6 + data.expected.length * 5);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container, data.config)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                data.expected.forEach(expected => {
                    assert.equal($container.find(`[data-control="${expected.control}"]`).length, 1, `The control ${expected.control} is rendered`);
                    if (expected.title) {
                        assert.equal($container.find(`[data-control="${expected.control}"]`).attr('title'), expected.title, `The control ${expected.control} has the expected title`);
                    } else {
                        assert.equal($container.find(`[data-control="${expected.control}"]`).attr('title'), '', `The control ${expected.control} has no title`);
                    }
                    if (expected.icon) {
                        assert.equal($container.find(`[data-control="${expected.control}"] .icon`).is(`.icon-${expected.icon}`), true, `The control ${expected.control} has the expected icon`);
                    } else {
                        assert.equal($container.find(`[data-control="${expected.control}"] .icon`).length, 0, `The control ${expected.control} has no icon`);
                    }
                    if (expected.text) {
                        assert.equal($container.find(`[data-control="${expected.control}"] .label`).text().trim(), expected.text, `The control ${expected.control} has the expected text`);
                    } else {
                        assert.equal($container.find(`[data-control="${expected.control}"] .label`).length, 0, `The control ${expected.control} has no text`);
                    }
                    if (expected.cls) {
                        assert.equal($container.find(`[data-control="${expected.control}"]`).is(`.${expected.cls}`), true, `The control ${expected.control} has the expected class`);
                    } else {
                        assert.equal($container.find(`[data-control="${expected.control}"]`).is(`.action`), true, `The control ${expected.control} has the expected class`);
                    }
                });

                instance.destroy();
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('destroy', assert => {
        const ready = assert.async();
        const $container = $('#fixture-destroy');

        assert.expect(10);

        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');
                assert.equal($container.find('[data-control]').length, 2, 'The buttons are rendered');

                instance.destroy();
            })
            .after('destroy', () => {
                assert.equal($container.children().length, 0, 'The container is now empty');
                assert.ok(!instance.is('ready'), 'The component is not ready anymore');
                assert.ok(!instance.is('render'), 'The component is not rendered anymore');
                ready();
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('show/hide', assert => {
        const ready = assert.async();
        const $container = $('#fixture-hide');

        assert.expect(16);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                assert.equal($container.find('[data-control]:visible').length, 2, 'The buttons are rendered and visible');
                assert.equal($container.find('.next-prev:visible').length, 1, 'The component is visible');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('hide.test', () => {
                                assert.ok(true, 'The hide event is emitted');
                                resolve();
                            })
                            .hide();
                    }))
                    .then(() => {
                        assert.ok(instance.is('hidden'), 'The component is hidden');
                        assert.equal($container.find('[data-control]:visible').length, 0, 'The buttons are hidden');
                        assert.equal($container.find('.next-prev:visible').length, 0, 'The component is hidden');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('show.test', () => {
                                assert.ok(true, 'The show event is emitted');
                                resolve();
                            })
                            .show();
                    }))
                    .then(() => {
                        assert.ok(!instance.is('hidden'), 'The component is visible');
                        assert.equal($container.find('[data-control]:visible').length, 2, 'The buttons are visible');
                        assert.equal($container.find('.next-prev:visible').length, 1, 'The component is visible');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('enable/disable', assert => {
        const ready = assert.async();
        const $container = $('#fixture-disable');

        assert.expect(16);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                assert.equal($container.find('[data-control]:enabled').length, 2, 'The buttons are rendered and enabled');
                assert.equal($container.find('.next-prev').is('.disabled'), false, 'The component is enabled');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable.test', () => {
                                assert.ok(true, 'The disable event is emitted');
                                resolve();
                            })
                            .disable();
                    }))
                    .then(() => {
                        assert.ok(instance.is('disabled'), 'The component is disabled');
                        assert.equal($container.find('[data-control]:enabled').length, 0, 'The buttons are disabled');
                        assert.equal($container.find('.next-prev').is('.disabled'), true, 'The component is disabled');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('enable.test', () => {
                                assert.ok(true, 'The enable event is emitted');
                                resolve();
                            })
                            .enable();
                    }))
                    .then(() => {
                        assert.ok(!instance.is('disabled'), 'The component is enabled');
                        assert.equal($container.find('[data-control]:enabled').length, 2, 'The buttons are enabled');
                        assert.equal($container.find('.next-prev').is('.disabled'), false, 'The component is enabled');
                    })
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('toggle buttons', assert => {
        const ready = assert.async();
        const $container = $('#fixture-toggle');

        assert.expect(15);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                assert.equal($container.find('[data-control]:enabled').length, 2, 'The buttons are rendered and enabled');
                assert.equal($container.find('.next-prev').is('.disabled'), false, 'The component is enabled');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable-button.test', control => {
                                assert.equal(control, 'prev', `The disable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .disableButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        assert.equal($container.find('[data-control]:enabled').length, 1, 'Only one button is enabled');
                        instance
                            .off('.test')
                            .on('enable-button.test', control => {
                                assert.equal(control, 'prev', `The enable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .toggleButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('enable-button.test', control => {
                                assert.equal(control, 'prev', `The enable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .toggleButton('prev', true);
                    }))
                    .then(() => new Promise(resolve => {
                        assert.equal($container.find('[data-control]:enabled').length, 2, 'All buttons are enabled');
                        instance
                            .off('.test')
                            .on('disable-button.test', control => {
                                assert.equal(control, 'prev', `The disable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .toggleButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable-button.test', control => {
                                assert.equal(control, 'prev', `The disable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .toggleButton('prev', false);
                    }))
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.module('API');

    QUnit.test('click', assert => {
        const ready = assert.async();
        const $container = $('#fixture-click');

        assert.expect(8);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'prev', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="prev"]').click();
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'next', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="next"]').click();
                    }))
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('click disabled button', assert => {
        const ready = assert.async();
        const $container = $('#fixture-click-disabled-button');

        assert.expect(11);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'prev', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="prev"]').click();
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable-button.test', control => {
                                assert.equal(control, 'prev', `The disable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .disableButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', () => {
                                assert.ok(false, 'The click event should not be emitted');
                            });
                        $container.find('[data-control="prev"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'next', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="next"]').click();
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('enable-button.test', control => {
                                assert.equal(control, 'prev', `The enable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .enableButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'prev', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="prev"]').click();
                    }))
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.test('click disabled component', assert => {
        const ready = assert.async();
        const $container = $('#fixture-click-disabled-component');

        assert.expect(17);
        assert.equal($container.children().length, 0, 'The container is empty');

        const instance = nextPrevButtonsFactory($container)
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.ok(instance.is('ready'), 'The component is ready');
                assert.ok(instance.is('rendered'), 'The component is rendered');
                assert.equal($container.children().length, 1, 'The container contains an element');
                assert.equal($container.find('.next-prev').length, 1, 'The content area is rendered');

                Promise
                    .resolve()
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'prev', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="prev"]').click();
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable-button.test', control => {
                                assert.equal(control, 'prev', `The disable-button event is emitted for the ${control} action`);
                                resolve();
                            })
                            .disableButton('prev');
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', () => {
                                assert.ok(false, 'The click event should not be emitted');
                            });
                        $container.find('[data-control="prev"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('disable.test', () => {
                                assert.ok(true, 'The disable event is emitted');
                                resolve();
                            })
                            .disable();
                    }))
                    .then(() => {
                        assert.ok(instance.is('disabled'), 'The component is disabled');
                        assert.equal($container.find('[data-control]:enabled').length, 0, 'The buttons are disabled');
                        assert.equal($container.find('.next-prev').is('.disabled'), true, 'The component is disabled');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', () => {
                                assert.ok(false, 'The click event should not be emitted');
                            });
                        $container.find('[data-control="next"]').click();
                        $container.find('[data-control="prev"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('enable.test', () => {
                                assert.ok(true, 'The enable event is emitted');
                                resolve();
                            })
                            .enable();
                    }))
                    .then(() => {
                        assert.ok(!instance.is('disabled'), 'The component is enabled');
                        assert.equal($container.find('[data-control]:enabled').length, 1, 'The buttons are enabled');
                        assert.equal($container.find('.next-prev').is('.disabled'), false, 'The component is enabled');
                    })
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', () => {
                                assert.ok(false, 'The click event should not be emitted');
                            });
                        $container.find('[data-control="prev"]').click();
                        window.setTimeout(resolve, 300);
                    }))
                    .then(() => new Promise(resolve => {
                        instance
                            .off('.test')
                            .on('click.test', control => {
                                assert.equal(control, 'next', `The click event is emitted for the ${control} action`);
                                resolve();
                            });
                        $container.find('[data-control="next"]').click();
                    }))
                    .catch(err => {
                        assert.pushResult({
                            result: false,
                            message: err
                        });
                    })
                    .then(() => instance.destroy());
            })
            .on('destroy', () => ready())
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

    QUnit.module('Visual');

    QUnit.test('Visual test', assert => {
        const ready = assert.async();
        const $container = $('#visual-test .panel');
        const $item = $('#visual-test .item');
        const instance = nextPrevButtonsFactory($container);
        const minPosition = 0;
        const maxPosition = 2;
        let position = 0;
        const showItem = () => {
            $item.html(`<h1>Item #${position}</h1>`);
        };
        assert.expect(3);

        assert.equal($container.children().length, 0, 'The container is empty');

        instance
            .on('init', function () {
                assert.equal(this, instance, 'The instance has been initialized');
            })
            .on('ready', () => {
                assert.equal($container.children().length, 1, 'The container contains an element');

                instance.disableButton('prev');
                showItem();

                ready();
            })
            .on('click', id => {
                if (id === 'prev') {
                    position --;
                } else if (id === 'next') {
                    position ++;
                }
                if (position <= minPosition) {
                    position = minPosition;
                }
                if (position >= maxPosition) {
                    position = maxPosition;
                }
                instance.toggleButton('prev', position > minPosition);
                instance.toggleButton('next', position < maxPosition);
                showItem();
            })
            .on('error', err => {
                assert.pushResult({
                    result: false,
                    message: err
                });
                ready();
            });
    });

});
