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

namespace oat\ltiTestReview\test\unit\model;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\ltiDeliveryProvider\model\execution\LtiDeliveryExecutionService;
use oat\ltiDeliveryProvider\model\LtiLaunchDataService;
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\ltiTestReview\models\DeliveryExecutionFinderService;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoLti\models\classes\LtiInvalidLaunchDataException;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoLti\models\classes\LtiVariableMissingException;

class DeliveryExecutionFinderServiceTest extends TestCase
{
    /** @var LtiResultAliasStorage */
    private $ltiResultAliasStorage;

    /** @var LtiLaunchDataService */
    private $ltiLaunchDataService;

    /** @var ServiceProxy */
    private $executionServiceProxy;

    /** @var LtiDeliveryExecutionService */
    private $ltiDeliveryExecutionServiceMock;

    /** @var DeliveryExecutionFinderService */
    private $subject;

    public function setUp(): void
    {
        parent::setUp();

        $this->ltiResultAliasStorage = $this->createMock(LtiResultAliasStorage::class);
        $this->ltiLaunchDataService = $this->createMock(LtiLaunchDataService::class);
        $this->executionServiceProxy = $this->createMock(ServiceProxy::class);
        $this->ltiDeliveryExecutionServiceMock = $this->createMock(LtiDeliveryExecutionService::class);

        $this->subject = new DeliveryExecutionFinderService();
        $this->subject->setServiceLocator($this->getServiceLocatorMock([
            LtiResultAliasStorage::SERVICE_ID => $this->ltiResultAliasStorage,
            LtiLaunchDataService::SERVICE_ID => $this->ltiLaunchDataService,
            ServiceProxy::SERVICE_ID => $this->executionServiceProxy,
            LtiDeliveryExecutionService::SERVICE_ID => $this->ltiDeliveryExecutionServiceMock
        ]));
    }

    public function testFindDeliveryExecutionByExecutionId()
    {
        $sourceId = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $executionId = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData(
            [DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId],
            ['execution' => $executionId]
        );

        /** @var DeliveryExecutionInterface $implementation */
        $implementation = $this->createMock(DeliveryExecutionInterface::class);
        $implementation->method('getIdentifier')
            ->willReturn($executionId);

        $this->ltiResultAliasStorage->method('getDeliveryExecutionId')
            ->willReturn($executionId);

        $this->ltiLaunchDataService->method('findDeliveryExecutionFromLaunchData')
            ->willReturn(new core_kernel_classes_Resource($executionId));

        $this->executionServiceProxy->method('getDeliveryExecution')
            ->willReturn(new DeliveryExecution($implementation));

        $deliveryExecution = $this->subject->findDeliveryExecution($launchData);

        $this->assertEquals($executionId, $deliveryExecution->getIdentifier());
    }

    public function testFindDeliveryExecutionByLisResultSourceId()
    {
        $sourceId = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $executionId = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData(
            [DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId],
            []
        );

        /** @var DeliveryExecutionInterface $implementation */
        $implementation = $this->createMock(DeliveryExecutionInterface::class);
        $implementation->method('getIdentifier')
            ->willReturn($executionId);

        $this->ltiResultAliasStorage->method('getDeliveryExecutionId')
            ->willReturn($executionId);

        $this->executionServiceProxy->method('getDeliveryExecution')
            ->willReturn(new DeliveryExecution($implementation));

        $deliveryExecution = $this->subject->findDeliveryExecution($launchData);

        $this->assertEquals($executionId, $deliveryExecution->getIdentifier());
    }

    public function testNotFoundDeliveryExecutionByUserAndDeliveryWithoutResourceLinkId(): void
    {
        $userId = 'test_user_id';
        $deliveryId = 'http://backoffice.docker.localhost/ontologies/tao.rdf#i617822471ea2d126631ac77e4b86e48';
        $this->ltiDeliveryExecutionServiceMock->expects(self::never())->method('getLinkedDeliveryExecutions');

        $this->executionServiceProxy->expects(self::once())->method('getUserExecutions')->willReturn([]);
        $deliveryExecution = $this->subject->findLastExecutionByUserAndDelivery($userId, $deliveryId);

        self::assertNull($deliveryExecution);
    }

    public function testNotFoundDeliveryExecutionByUserAndDeliveryWithResourceLinkId(): void
    {
        $userId = 'test_user_id';
        $deliveryId = 'http://backoffice.docker.localhost/ontologies/tao.rdf#i617822471ea2d126631ac77e4b86e48';
        $resourceLinkId = $this->createMock(core_kernel_classes_Resource::class);

        $this->ltiDeliveryExecutionServiceMock
            ->expects(self::once())
            ->method('getLinkedDeliveryExecutions')
            ->willReturn([]);

        $this->executionServiceProxy->expects(self::never())->method('getUserExecutions')->willReturn([]);
        $deliveryExecution = $this->subject->findLastExecutionByUserAndDelivery($userId, $deliveryId, $resourceLinkId);

        self::assertNull($deliveryExecution);
    }

