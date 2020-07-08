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

namespace oat\ltiTestReview\models;

use core_kernel_classes_Resource;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\oatbox\service\ConfigurableService;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\execution\ServiceProxy as ExecutionServiceProxy;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoLti\models\classes\LtiVariableMissingException;

/**
 * Find delivery execution
 * @package oat\ltiTestReview\models
 */
class DeliveryExecutionFinderService extends ConfigurableService
{
    public const SERVICE_ID = 'ltiTestReview/DeliveryExecutionFinderService';

    public const LTI_SOURCE_ID = 'lis_result_sourcedid';
    public const OPTION_SHOW_SCORE = 'show_score';
    public const OPTION_SHOW_CORRECT = 'show_correct';
    public const LTI_SHOW_SCORE = 'custom_show_score';
    public const LTI_SHOW_CORRECT = 'custom_show_correct';

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

        /** @var core_kernel_classes_Resource $execution */
        $execution = $launchDataService->findDeliveryExecutionFromLaunchData($launchData);

        if ($execution && $execution->exists()) {
            $resultIdentifier = $execution->getUri();
        } else {
            $resultIdentifier = $launchData->hasVariable(self::LTI_SOURCE_ID)
                ? $launchData->getVariable(self::LTI_SOURCE_ID)
                : null;
        }

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
        return $this->getBooleanOption($launchData, self::LTI_SHOW_SCORE, self::OPTION_SHOW_SCORE);
    }

    /**
     * @param LtiLaunchData $launchData
     *
     * @return bool
     * @throws LtiVariableMissingException
     */
    public function getShowCorrectOption(LtiLaunchData $launchData): bool
    {
        return $this->getBooleanOption($launchData, self::LTI_SHOW_CORRECT, self::OPTION_SHOW_CORRECT);
    }

    /**
     * @param LtiLaunchData $launchData
     * @param string $variable
     * @param string $option
     * @return bool
     * @throws LtiVariableMissingException
     */
    protected function getBooleanOption(LtiLaunchData $launchData, string $variable, string $option): bool
    {
        $default = $this->hasOption($option)
            ? $this->getOption($option)
            : false;
        $value = $launchData->hasVariable($variable)
            ? $launchData->getVariable($variable)
            : $default;
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    protected function getLtiResultIdStorage(): LtiResultAliasStorage
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(LtiResultAliasStorage::SERVICE_ID);
    }

    protected function getLaunchDataService(): LtiLaunchDataService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(LtiLaunchDataService::SERVICE_ID);
    }

    protected function getExecutionServiceProxy(): DeliveryExecutionService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(ExecutionServiceProxy::SERVICE_ID);
    }
}
