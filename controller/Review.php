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
 *
 */

namespace oat\taoReview\controller;

use common_exception_Error;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\taoLti\models\classes\LtiException;
use oat\taoLti\models\classes\LtiService;
use oat\taoLti\models\classes\LtiVariableMissingException;
use tao_actions_SinglePageModule;

/**
 * Review controller class thar provides data for js-application
 * @package oat\taoReview\controller
 */
class Review extends tao_actions_SinglePageModule
{
    /**
     * @throws LtiException
     * @throws LtiVariableMissingException
     * @throws common_exception_Error
     */
    public function index()
    {
        $launchData = LtiService::singleton()->getLtiSession()->getLaunchData();

        /** @var LtiLaunchDataService $launchDataService */
        $launchDataService = $this->getServiceLocator()->get(LtiLaunchDataService::SERVICE_ID);

        /** @var LtiResultAliasStorage $ltiResultIdStorage */
        $ltiResultIdStorage = $this->getServiceLocator()->get(LtiResultAliasStorage::SERVICE_ID);


        $resultIdentifier = $launchData->hasVariable('lis_result_sourcedid')
            ? $launchData->getVariable('lis_result_sourcedid')
            : $launchDataService->findDeliveryExecutionFromLaunchData($launchData);

        $deliveryExecutionId = $ltiResultIdStorage->getDeliveryExecutionId($resultIdentifier);

        if ($deliveryExecutionId !== null) {
            $params['delivery_execution'] = $deliveryExecutionId;
        }

        $this->setClientRoute(_url('index', 'Review', 'taoReview', $params ?? []));
        $this->composeView('delegated-view', null, 'pages/index.tpl', 'tao');
    }

}
