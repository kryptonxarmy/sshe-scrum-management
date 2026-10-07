ALTER TABLE "users"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "verificationToken" TEXT,
ADD COLUMN "verificationExpires" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");
