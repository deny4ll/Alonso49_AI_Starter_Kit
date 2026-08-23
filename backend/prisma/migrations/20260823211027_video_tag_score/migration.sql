-- "Nivel por Área": puntaje del AI Coach (1-10) + nota corta por subárea etiquetada,
-- usado para calcular el nivel actual y la tendencia a 30 días en Progreso.
ALTER TABLE "video_tags" ADD COLUMN "score" INTEGER;
ALTER TABLE "video_tags" ADD COLUMN "note" TEXT;
