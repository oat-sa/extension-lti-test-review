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
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\ServiceProxy as ExecutionServiceProxy;
use oat\taoDelivery\model\execution\Service as ExecutionService;
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

    public const LTI_SOURCE_ID = 'lis_result_sourcedid';
    public const OPTION_SHOW_SCORE = 'custom_show_score';
    public const OPTION_SHOW_CORRECT = 'custom_show_correct';

    /**
     * @param LtiLaunchData $launchData
     *
     * @return DeliveryExecution
     * @throws LtiInvalidLaunchDataException
     * @throws LtiVariableMissingException
     */
    public function findDeliveryExecution(LtiLaunchData $launchData): DeliveryExecution
    {
        $launchDataService = $this->getLaunchDataService();
        $ltiResultIdStorage = $this->getLtiResultIdStorage();

        $resultIdentifier = $launchData->hasVariable(self::LTI_SOURCE_ID)
            ? $launchData->getVariable(self::LTI_SOURCE_ID)
            : $launchDataService->findDeliveryExecutionFromLaunchData($launchData);

        $deliveryExecutionId = $ltiResultIdStorage->getDeliveryExecutionId($resultIdentifier);

        if ($deliveryExecutionId === null) {
            throw new LtiInvalidLaunchDataException('Wrong result ID provided');
        }

        return $this->getExecutionServiceProxy()->getDeliveryExecution($deliveryExecutionId);
    }
    
    /**
     * @param LtiLaunchData $launchData
     *
     * @return bool
     * @throws LtiVariableMissingException
     */
    public function getShowScoreOption(LtiLaunchData $launchData): bool
    {
        return $this->getBooleanOption($launchData, self::OPTION_SHOW_SCORE);
    }
    
    /**
     * @param LtiLaunchData $launchData
     *
     * @return bool
     * @throws LtiVariableMissingException
     */
    public function getShowCorrectOption(LtiLaunchData $launchData): bool
    {
        return $this->getBooleanOption($launchData, self::OPTION_SHOW_CORRECT);
    }

    /**
     * @param LtiLaunchData $launchData
     * @param string $option
     * @return bool
     * @throws LtiVariableMissingException
     */
    protected function getBooleanOption(LtiLaunchData $launchData, string $option): bool
    {
        $value = $launchData->hasVariable($option)
            ? $launchData->getVariable($option)
            : false;

        if (is_numeric($value)) {
            $value = (bool)intval($value);
        } else if ($value == 'true') {
            $value = true;
        }

        return $value;
    }

    protected function getLtiResultIdStorage(): LtiResultAliasStorage
    {
        return $this->getServiceLocator()->get(LtiResultAliasStorage::SERVICE_ID);
    }

    protected function getLaunchDataService(): LtiLaunchDataService
    {
        return $this->getServiceLocator()->get(LtiLaunchDataService::SERVICE_ID);
    }

    protected function getExecutionServiceProxy(): ExecutionService
    {
        return $this->getServiceLocator()->get(ExecutionServiceProxy::SERVICE_ID);
    }
}
