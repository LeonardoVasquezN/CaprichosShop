-- AlterTable
ALTER TABLE "ventas"
ADD COLUMN "cdr_url" TEXT,
ADD COLUMN "estado_sunat" VARCHAR(20),
ADD COLUMN "hash_sunat" TEXT,
ADD COLUMN "numero" BIGINT,
ADD COLUMN "pdf_url" TEXT,
ADD COLUMN "serie" VARCHAR(4),
ADD COLUMN "tipo_comprobante" VARCHAR(2),
ADD COLUMN "xml_url" TEXT;