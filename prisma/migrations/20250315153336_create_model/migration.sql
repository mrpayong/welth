/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Cashflow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cashflow_id_key" ON "Cashflow"("id");
