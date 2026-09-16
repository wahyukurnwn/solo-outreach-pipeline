-- CreateTable
CREATE TABLE "demo_change_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "from_demo" BOOLEAN NOT NULL,
    "to_demo" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demo_change_logs_target_id_idx" ON "demo_change_logs"("target_id");

-- AddForeignKey
ALTER TABLE "demo_change_logs" ADD CONSTRAINT "demo_change_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_change_logs" ADD CONSTRAINT "demo_change_logs_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
