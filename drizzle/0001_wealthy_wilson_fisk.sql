CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_message` text NOT NULL,
	`ai_response` text NOT NULL,
	`context` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consent_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`data_collection` boolean DEFAULT false,
	`transaction_analysis` boolean DEFAULT false,
	`ai_coach_insights` boolean DEFAULT false,
	`nudge_generation` boolean DEFAULT false,
	`tax_analysis` boolean DEFAULT false,
	`consent_timestamp` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consent_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_balance` decimal(15,2) DEFAULT '0',
	`monthly_income` decimal(15,2) DEFAULT '0',
	`monthly_savings_goal` decimal(15,2) DEFAULT '0',
	`current_monthly_savings` decimal(15,2) DEFAULT '0',
	`financial_health_score` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nudges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`nudge_type` enum('Savings Goal','Liquid Fund','Festive Spending','Spending Pattern','Investment Opportunity') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`action_url` varchar(512),
	`is_read` boolean DEFAULT false,
	`festive_context` enum('Diwali','Wedding Season','None') DEFAULT 'None',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `nudges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`goal_name` varchar(255) NOT NULL,
	`target_amount` decimal(15,2) NOT NULL,
	`current_amount` decimal(15,2) DEFAULT '0',
	`deadline` timestamp,
	`goal_type` enum('Emergency Fund','Vacation','Home','Vehicle','Education','Retirement','Other') DEFAULT 'Other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savings_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`annual_income` decimal(15,2) NOT NULL,
	`recommended_regime` enum('New','Old') NOT NULL,
	`new_regime_tax` decimal(15,2) NOT NULL,
	`old_regime_tax` decimal(15,2) NOT NULL,
	`nps_contribution` decimal(15,2) DEFAULT '0',
	`standard_deduction` decimal(15,2) NOT NULL,
	`savings` decimal(15,2) NOT NULL,
	`analysis_date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`category` enum('Needs','Wants','Investments','Income','Uncategorized') DEFAULT 'Uncategorized',
	`description` text,
	`transaction_type` enum('debit','credit') NOT NULL,
	`source` enum('UPI','Bank SMS','Manual') DEFAULT 'Manual',
	`transaction_date` timestamp NOT NULL,
	`imported_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
