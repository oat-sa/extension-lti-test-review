<?php

namespace oat\taoReview\models;


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
