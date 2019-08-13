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
    'lodash',
    'i18n',
    'ui/component',
    'ui/tabs',
    'util/capitalize',
    'tpl!taoReview/review/plugins/content/item-answer/tpl/item-answer',
    'css!taoReview/review/plugins/content/item-answer/css/item-answer'
], function (
    _,
    __,
    componentFactory,
    tabsFactory,
    capitalize,
    componentTpl
) {
    'use strict';

    /**
     * @typedef {Object} itemAnswerConfig - The config for the item answer component.
     * @property {String} [skippedText] - The text displayed when the item has the status "skipped"
     * @property {String} [status] - The status of the item from the list ['correct', 'incorrect', 'skipped', 'informational']
     * @property {String} [score] - The student's score on the item
     */

    /**
     * Some default config
     * @type {itemAnswerConfig}
     */
    const defaults = {
        skippedText: __('No response'),
        status: 'informational',
        score: ''
    };

    /**
     * Defines the tab containing correct response
     * @type {tabConfig}
     */
    const correctTab = {
        name: 'correct',
        label: __('Correct response')
    };

    /**
     * Defines the tab containing student response when correct
     * @type {tabConfig}
     */
    const answerCorrectTab = {
        name: 'answer',
        label: __('Your response'),
        icon: 'result-ok',
        cls: 'correct'
    };

    /**
     * Defines the tab containing student response when incorrect
     * @type {tabConfig}
     */
    const answerIncorrectTab = {
        name: 'answer',
        label: __('Your response'),
        icon: 'result-nok',
        cls: 'incorrect'
    };

    /**
     * Defines the tab containing student response when incorrect
     * @type {tabConfig}
     */
    const informationalTab = {
        name: 'answer',
        label: __('Informational item'),
        icon: 'info',
        cls: 'informational'
    };

    /**
     * Defines tabs by status
     * @type {Object}
     */
    const tabsByStatus = {
        correct: [answerCorrectTab],
        incorrect: [answerIncorrectTab, correctTab],
        skipped: [answerIncorrectTab, correctTab],
        informational: [informationalTab]
    };

    /**
     * List of possible states
     * @type {String[]}
     */
    const states = ['correct', 'incorrect', 'skipped', 'informational'];

    /**
     * Builds a component that shows up the item status regarding the responses.
     * States:
     * - correct - Whether or not the item got correct responses
     * - skipped - Whether or not the item has been skipped. This option only matters if `correct` is set.
     * - informational - Whether or not the item is informational. If so, the component won't display anything.
     *
     * @example
     *  const container = $();
     *  const config = {
     *      // ...
     *  };
     *  const component = itemAnswerFactory(container, config)
     *      .on('ready', function onComponentReady() {
     *          // ...
     *      });
     *
     * @param {HTMLElement|String} container
     * @param {itemAnswerConfig} config - The config for the item answer component.
     * @param {String} [config.skippedText] - The text displayed when the item has the status "skipped"
     * @param {String} [config.status] - The status of the item from the list ['correct', 'incorrect', 'skipped', 'informational']
     * @param {String} [config.score] - The student's score on the item
     * @returns {itemAnswerComponent}
     * @fires ready - When the component is ready to work
     * @fires statuschange - Each time the status is changed, the status being given as parameter
     * @fires tabchange - Each time a tab is activated, the name being given as parameter
     */
    function itemAnswerFactory(container, config) {
        let controls = null;
        let tabName = 'answer';

        const api = {
            /**
             * Gets the defined item score
             * @returns {String}
             */
            getScore() {
                return this.getConfig().score;
            },

            /**
             * Defines the item score
             * @param {String} score
             * @returns {itemAnswerComponent}
             */
            setScore(score) {
                this.getConfig().score = score;

                if (this.is('rendered')) {
                    controls.$score.text(score);
                }

                return this;
            },

            /**
             * Gets the item status
             * @returns {String}
             */
            getStatus() {
                return this.getConfig().status;
            },

            /**
             * Defines the item status
             * @param {String} status
             * @returns {itemAnswerComponent}
             * @fires statuschange
             */
            setStatus(status) {
                this.getConfig().status = status;

                // reflect the state onto the component
                states.forEach(state => this.setState(state, status === state));

                /**
                 * @event statuschange
                 * @param {String} status
                 */
                this.trigger('statuschange', status);
                return this;
            },

            /**
             * Gets the name of the active tab
             * @returns {String}
             */
            getActiveTab() {
                return tabName;
            },

            /**
             * Tells if the item got correct responses
             * @returns {Boolean}
             */
            isCorrect() {
                return this.is('correct');
            },

            /**
             * Tells if the item got skipped
             * @returns {Boolean}
             */
            isSkipped() {
                return this.is('skipped') && !this.isCorrect();
            },

            /**
             * Tells if the item is informational
             * @returns {Boolean}
             */
            isInformational() {
                return this.is('informational');
            },

            /**
             * Defines the item as correct
             * @returns {itemAnswerComponent}
             */
            setCorrect() {
                return this.setStatus('correct');
            },

            /**
             * Defines the item as incorrect
             * @returns {itemAnswerComponent}
             */
            setIncorrect() {
                return this.setStatus('incorrect');
            },

            /**
             * Defines the item as incorrect and skipped
             * @returns {itemAnswerComponent}
             */
            setSkipped() {
                return this.setStatus('skipped');
            },

            /**
             * Defines the item as informational
             * @returns {itemAnswerComponent}
             */
            setInformational() {
                return this.setStatus('informational');
            }
        };

        /**
         * @typedef {component} itemAnswerComponent
         */
        const itemAnswer = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(componentTpl)

            // auto render on init
            .on('init', function onItemAnswerInit() {
                // auto render on init (defer the call to give a chance to the init event to be completed before)
                _.defer(() => this.render(container));
            })

            // renders the component
            .on('render', function onItemAnswerRender() {
                controls = {
                    $tabs: this.getElement().find('.item-answer-tabs'),
                    $score: this.getElement().find('.item-answer-score'),
                    $status: this.getElement().find('.item-answer-status')
                };

                const tabs = tabsFactory(controls.$tabs, {
                    activeTab: this.getActiveTab(),
                    tabs: tabsByStatus[this.getStatus()]
                })
                    .on('tabchange', name => {
                        tabName = name;

                        /**
                         * @event tabchange
                         * @param {String} name
                         */
                        this.trigger('tabchange', name);
                    })
                    .on('ready', () => {
                        /**
                         * @event ready
                         */
                        this.setState('ready', true)
                            .trigger('ready');
                    });

                this
                    .on('statuschange', status => {
                        tabs.setTabs(tabsByStatus[status]);
                        if (this.is('disabled')) {
                            tabs.disable();
                        }

                        controls.$status.text(status === 'skipped' ? this.getConfig().skippedText : '');
                    })
                    .on('disable', () => tabs.disable())
                    .on('enable', () => tabs.enable())
                    .on('destroy', () => {
                        tabs.destroy();
                    });

                // make sure the status is properly set on init
                const statusInit = `set${capitalize(this.getConfig().status)}`;
                if ('function' === typeof this[statusInit]) {
                    this[statusInit]();
                }
            })

            // free resources on dispose
            .on('destroy', function onItemAnswerDestroy() {
                controls = null;
            });

        // initialize the component with the provided config
        // defer the call to allow to listen to the init event
        _.defer(() => itemAnswer.init(config));

        return itemAnswer;
    }

    return itemAnswerFactory;
});
