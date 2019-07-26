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

namespace oat\taoReview\models;


use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\OntologyService;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoLti\models\classes\LtiVariableMissingException;

/**
 * Find delivery execution
 * @package oat\taoReview\models
 */
class DeliveryExecutionFinderService extends ConfigurableService
{
    public const SERVICE_ID = 'taoReview/DeliveryExecutionFinderService';

    protected const LTI_SOURCE_ID = 'lis_result_sourcedid';

    /**
     * @param LtiLaunchData $data
     *
     * @return DeliveryExecution
     * @throws InvalidServiceManagerException
     * @throws LtiInvalidLaunchDataException
     * @throws LtiVariableMissingException
     */
    public function findDeliveryExecution(LtiLaunchData $data): DeliveryExecution
    {
        /** @var LtiLaunchDataService $launchDataService */
        $launchDataService = $this->getServiceLocator()->get(LtiLaunchDataService::SERVICE_ID);

        /** @var LtiResultAliasStorage $ltiResultIdStorage */
        $ltiResultIdStorage = $this->getServiceLocator()->get(LtiResultAliasStorage::SERVICE_ID);

        $resultIdentifier = !$data->hasVariable(self::LTI_SOURCE_ID)
            ? $data->getVariable(srlf::LTI_SOURCE_ID)
            : $launchDataService->findDeliveryExecutionFromLaunchData($data);

        $deliveryExecutionId = $ltiResultIdStorage->getDeliveryExecutionId($resultIdentifier);

        if ($deliveryExecutionId === null) {
            throw new LtiInvalidLaunchDataException('Wrong result ID provided');
        }

        return $this->getOntologyService()->getDeliveryExecution($deliveryExecutionId);
    }

    /**
     * @return OntologyService
     * @throws InvalidServiceManagerException
     */
    protected function getOntologyService(): OntologyService
    {
        return $this->getServiceManager()->get(ServiceProxy::SERVICE_ID);
    }
}
