-- Drive Service Network — MySQL Initialization
-- Creates databases for all environments

CREATE DATABASE IF NOT EXISTS drive_service_network_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS drive_service_network_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON drive_service_network_dev.* TO 'dsn_user'@'%';
GRANT ALL PRIVILEGES ON drive_service_network_test.* TO 'dsn_user'@'%';

FLUSH PRIVILEGES;
