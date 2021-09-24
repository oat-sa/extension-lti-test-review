<?php

declare(strict_types=1);

namespace oat\ltiTestReview\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\ltiTestReview\controller\Review;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoLti\models\classes\LtiRoles;

final class Version2021092101_ltiTestReview extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Allow LTI1p3 Learner using Review module';
    }

    public function up(Schema $schema): void
    {
        AclProxy::applyRule($this->getRule());
    }

    public function down(Schema $schema): void
    {
        AclProxy::revokeRule($this->getRule());
    }

    private function getRule(): AccessRule
    {
        return new AccessRule(AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_LEARNER, Review::class);
    }
}
