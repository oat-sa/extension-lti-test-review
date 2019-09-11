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
 *
 */

namespace oat\ltiTestReview\models;

use oat\oatbox\service\ConfigurableService;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoOutcomeUi\model\Wrapper\ResultServiceWrapper;
use oat\taoProctoring\model\execution\DeliveryExecutionManagerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoResultServer\models\classes\ResultServerService;

class QtiRunnerInitDataBuilderFactory extends ConfigurableService
{
    public const SERVICE_ID = 'ltiTestReview/QtiRunnerInitDataBuilderFactory';

    public function create(): QtiRunnerInitDataBuilder
    {
        $locator = $this->getServiceLocator();

        return new QtiRunnerInitDataBuilder(
            $locator->get(DeliveryContainerService::SERVICE_ID),
            $locator->get(QtiRunnerService::SERVICE_ID),
            $locator->get(DeliveryExecutionManagerService::SERVICE_ID),
            $locator->get(ResultServiceWrapper::SERVICE_ID),
            $locator->get(ResultServerService::SERVICE_ID)
        );
    }
}
