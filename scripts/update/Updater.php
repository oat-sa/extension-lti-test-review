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

namespace oat\taoReview\scripts\update;

use common_ext_ExtensionUpdater;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\user\TaoRoles;
use oat\taoLti\models\classes\LtiRoles;
use oat\taoReview\controller\Review;
use oat\taoReview\controller\ReviewTool;

/**
 * Class Updater for updating the extension
 * @package oat\taoReview\scripts\update
 */
class Updater extends common_ext_ExtensionUpdater
{
    /**
     * @param $initialVersion
     *
     * @return string|void
     */
    public function update($initialVersion)
    {
        if ($this->isVersion('0.1.0')) {

            AclProxy::applyRule(new AccessRule(AccessRule::GRANT,
                'http://www.tao.lu/Ontologies/generis.rdf#taoReviewManager', ['ext' => 'taoReview']));
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, TaoRoles::ANONYMOUS, ReviewTool::class));
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, LtiRoles::CONTEXT_LEARNER, Review::class));


            $this->setVersion('0.2.0');
        }

    }
}
