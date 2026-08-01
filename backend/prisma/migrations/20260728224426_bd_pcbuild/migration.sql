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
