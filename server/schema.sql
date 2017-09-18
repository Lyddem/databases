CREATE DATABASE IF NOT EXISTS chat;

USE chat;
-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'users'
--
-- ---

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `username` CHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'rooms'
--
-- ---

DROP TABLE IF EXISTS `Rooms`;
CREATE TABLE `Rooms` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `roomname` CHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'messages'
--
-- ---

DROP TABLE IF EXISTS `Messages`;
CREATE TABLE `Messages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(500) NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `room_id` INTEGER NULL DEFAULT NULL,
  `created_at` CHAR(35) NULL DEFAULT NULL,
  `updated_at` INTEGER(35) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id)
);


/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/
