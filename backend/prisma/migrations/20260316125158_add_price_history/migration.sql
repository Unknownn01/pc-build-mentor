-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "url_loja" TEXT;

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" INTEGER NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildPronta" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "uso_principal" TEXT NOT NULL,
    "cpu_id" INTEGER NOT NULL,
    "gpu_id" INTEGER NOT NULL,
    "memoria_id" INTEGER NOT NULL,
    "placaMae_id" INTEGER NOT NULL,
    "armazenamento_id" INTEGER NOT NULL,
    "cooler_id" INTEGER NOT NULL,
    "gabinete_id" INTEGER NOT NULL,
    "fonte_id" INTEGER NOT NULL,
    "build_image" TEXT NOT NULL,

    CONSTRAINT "BuildPronta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
