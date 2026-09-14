export type AuthUser = {
	id: string;
	email: string;
	role: "USER" | "ADMIN";
};

export type AppEnv = {
	Variables: {
		user: AuthUser;
	};
};
