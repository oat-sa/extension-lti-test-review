<?php

declare(strict_types=1);

namespace oat\ltiTestReview\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use common_ext_Extension as Extension;
use common_ext_ExtensionsManager as ExtensionsManager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202203151451263291_ltiTestReview extends AbstractMigration
{
    private const CONFIG_FILE = 'ReviewPanel';

    public function getDescription(): string
    {
        return 'Enable item tooltip for ReviewPanel';
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getExtension();
        $config = $extension->getConfig(self::CONFIG_FILE);
        $config['displayItemTooltip'] = false;
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();
        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['displayItemTooltip']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    /**
     * @throws ExtensionException
     */
    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('ltiTestReview');
    }
}
