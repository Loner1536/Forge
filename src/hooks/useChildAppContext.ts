// Contexts
import { ChildAppContext } from "@root/contexts";

export default () => {
	const ctx = ChildAppContext();
	if (!ctx) {
		error(`Failed to retrieve App Forge Context Data for Context\n${debug.traceback()}`, 2);
	}

	return ctx;
};
