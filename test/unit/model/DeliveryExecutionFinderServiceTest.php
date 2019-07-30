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

namespace oat\taoReview\test\unit\model;

use oat\generis\test\TestCase;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoProctoring\model\deliveryLog\DeliveryLog;
use oat\taoReview\models\DeliveryExecutionFinderService;
use Zend\ServiceManager\ServiceLocatorInterface;

class DeliveryExecutionFinderServiceTest extends TestCase
{
    public function testFindDeliveryExecutionByExecutionId()
    {
        $launchData = new LtiLaunchData([
            'lis_result_sourcedid' => 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9'
        ], [
            'execution' => 'http://selor.docker/tao.rdf#i1562270728176451'
        ]);

        $service = $this->getDEFinderServiceMock('http://some/delivery#id');

        $found = $service->findDeliveryExecution($launchData);

        print_r($found);

    }

//    public function testFindDeliveryExecutionByLisResultSourceId()
//    {
//
//    }

    private function getDEFinderServiceMock($returnValue): DeliveryExecutionFinderService
    {
        $serviceLocatorMock = $this->getMockedServiceLocator($returnValue);

        $service = new DeliveryExecutionFinderService();
        $service->setServiceLocator($serviceLocatorMock);

//        /$service->method('getLaunchDataService')->willReturn($this->getLtiLaunchDataService($returnValue));

        return $service;
    }

    /**
     * @param $returnValue
     *
     * @return LtiLaunchDataService
     */
    private function getLtiLaunchDataService($returnValue): LtiLaunchDataService
    {
        $serviceLocatorMock = $this->getMockedServiceLocator($returnValue);

        $service = new LtiLaunchDataService();
        $service->setServiceLocator($serviceLocatorMock);

        return $service;
    }

    private function getMockedServiceLocator($returnValue): ServiceLocatorInterface
    {
        $deliveryLogMock = $this->getMockBuilder(DeliveryLog::class)->disableOriginalConstructor()->getMock();
        $deliveryLogMock->method('get')->willReturn($returnValue);

        return $this->getServiceLocatorMock([DeliveryLog::SERVICE_ID => $deliveryLogMock]);
    }
}
