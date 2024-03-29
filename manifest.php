<?php
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

use oat\ltiTestReview\controller\Review;
use oat\ltiTestReview\controller\ReviewTool;
use oat\ltiTestReview\scripts\update\Updater;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\user\TaoRoles;
use oat\taoLti\models\classes\LtiRoles;

return [
    'name' => 'ltiTestReview',
    'label' => 'Test Review',
    'description' => 'Extension for reviewing passed tests, with the display of actual and correct answers.',
    'license' => 'GPL-2.0',
    'author' => 'Open Assessment Technologies SA',
    'managementRole' => 'http://www.tao.lu/Ontologies/generis.rdf#ltiTestReviewManager',
    'acl' => [
        [AccessRule::GRANT, 'http://www.tao.lu/Ontologies/generis.rdf#ltiTestReviewManager', ['ext' => 'ltiTestReview']],
        [AccessRule::GRANT, TaoRoles::ANONYMOUS, ReviewTool::class],
        [AccessRule::GRANT, LtiRoles::CONTEXT_LEARNER, Review::class],
        [AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_LEARNER, Review::class],
        [AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_INSTRUCTOR, Review::class],
        [AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_MENTOR, Review::class]
    ],
    'install' => [
        'php' => [],
    ],
    'uninstall' => [],
    'update' => Updater::class,
    'routes' => [
        '/ltiTestReview' => 'oat\\ltiTestReview\\controller',
    ],
    'constants' => [
        'DIR_VIEWS' => __DIR__ . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR,
        'BASE_URL' => ROOT_URL . 'ltiTestReview/',
    ],
];
