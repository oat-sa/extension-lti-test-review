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

namespace oat\ltiTestReview\controller;

use ActionEnforcingException;
use common_exception_Error;
use InterruptedActionException;
use oat\taoLti\controller\ToolModule;
use oat\taoLti\models\classes\LtiException;
use oat\taoLti\models\classes\LtiMessages\LtiErrorMessage;
use oat\taoLti\models\classes\LtiService;

/**
 * ReviewTool controller for managing LTI calls, used as entry point for LTI call and do redirect to proper application controller
 * @package oat\ltiTestReview\controller
 */
class ReviewTool extends ToolModule
{
    /**
     * @throws LtiException
     * @throws InterruptedActionException
     * @throws common_exception_Error
     */
    public function run(): void
    {
        if ($this->hasAccess(Review::class, 'index')) {
            $this->redirect(_url('index', 'Review', null, $_GET));
        } else {
            throw new LtiException(
                'You are not authorized to access this resource',
                LtiErrorMessage::ERROR_UNAUTHORIZED
            );
        }
    }

    /**
     * @throws common_exception_Error
     * @throws ActionEnforcingException
     * @throws InterruptedActionException
     */
    public function launch1p3(): void
    {
        $message = $this->getValidatedLtiMessagePayload();

        LtiService::singleton()->startLti1p3Session($message);
        $this->forward('run', null, null, $_GET);
    }
}
