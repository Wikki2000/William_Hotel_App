-- Create database if not exists
CREATE DATABASE IF NOT EXISTS wills_dev_db;

-- Create user if not exists
CREATE USER IF NOT EXISTS "wills_dev"@"localhost" IDENTIFIED BY "wills_dev_pwd";

-- Grant priviledges
GRANT ALL ON wills_dev_db.* TO "wills_dev"@"localhost";
