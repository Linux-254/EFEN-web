ALTER TABLE `projects` ADD `imageUrls` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `pathway` varchar(40) DEFAULT 'opportunity' NOT NULL;