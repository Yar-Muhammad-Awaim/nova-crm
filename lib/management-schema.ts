import { z } from "zod";

const name = z.string().trim().min(1, "Enter a name.").max(160);
const description = z.string().trim().max(5000).default("");
const personId = z.string().trim().min(1, "Select a person.").max(100);
const date = z.iso.date("Enter a valid date.");

export const memberSchema = z.object({
  name,
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  role: z.enum(["AGENT", "MANAGER"]),
  password: z.string().min(8, "Use at least 8 characters for the password.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "The password must be 72 bytes or fewer."),
  specialization: z.string().trim().max(160).default(""),
  skills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

export const teamSchema = z.object({
  id: z.uuid().optional(), name, description,
  managerId: personId,
  memberIds: z.array(personId).max(500),
});

export const projectSchema = z.object({
  name, clientName: name, description, managerId: personId,
  deadline: date, teamId: z.uuid().nullable().default(null),
});

export const taskSchema = z.object({
  projectId: z.uuid(), title: name, description,
  assigneeId: personId, deadline: date,
  estimatedHours: z.number().positive("Estimated hours must be greater than zero.").max(10000),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

export function validated<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);
  return result.data;
}
