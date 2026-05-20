CREATE TYPE "public"."form_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('draft', 'unlisted', 'public');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'single_select', 'multi_select', 'checkbox', 'dropdown', 'rating', 'date');--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"description" text,
	"tokens" jsonb NOT NULL,
	"preview_image_url" text,
	"is_built_in" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "themes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"theme_id" uuid,
	"title" varchar(120) NOT NULL,
	"description" text,
	"slug" varchar(80) NOT NULL,
	"visibility" "form_visibility" DEFAULT 'draft' NOT NULL,
	"status" "form_status" DEFAULT 'active' NOT NULL,
	"cover_emoji" varchar(8),
	"submit_label" varchar(40) DEFAULT 'Submit',
	"thank_you_message" text,
	"notify_respondent" boolean DEFAULT false,
	"is_template" boolean DEFAULT false,
	"password_hash" text,
	"response_limit" integer,
	"expires_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"type" "field_type" NOT NULL,
	"label" varchar(200) NOT NULL,
	"help_text" text,
	"required" boolean DEFAULT false,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"respondent_email" varchar(255),
	"ip_hash" varchar(64),
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forms_owner_idx" ON "forms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "form_fields_form_idx" ON "form_fields" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "responses_form_idx" ON "responses" USING btree ("form_id");