ALTER TABLE "users" ADD COLUMN "password_hash" text;
ALTER TABLE "users" ADD COLUMN "auth_provider" varchar(20)[] DEFAULT ARRAY[]::varchar[] NOT NULL;