    public function testFindDeliveryExecutionByUserAndDeliveryWithResourceLinkId(): void
    {
        $userId = 'test_user_id';
        $deliveryId = 'http://backoffice.docker.localhost/ontologies/tao.rdf#i617822471ea2d126631ac77e4b86e48';
        $resourceLinkId = $this->createMock(core_kernel_classes_Resource::class);


        $implementationA = $this->createMock(DeliveryExecutionInterface::class);
        $implementationA->expects(self::once())->method('getStartTime')->willReturn('0');
        $deliveryExecutionA = new DeliveryExecution($implementationA);

        $implementationB = $this->createMock(DeliveryExecutionInterface::class);
        $implementationB->expects(self::once())->method('getStartTime')->willReturn('1');
        $deliveryExecutionB = new DeliveryExecution($implementationB);


        $this->ltiDeliveryExecutionServiceMock
            ->expects(self::once())
            ->method('getLinkedDeliveryExecutions')
            ->willReturn([$deliveryExecutionB, $deliveryExecutionA]);

        $this->executionServiceProxy
            ->expects(self::never())
            ->method('getUserExecutions');

        $deliveryExecution = $this->subject->findLastExecutionByUserAndDelivery($userId, $deliveryId, $resourceLinkId);

        self::assertNotNull($deliveryExecution);
        $this->assertInstanceOf(DeliveryExecution::class, $deliveryExecution);
        $this->assertSame($deliveryExecutionB, $deliveryExecution);
    }


    public function testFindDeliveryExecutionByUserAndDeliveryWithoutResourceLinkId(): void
    {
        $userId = 'test_user_id';
        $deliveryId = 'http://backoffice.docker.localhost/ontologies/tao.rdf#i617822471ea2d126631ac77e4b86e48';

        $implementationA = $this->createMock(DeliveryExecutionInterface::class);
        $implementationA->expects(self::once())->method('getStartTime')->willReturn('0');
        $deliveryExecutionA = new DeliveryExecution($implementationA);

        $implementationB = $this->createMock(DeliveryExecutionInterface::class);
        $implementationB->expects(self::once())->method('getStartTime')->willReturn('1');
        $deliveryExecutionB = new DeliveryExecution($implementationB);

        $this->ltiDeliveryExecutionServiceMock
            ->expects(self::never())
            ->method('getLinkedDeliveryExecutions');

        $this->executionServiceProxy
            ->expects(self::once())
            ->method('getUserExecutions')
            ->willReturn([$deliveryExecutionB, $deliveryExecutionA]);

        $deliveryExecution = $this->subject->findLastExecutionByUserAndDelivery($userId, $deliveryId);

        self::assertNotNull($deliveryExecution);
        $this->assertInstanceOf(DeliveryExecution::class, $deliveryExecution);
        $this->assertSame($deliveryExecutionB, $deliveryExecution);
    }

    public function testNotFoundDeliveryExecution()
    {
        $sourceId = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';
        $executionId = 'http://selor.docker/tao.rdf#i1562270728176451';

        $launchData = new LtiLaunchData(
            [DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId],
            ['execution' => $executionId]
        );

        $this->expectException(LtiInvalidLaunchDataException::class);

        $this->subject->findDeliveryExecution($launchData);
    }

    /**
     * @dataProvider optionDataProvider
     * @param $value
     * @param $expected
     * @throws LtiVariableMissingException
     */
    public function testGetShowScoreOption($value, $expected)
    {
        $sourceId = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';

        // check option passed through LTI
        $launchData = new LtiLaunchData(
            [
                DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId,
                DeliveryExecutionFinderService::LTI_SHOW_SCORE => $value
            ],
            []
        );

        $result = $this->subject->getShowScoreOption($launchData);

        $this->assertEquals($expected, $result);

        // check default option value
        $launchData = new LtiLaunchData(
            [DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId],
            []
        );

        $this->subject->setOption(DeliveryExecutionFinderService::OPTION_SHOW_SCORE, $value);

        $result = $this->subject->getShowScoreOption($launchData);

        $this->assertEquals($expected, $result);
    }

    /**
     * @dataProvider optionDataProvider
     * @param $value
     * @param $expected
     * @throws LtiVariableMissingException
     */
    public function testGetShowCorrectOption($value, $expected)
    {
        $sourceId = 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9';

        // check option passed through LTI
        $launchData = new LtiLaunchData(
            [
                DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId,
                DeliveryExecutionFinderService::LTI_SHOW_CORRECT => $value
            ],
            []
        );

        $result = $this->subject->getShowCorrectOption($launchData);

        $this->assertEquals($expected, $result);

        // check default option value
        $launchData = new LtiLaunchData(
            [DeliveryExecutionFinderService::LTI_SOURCE_ID => $sourceId],
            []
        );

        $this->subject->setOption(DeliveryExecutionFinderService::OPTION_SHOW_CORRECT, $value);

        $result = $this->subject->getShowCorrectOption($launchData);

        $this->assertEquals($expected, $result);
    }

    public function optionDataProvider() {
        return [
            ['', false],
            ['0', false],
            [0, false],
            [false, false],

            ['1', true],
            [1, true],
            ['true', true],
            [true, true],
        ];
    }
}
