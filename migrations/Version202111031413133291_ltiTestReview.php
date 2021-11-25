<?php

declare(strict_types=1);

namespace oat\ltiTestReview\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\ltiTestReview\controller\Review;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoLti\models\classes\LtiRoles;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202111031413133291_ltiTestReview extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Allow LTI1p3 Mentor and Instructor using Review module';
    }

    public function up(Schema $schema): void
    {
        AclProxy::applyRule($this->getMentorRule());
        AclProxy::applyRule($this->getInstructorRule());

    }

    public function down(Schema $schema): void
    {
        AclProxy::revokeRule($this->getMentorRule());
        AclProxy::revokeRule($this->getInstructorRule());

    }

    private function getMentorRule(): AccessRule
    {
        return new AccessRule(AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_MENTOR, Review::class);
    }

    private function getInstructorRule(): AccessRule
    {
        return new AccessRule(AccessRule::GRANT, LtiRoles::CONTEXT_LTI1P3_INSTRUCTOR, Review::class);
    }
}
