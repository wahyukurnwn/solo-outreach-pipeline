import { DemoUnavailableError } from "../../exceptions";
import { userRepository } from "../user/user.repository";

export const demoService = {
	// User ID di-resolve di server, tidak pernah diterima dari client — endpoint
	// /api/demo/* publik dan tidak boleh dipakai untuk mengintip data user lain
	// hanya dengan menebak/mengirim id.
	async getDemoUserId() {
		const demoUser = await userRepository.findDemoUser();
		if (!demoUser) throw new DemoUnavailableError();

		return demoUser.id;
	},
};
