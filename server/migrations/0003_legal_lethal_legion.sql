ALTER TABLE `products` ADD `dailymotion_id` text;--> statement-breakpoint
ALTER TABLE `products` ADD `dailymotion_status` text DEFAULT 'not_published' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `dailymotion_url` text;