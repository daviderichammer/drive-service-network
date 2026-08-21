-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'FLEET_OPERATOR', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
    `membershipTier` ENUM('FREE', 'DSN_PLUS') NOT NULL DEFAULT 'FREE',
    `memberSince` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `password` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `operatorType` VARCHAR(191) NULL,
    `fleetSizeBand` VARCHAR(191) NULL,
    `primaryMarket` VARCHAR(191) NULL,
    `openbayUserId` VARCHAR(191) NULL,
    `openbayLegacyId` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'US',
    `sheetSyncStatus` ENUM('PENDING', 'SYNCED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `sheetSyncedAt` DATETIME(3) NULL,
    `sheetSyncError` TEXT NULL,
    `sheetRowRef` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_openbayUserId_key`(`openbayUserId`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_openbayUserId_idx`(`openbayUserId`),
    INDEX `users_membershipTier_idx`(`membershipTier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification_tokens_token_key`(`token`),
    UNIQUE INDEX `verification_tokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fleetId` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `make` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `engine` VARCHAR(191) NULL,
    `vin` VARCHAR(191) NULL,
    `licensePlate` VARCHAR(191) NULL,
    `trim` VARCHAR(191) NULL,
    `mileage` INTEGER NULL,
    `nickname` VARCHAR(191) NULL,
    `openbayVehicleId` VARCHAR(191) NULL,
    `openbayStyleId` INTEGER NULL,
    `openbayStyleName` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'IN_SERVICE', 'SOLD', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    `programStatus` ENUM('FREE', 'DSN_PLUS') NOT NULL DEFAULT 'FREE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `removedAt` DATETIME(3) NULL,

    UNIQUE INDEX `vehicles_openbayVehicleId_key`(`openbayVehicleId`),
    INDEX `vehicles_userId_idx`(`userId`),
    INDEX `vehicles_fleetId_idx`(`fleetId`),
    INDEX `vehicles_vin_idx`(`vin`),
    INDEX `vehicles_programStatus_idx`(`programStatus`),
    UNIQUE INDEX `vehicles_userId_vin_key`(`userId`, `vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_enrollments` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vinAtEnrollment` VARCHAR(191) NULL,
    `plan` ENUM('PREPAID_6', 'PREPAID_12', 'FINANCE_12') NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRING', 'EXPIRED', 'CANCELLED', 'PENDING_PAYMENT') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `enrollmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `effectiveDate` DATETIME(3) NULL,
    `nextBillingDate` DATETIME(3) NULL,
    `expirationDate` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `fleetTierId` VARCHAR(191) NULL,
    `monthlyPerVehicleCents` INTEGER NULL,
    `activeVehicleCountAtSnapshot` INTEGER NULL,
    `paymentReference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicle_enrollments_vehicleId_idx`(`vehicleId`),
    INDEX `vehicle_enrollments_userId_idx`(`userId`),
    INDEX `vehicle_enrollments_status_idx`(`status`),
    INDEX `vehicle_enrollments_nextBillingDate_idx`(`nextBillingDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('TURO_HOST', 'RENTAL_OPERATOR', 'COMMERCIAL_FLEET', 'DEALER', 'CORPORATE', 'MUNICIPAL', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `description` TEXT NULL,
    `contactName` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `dotNumber` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `vehicleCount` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fleets_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleet_members` (
    `id` VARCHAR(191) NOT NULL,
    `fleetId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fleet_members_fleetId_userId_key`(`fleetId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `openbayServiceRequestId` VARCHAR(191) NULL,
    `openbayPublicId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'OPEN_FOR_OFFERS', 'ACCEPTED', 'SETTLED', 'EXPIRED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    `serviceZipCode` VARCHAR(191) NOT NULL,
    `serviceCity` VARCHAR(191) NULL,
    `serviceState` VARCHAR(191) NULL,
    `requestedServices` JSON NULL,
    `interviewAnswers` JSON NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_requests_openbayServiceRequestId_key`(`openbayServiceRequestId`),
    INDEX `service_requests_userId_idx`(`userId`),
    INDEX `service_requests_vehicleId_idx`(`vehicleId`),
    INDEX `service_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NULL,
    `fleetId` VARCHAR(191) NULL,
    `serviceRequestId` VARCHAR(191) NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `serviceDescription` TEXT NULL,
    `quotedPriceCents` INTEGER NULL,
    `finalPriceCents` INTEGER NULL,
    `dsnPlusSavingsCents` INTEGER NULL,
    `shopName` VARCHAR(191) NULL,
    `shopAddress` VARCHAR(191) NULL,
    `shopCity` VARCHAR(191) NULL,
    `shopState` VARCHAR(191) NULL,
    `shopZipCode` VARCHAR(191) NULL,
    `shopPhone` VARCHAR(191) NULL,
    `shopRating` DECIMAL(3, 2) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    `openbayAppointmentId` VARCHAR(191) NULL,
    `openbayOfferId` VARCHAR(191) NULL,
    `openbayLocationId` VARCHAR(191) NULL,
    `customerNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `appointments_userId_idx`(`userId`),
    INDEX `appointments_vehicleId_idx`(`vehicleId`),
    INDEX `appointments_status_idx`(`status`),
    INDEX `appointments_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repair_history` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `vin` VARCHAR(191) NULL,
    `serviceDate` DATETIME(3) NULL,
    `workPerformed` TEXT NULL,
    `facilityName` VARCHAR(191) NULL,
    `facilityCity` VARCHAR(191) NULL,
    `facilityState` VARCHAR(191) NULL,
    `quotedPriceCents` INTEGER NULL,
    `finalPriceCents` INTEGER NULL,
    `dsnPlusSavingsCents` INTEGER NULL,
    `openbayServiceRequestId` VARCHAR(191) NULL,
    `openbayAppointmentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `repair_history_vehicleId_idx`(`vehicleId`),
    INDEX `repair_history_vin_idx`(`vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funnel_events` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `event` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `sessionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `funnel_events_event_idx`(`event`),
    INDEX `funnel_events_userId_idx`(`userId`),
    INDEX `funnel_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sheet_sync_log` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `operation` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SYNCED', 'FAILED', 'SKIPPED') NOT NULL,
    `attempt` INTEGER NOT NULL DEFAULT 1,
    `errorMessage` TEXT NULL,
    `payload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sheet_sync_log_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `sheet_sync_log_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_forms` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `inquiryType` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM') NOT NULL DEFAULT 'NEW',
    `assignedTo` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contact_forms_email_idx`(`email`),
    INDEX `contact_forms_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financing_inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `fleetSize` VARCHAR(191) NULL,
    `financingNeed` VARCHAR(191) NULL,
    `estimatedAmount` DECIMAL(10, 2) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `assignedTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `financing_inquiries_email_idx`(`email`),
    INDEX `financing_inquiries_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `iconName` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `openbayCategoryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_categories_name_key`(`name`),
    UNIQUE INDEX `service_categories_slug_key`(`slug`),
    UNIQUE INDEX `service_categories_openbayCategoryId_key`(`openbayCategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `openbayServiceId` INTEGER NULL,
    `autoquotable` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `services_openbayServiceId_key`(`openbayServiceId`),
    INDEX `services_categoryId_idx`(`categoryId`),
    INDEX `services_openbayServiceId_idx`(`openbayServiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_enrollments` ADD CONSTRAINT `vehicle_enrollments_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_enrollments` ADD CONSTRAINT `vehicle_enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fleet_members` ADD CONSTRAINT `fleet_members_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fleet_members` ADD CONSTRAINT `fleet_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_fleetId_fkey` FOREIGN KEY (`fleetId`) REFERENCES `fleets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair_history` ADD CONSTRAINT `repair_history_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funnel_events` ADD CONSTRAINT `funnel_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_forms` ADD CONSTRAINT `contact_forms_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financing_inquiries` ADD CONSTRAINT `financing_inquiries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `service_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
