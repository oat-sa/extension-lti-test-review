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
use oat\ltiDeliveryProvider\model\LtiResultAliasStorage;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoReview\models\DeliveryExecutionFinderService;

class DeliveryExecutionFinderServiceTest extends TestCase
{
    /** @var LtiResultAliasStorage|\PHPUnit_Framework_MockObject_MockObject */
    private $ltiResultAliasStorage;

    /** @var LtiLaunchDataService|\PHPUnit_Framework_MockObject_MockObject */
    private $ltiLaunchDataService;

    /** @var DeliveryExecutionFinderService */
    private $subject;

    /** @var LtiLaunchData */
    private $launchData;

    public function setUp()
    {
        parent::setUp();

        $this->ltiResultAliasStorage = $this->createMock(LtiResultAliasStorage::class);
        $this->ltiLaunchDataService = $this->createMock(LtiLaunchDataService::class);

        $this->subject = new DeliveryExecutionFinderService();
        $this->subject->setServiceLocator($this->getServiceLocatorMock([
            LtiResultAliasStorage::SERVICE_ID => $this->ltiResultAliasStorage,
            LtiLaunchDataService::SERVICE_ID => $this->ltiLaunchDataService
        ]));
    }

    public function testFindDeliveryExecutionByExecutionId()
    {
        $launchData = new LtiLaunchData([
            DeliveryExecutionFinderService::LTI_SOURCE_ID => 'v5ba19e6ltos1lmljfv8fgnb07:::S3294476:::29123:::dyJ86SiwwA9'
        ], [
            'execution' => 'http://selor.docker/tao.rdf#i1562270728176451'
        ]);

        //DeliveryExecution
        $e = $this->subject->findDeliveryExecution($launchData);

    }

    public function testFindDeliveryExecutionByLisResultSourceId()
    {

    }

    public function testNotFoundDeliveryExecution()
    {

    }
}
