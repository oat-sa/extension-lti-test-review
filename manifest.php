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

use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\user\TaoRoles;
use oat\taoLti\models\classes\LtiRoles;
use oat\taoReview\controller\Review;
use oat\taoReview\controller\ReviewTool;
use oat\taoReview\scripts\update\Updater;

return [
    'name' => 'taoReview',
    'label' => 'Review',
    'description' => 'Extension for reviewing passed tests, with the display of actual and correct answers.',
    'license' => 'GPL-2.0',
    'version' => '0.2.0',
    'author' => 'Open Assessment Technologies SA',
    'requires' => [
        'tao' => '*',
        'taoLti' => '*'
    ],
    'managementRole' => 'http://www.tao.lu/Ontologies/generis.rdf#taoReviewManager',
    'acl' => [
        [AccessRule::GRANT, 'http://www.tao.lu/Ontologies/generis.rdf#taoReviewManager', ['ext' => 'taoReview']],
        [AccessRule::GRANT, TaoRoles::ANONYMOUS, ReviewTool::class],
        [AccessRule::GRANT, LtiRoles::CONTEXT_LEARNER, Review::class],
    ],
    'install' => [
        'php' => []
    ],
    'uninstall' => [],
    'update' => Updater::class,
    'routes' => [
        '/taoReview' => 'oat\\taoReview\\controller'
    ],
    'constants' => [
        'DIR_VIEWS' => __DIR__ . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR,
        'BASE_URL' => ROOT_URL . 'taoReview/',
    ]
];
