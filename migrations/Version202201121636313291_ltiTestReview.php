<?php

declare(strict_types=1);

namespace oat\ltiTestReview\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use common_ext_Extension as Extension;
use common_ext_ExtensionsManager as ExtensionsManager;

final class Version202201121636313291_ltiTestReview extends AbstractMigration
{
    private const CONFIG_FILE = 'ReviewPanel';

    public function getDescription(): string
    {
        return 'Set ReviewPanel config values';
    }

    public function up(Schema $schema): void
    {
        // set ReviewPanel.conf values
        $extension = $this->getExtension();
        $config = $extension->getConfig(self::CONFIG_FILE);
        $config['reviewLayout'] = 'default';
        $config['displaySectionTitles'] = true;
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    public function down(Schema $schema): void
    {
        // remove ReviewPanel.conf values
        $extension = $this->getExtension();
        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['reviewLayout']);
        unset($config['displaySectionTitles']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    /**
     * @throws ExtensionException
     *
     * @return Extension
     */
    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('ltiTestReview');
    }
}
