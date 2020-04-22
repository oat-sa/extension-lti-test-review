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

namespace oat\ltiTestReview\scripts\update;

use common_Exception;
use common_ext_ExtensionUpdater;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\user\TaoRoles;
use oat\taoLti\models\classes\LtiRoles;
use oat\ltiTestReview\controller\Review;
use oat\ltiTestReview\controller\ReviewTool;
use oat\ltiTestReview\models\DeliveryExecutionFinderService;
use oat\ltiTestReview\models\QtiRunnerInitDataBuilderFactory;
use oat\ltiTestReview\models\QtiRunnerMapBuilderFactory;

/**
 * Class Updater for updating the extension
 * @package oat\ltiTestReview\scripts\update
 */
class Updater extends common_ext_ExtensionUpdater
{
    /**
     * @param $initialVersion
     *
     * @return string|void
     * @throws common_Exception
     */
    public function update($initialVersion)
    {
        if ($this->isVersion('0.1.0')) {

            AclProxy::applyRule(new AccessRule(AccessRule::GRANT,
                'http://www.tao.lu/Ontologies/generis.rdf#ltiTestReviewManager', ['ext' => 'ltiTestReview']));
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, TaoRoles::ANONYMOUS, ReviewTool::class));
            AclProxy::applyRule(new AccessRule(AccessRule::GRANT, LtiRoles::CONTEXT_LEARNER, Review::class));


            $this->setVersion('0.2.0');
        }

        $this->skip('0.2.0', '0.5.0');

        if ($this->isVersion('0.5.0')) {

            $serviceManager = $this->getServiceManager();

            $serviceManager->register(DeliveryExecutionFinderService::SERVICE_ID, new DeliveryExecutionFinderService());
            $serviceManager->register(QtiRunnerInitDataBuilderFactory::SERVICE_ID, new QtiRunnerInitDataBuilderFactory());

            $this->setVersion('0.6.0');
        }

        $this->skip('0.6.0', '1.11.0');

        if ($this->isVersion('1.11.0')) {

            $serviceManager = $this->getServiceManager();

            $serviceManager->register(DeliveryExecutionFinderService::SERVICE_ID, new DeliveryExecutionFinderService([
                DeliveryExecutionFinderService::OPTION_SHOW_CORRECT => false,
                DeliveryExecutionFinderService::OPTION_SHOW_SCORE => false
            ]));

            $this->setVersion('1.12.0');
        }

        $this->skip('1.12.0', '1.15.2');
    }
}
