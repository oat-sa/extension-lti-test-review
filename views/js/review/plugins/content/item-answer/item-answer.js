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
    'tpl!ltiTestReview/review/plugins/content/item-answer/tpl/item-answer',
    'tpl!ltiTestReview/review/plugins/content/item-answer/tpl/answer-tabs',
    'css!ltiTestReview/review/plugins/content/item-answer/css/item-answer'
], function (_, __, componentFactory, tabsFactory, capitalize, itemAnswerTpl, answerTabsTpl) {
    'use strict';

    /**
     * @typedef {Object} itemAnswerConfig - The config for the item answer component.
     * @property {String} [skippedText] - The text displayed when the item has the status "skipped"
     * @property {String} [scoreText] - The text displayed to introduce the score
     * @property {String} [status] - The status of the item from the list ['correct', 'incorrect', 'skipped', 'informational']
     * @property {String} [score] - The student's score on the item
     * @property {Boolean} [showScore] - Show the score
     * @property {Boolean} [showCorrect] - Show the correct responses
     */

    /**
     * Some default config
     * @type {itemAnswerConfig}
     */
    const defaults = {
        skippedText: __('No response'),
        scoreText: __('Your Score:'),
        status: 'informational',
        showScore: true,
        showCorrect: true,
        score: ''
    };

    /**
     * @param {String} status
     * @returns {tabConfig}
     */
    function getAnswerTab(status) {
        let label;
        if (status === 'informational') {
            label = __('Informational item');
        } else {
            label = __('Your response');
        }

        let icon;
        let cls;
        if (status === 'informational') {
            icon = 'informational';
            cls = 'informational';
        } else if (status === 'pending') {
            icon = 'time';
            cls = 'pending';
        } else if (status === 'correct') {
            icon = 'correct';
            cls = 'correct';
        } else if (status === 'incorrect') {
            icon = 'incorrect';
            cls = 'incorrect';
        } else if (status === 'partial') {
            icon = 'score-partial';
            cls = 'partial';
        } else if (status === 'default') {
            icon = 'answered';
            cls = 'answered';
        } else if (status === 'skipped') {
            icon = 'skipped';
            cls = 'skipped';
        } else {
            icon = null;
            cls = null;
        }

        return {
            name: 'answer',
            label,
            icon,
            cls
        };
    }

    /**
     * Defines the tab containing correct response
     * @type {tabConfig}
     */
    const correctTab = {
        name: 'correct',
        label: __('Correct response')
    };

    const informationalTab = getAnswerTab('informational');
    const correctAnswerTab = getAnswerTab('correct');
    const incorrectTab = getAnswerTab('incorrect');
    const partialTab = getAnswerTab('partial');
    const pendingTab = getAnswerTab('pending');
    const noScoreTab = getAnswerTab('no-score');
    const skippedTab = getAnswerTab('skipped');
    const defaultTab = getAnswerTab('default');

    /**
     * Defines tabs by status with correct responses enabled
     * @type {Object}
     */
    const tabsByStatusWithCorrect = {
        informational: [informationalTab],
        correct: [correctAnswerTab, correctTab],
        incorrect: [incorrectTab, correctTab],
        partial: [partialTab, correctTab],
        pending: [pendingTab, correctTab],
        'no-score': [noScoreTab],
        skipped: [skippedTab],
        default: [defaultTab]
    };

    /**
     * Defines tabs by status with correct responses disabled
     * @type {Object}
     */
    const tabsByStatusWithoutCorrect = {
        informational: [informationalTab],
        correct: [correctAnswerTab],
        incorrect: [incorrectTab],
        partial: [partialTab],
        pending: [pendingTab],
        'no-score': [noScoreTab],
        skipped: [skippedTab],
        default: [defaultTab]
    };

    /**
     * List of possible states
     * @type {String[]}
     */
    const states = ['correct', 'incorrect', 'skipped', 'informational', 'partial', 'pending', 'default'];

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
     * @param {String} [config.scoreText] - The text displayed to introduce the score
     * @param {String} [config.status] - The status of the item from the list ['correct', 'incorrect', 'skipped', 'informational']
     * @param {String} [config.score] - The student's score on the item
     * @param {Boolean} [config.showScore] - Show the score
     * @param {Boolean} [config.showCorrect] - Show the correct responses
     * @returns {itemAnswerComponent}
     * @fires ready - When the component is ready to work
     * @fires statuschange - Each time the status is changed, the status being given as parameter
     * @fires tabchange - Each time a tab is activated, the name being given as parameter
     */
    function itemAnswerFactory(container, config) {
        let controls = null;
        let activeTab = 'answer';

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
                if ((!score && 'number' !== typeof score) || !this.getConfig().showScore) {
                    score = '';
                }
                this.getConfig().score = `${score}`;

                if (this.is('rendered')) {
                    const scoreLine =
                        this.getConfig().score && `${this.getConfig().scoreText} ${this.getConfig().score}`;
                    controls.$score.text(scoreLine);
                }

                return this;
            },

            /**
             * If `showScore=false`, is equal to `status=skipped`.
             * If `showScore=true`, can apply to any `status`
             * @returns {Boolean}
             */
            getHasNoAnswer() {
                return this.getConfig().hasNoAnswer;
            },

            /**
             * @param {Boolean} hasNoAnswer
             * @returns {itemAnswerComponent}
             */
            setHasNoAnswer(hasNoAnswer) {
                this.getConfig().hasNoAnswer = hasNoAnswer;

                if (this.is('rendered')) {
                    const activeTab = this.getActiveTab();
                    if (activeTab === 'answer' && hasNoAnswer) {
                        controls.$status.text(this.getConfig().skippedText);
                    } else {
                        controls.$status.text('');
                    }
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
                const change = this.getConfig().status !== status;
                this.getConfig().status = status;

                // reflect the state onto the component
                states.forEach(state => this.setState(state, status === state));

                /**
                 * @event statuschange
                 * @param {String} status - The new status
                 * @param {Boolean} change - If the status actually changed or not
                 */
                this.trigger('statuschange', status, change);
                return this;
            },

            /**
             * Gets the name of the active tab
             * @returns {String}
             */
            getActiveTab() {
                return activeTab;
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
             * Tells if the item is informational
             * @returns {Boolean}
             */
            isPartial() {
                return this.is('partial');
            },

            /**
             * Tells if the item is informational
             * @returns {Boolean}
             */
            isPending() {
                return this.is('pending');
            },

            /**
             * Tells if the item is default
             * @returns {Boolean}
             */
            isDefaultState() {
                return this.is('default');
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
            },

            /**
             * Defines the item as partial
             * @returns {itemAnswerComponent}
             */
            setPartial() {
                return this.setStatus('partial');
            },

            /**
             * Defines the item as pending
             * @returns {itemAnswerComponent}
             */
            setPending() {
                return this.setStatus('pending');
            },

            /**
             * Defines the item as no-score
             * @returns {itemAnswerComponent}
             */
            setNoScore() {
                return this.setStatus('no-score');
            },

            /**
             * Defines the item as default
             * @returns {itemAnswerComponent}
             */
            setDefault() {
                return this.setStatus('default');
            }
        };

        /**
         * @typedef {component} itemAnswerComponent
         */
        const itemAnswer = componentFactory(api, defaults)
            // set the component's layout
            .setTemplate(itemAnswerTpl)

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

                const tabsByStatus = this.getConfig().showCorrect
                    ? tabsByStatusWithCorrect
                    : tabsByStatusWithoutCorrect;
                let tabs = tabsByStatus[this.getStatus()];

                const tabsComponent = tabsFactory(controls.$tabs, { activeTab, tabs })
                    .setTemplate(answerTabsTpl)
                    .on('tabchange', name => {
                        activeTab = name;

                        // status based on status and tab
                        if (name === 'answer' && this.getHasNoAnswer()) {
                            controls.$status.text(this.getConfig().skippedText);
                        } else {
                            controls.$status.text('');
                        }

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
                        this.setState('ready', true).trigger('ready');
                    });

                this.setState('show-score', this.getConfig().showScore)
                    .setState('show-correct', this.getConfig().showCorrect)
                    .on('statuschange', (status, change) => {
                        if (change && tabs !== tabsByStatus[status]) {
                            tabs = tabsByStatus[status];
                            tabsComponent.setTabs(tabs);
                            if (this.is('disabled')) {
                                tabsComponent.disable();
                            }
                        } else {
                            // make sure the tabchange is always triggered
                            tabsComponent.trigger('tabchange', this.getActiveTab());
                        }
                    })
                    .on('disable', () => tabsComponent.disable())
                    .on('enable', () => tabsComponent.enable())
                    .on('destroy', () => {
                        tabsComponent.destroy();
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
