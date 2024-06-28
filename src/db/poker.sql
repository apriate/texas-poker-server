SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for command_record
-- ----------------------------
DROP TABLE IF EXISTS `command_record`;
CREATE TABLE `command_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `gameId` int(11) DEFAULT NULL,
  `type` text,
  `gameStatus` int(11) DEFAULT NULL,
  `counter` int(11) DEFAULT NULL,
  `command` text,
  `commonCard` text,
  `pot` int(11) DEFAULT NULL,
  `roomNumber` int(11) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26259 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for game
-- ----------------------------
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roomNumber` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `commonCard` text,
  `winners` text CHARACTER SET utf8,
  `pot` decimal(8,0) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2546 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gameId` int(11) DEFAULT NULL,
  `roomNumber` int(11) DEFAULT NULL,
  `buyIn` int(11) NOT NULL,
  `handCard` varchar(25) DEFAULT NULL,
  `counter` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7440 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for room
-- ----------------------------
DROP TABLE IF EXISTS `room`;
CREATE TABLE `room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `smallBlind` int(11) DEFAULT NULL,
  `isShort` tinyint(1) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `roomNumber` text CHARACTER SET latin1,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickName` char(25) CHARACTER SET utf8 DEFAULT NULL,
  `password` char(25) DEFAULT NULL,
  `account` char(25) CHARACTER SET utf8 DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

-- ----------------------------
-- ommand record 添加 user id 和 game id 索引
-- ----------------------------
ALTER TABLE `command_record` ADD INDEX `idx_user_id`(`userId`);
ALTER TABLE `command_record` ADD INDEX `idx_game_id`(`gameId`);
ALTER TABLE `player` ADD INDEX `idx_user_id`(`userId`);

