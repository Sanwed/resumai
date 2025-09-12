-- CreateTable
CREATE TABLE "public"."Tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_project_tags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_project_tags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_project_tags_B_index" ON "public"."_project_tags"("B");

-- AddForeignKey
ALTER TABLE "public"."_project_tags" ADD CONSTRAINT "_project_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_project_tags" ADD CONSTRAINT "_project_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
