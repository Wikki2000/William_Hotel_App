-- Create database if not exists
CREATE DATABASE IF NOT EXISTS wills_test_db;

-- Create user if not exists
CREATE USER IF NOT EXISTS "wills_test"@"localhost" IDENTIFIED BY "445178aA@";

-- Grant priviledges
GRANT ALL ON wills_test_db.* TO "wills_test"@"localhost";
