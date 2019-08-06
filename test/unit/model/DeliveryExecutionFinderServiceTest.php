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

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoReview\models\DeliveryExecutionFinderService;
use PHPUnit_Framework_MockObject_MockObject;

class DeliveryExecutionFinderServiceTest extends TestCase
{
    /** @var LtiResultAliasStorage|PHPUnit_Framework_MockObject_MockObject */
    private $ltiResultAliasStorage;

    /** @var LtiLaunchDataService|PHPUnit_Framework_MockObject_MockObject */
    private $ltiLaunchDataService;

    /** @var ServiceProxy|PHPUnit_Framework_MockObject_MockObject */
    private $executionServiceProxy;

    /** @var DeliveryExecutionFinderService */
    private $subject;

    public function setUp()
    {
        parent::setUp();

        $this->ltiResultAliasStorage = $this->createMock(LtiResultAliasStorage::class);
        $this->ltiLaunchDataService = $this->createMock(LtiLaunchDataService::class);
        $this->executionServiceProxy = $this->createMock(ServiceProxy::class);

        $this->subject = new DeliveryExecutionFinderService();
        $this->subject->setServiceLocator($this->getServiceLocatorMock([
            LtiResultAliasStorage::SERVICE_ID => $this->ltiResultAliasStorage,
            LtiLaunchDataService::SERVICE_ID => $this->ltiLaunchDataService,
            ServiceProxy::SERVICE_ID => $this->executionServiceProxy
        ]));
    }

    public function testFindDeliveryExecutionByExecutionId()
    {
        $sid = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $eid = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData([DeliveryExecutionFinderService::LTI_SOURCE_ID => $sid], ['execution' => $eid]);

        /** @var DeliveryExecutionInterface|PHPUnit_Framework_MockObject_MockObject $implementation */
        $implementation = $this->getMock(DeliveryExecutionInterface::class);
        $implementation->method('getIdentifier')->willReturn($eid);

        $this->ltiResultAliasStorage->method('getDeliveryExecutionId')->willReturn($eid);
        $this->ltiLaunchDataService->method('findDeliveryExecutionFromLaunchData')->willReturn(new core_kernel_classes_Resource($eid));
        $this->executionServiceProxy->method('getDeliveryExecution')->willReturn(new DeliveryExecution($implementation));

        /** @var DeliveryExecution $deliveryExecution */
        $deliveryExecution = $this->subject->findDeliveryExecution($launchData);

        $this->assertInstanceOf(DeliveryExecution::class, $deliveryExecution);
        $this->assertEquals($eid, $deliveryExecution->getIdentifier());
    }

    public function testFindDeliveryExecutionByLisResultSourceId()
    {
        $sid = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $eid = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData([DeliveryExecutionFinderService::LTI_SOURCE_ID => $sid], []);

        /** @var DeliveryExecutionInterface|PHPUnit_Framework_MockObject_MockObject $implementation */
        $implementation = $this->getMock(DeliveryExecutionInterface::class);
        $implementation->method('getIdentifier')->willReturn($eid);

        $this->ltiResultAliasStorage->method('getDeliveryExecutionId')->willReturn($eid);
        $this->ltiLaunchDataService->method('findDeliveryExecutionFromLaunchData')->willReturn(null);
        $this->executionServiceProxy->method('getDeliveryExecution')->willReturn(new DeliveryExecution($implementation));

        /** @var DeliveryExecution $deliveryExecution */
        $deliveryExecution = $this->subject->findDeliveryExecution($launchData);

        $this->assertInstanceOf(DeliveryExecution::class, $deliveryExecution);
        $this->assertEquals($eid, $deliveryExecution->getIdentifier());
    }

    public function testNotFoundDeliveryExecution()
    {
        $sid = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $eid = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData([DeliveryExecutionFinderService::LTI_SOURCE_ID => $sid], ['execution' => $eid]);

        $this->ltiResultAliasStorage->method('getDeliveryExecutionId')->willReturn(null);

        $this->expectException(LtiInvalidLaunchDataException::class);

        $this->subject->findDeliveryExecution($launchData);
    }
}
