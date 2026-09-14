import bcrypt from "bcrypt";

const DEFAULT_SALT_ROUNDS = 10;

interface HashPasswordProps {
	saltRounds?: number;
}

export const hashPassword = async (
	plainPassword: string,
	{ saltRounds = DEFAULT_SALT_ROUNDS }: HashPasswordProps = {},
) => {
	return await bcrypt.hash(plainPassword, saltRounds);
};

export const comparePassword = async (
	plainPassword: string,
	passwordHash: string,
) => {
	return await bcrypt.compare(plainPassword, passwordHash);
};
