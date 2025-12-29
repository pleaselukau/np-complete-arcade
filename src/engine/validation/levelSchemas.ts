import { z } from "zod";

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);

export const BaseLevelSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  level: z.number().int().positive(),
  title: z.string(),
  difficulty: DifficultySchema,
  objective: z.string(),
  hint: z.string().optional(),
  payload: z.unknown(),
});

export type BaseLevel = z.infer<typeof BaseLevelSchema>;
