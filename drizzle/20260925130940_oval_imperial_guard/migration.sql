CREATE TABLE `participants` (
	`id` integer PRIMARY KEY,
	`github_username` text NOT NULL UNIQUE,
	`display_name` text NOT NULL,
	`avatar_url` text
);
--> statement-breakpoint
CREATE TABLE `pull_requests` (
	`id` integer PRIMARY KEY,
	`repo` text NOT NULL,
	`number` integer NOT NULL,
	`author` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`labels` text DEFAULT '[]' NOT NULL,
	`merged_at` text NOT NULL,
	`points` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trivia_rounds` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`max_points` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trivia_scores` (
	`participant_id` integer NOT NULL,
	`round_id` integer NOT NULL,
	`points` integer NOT NULL,
	CONSTRAINT `fk_trivia_scores_participant_id_participants_id_fk` FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_trivia_scores_round_id_trivia_rounds_id_fk` FOREIGN KEY (`round_id`) REFERENCES `trivia_rounds`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pr_repo_number` ON `pull_requests` (`repo`,`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `score_participant_round` ON `trivia_scores` (`participant_id`,`round_id`);