-- CreateTable
CREATE TABLE "role_change_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "from_role" "user_role" NOT NULL,
    "to_role" "user_role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_change_logs_target_id_idx" ON "role_change_logs"("target_id");

-- AddForeignKey
ALTER TABLE "role_change_logs" ADD CONSTRAINT "role_change_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_change_logs" ADD CONSTRAINT "role_change_logs_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
