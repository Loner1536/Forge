// Contexts
import { AppContext } from "@root/contexts";

export default function useForgeContext<T extends Record<string, unknown> = {}>() {
	const ctx = AppContext();
	if (!ctx) {
		error(`Failed to retrieve App Forge Context Data for Context\n${debug.traceback()}`, 2);
	}
	return ctx as typeof ctx & T;
}
