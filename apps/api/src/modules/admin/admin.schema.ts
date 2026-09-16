import z from "zod";
import { UserRole } from "../../generated/prisma/enums";

export const userIdParamSchema = z.object({
	id: z.uuid(),
});

export const updateUserRoleSchema = z.object({
	role: z.enum(UserRole),
});

export const updateUserDemoSchema = z.object({
	isDemo: z.boolean(),
});
