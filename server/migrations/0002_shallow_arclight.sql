ALTER TABLE `products` ADD `video_status` text DEFAULT 'unavailable' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `video_task_id` text;