ALTER TABLE `projects` ADD `imageMeta` text;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `about` text DEFAULT ('{}') NOT NULL;