-- CreateTable
CREATE TABLE `Device` (
    `deployment` VARCHAR(191),
    `relay_id` INTEGER,
    `type` ENUM('BASESTATION', 'RELAY') NOT NULL,
    `mac` VARCHAR(12) NOT NULL,
    `nickname` VARCHAR(191),
    `last_seen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `addr` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mac`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deployment` (
    `name` VARCHAR(191) NOT NULL,
    `locked` BOOLEAN NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Data` (
    `mac` VARCHAR(12) NOT NULL,
    `lux` VARCHAR(191) NOT NULL,
    `temperature` VARCHAR(191) NOT NULL,
    `pressure` VARCHAR(191) NOT NULL,
    `humidity` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mac`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mac` VARCHAR(12) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `event` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `auth_level` INTEGER NOT NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Device` ADD CONSTRAINT `Device_deployment_fkey` FOREIGN KEY (`deployment`) REFERENCES `Deployment`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Data` ADD CONSTRAINT `Data_mac_fkey` FOREIGN KEY (`mac`) REFERENCES `Device`(`mac`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_mac_fkey` FOREIGN KEY (`mac`) REFERENCES `Device`(`mac`) ON DELETE RESTRICT ON UPDATE CASCADE;
