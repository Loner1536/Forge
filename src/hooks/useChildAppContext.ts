// Contexts
import { ChildAppContext } from "@root/contexts";

export default function useChildAppContext<T extends Record<string, unknown> = {}>() {
	const ctx = ChildAppContext();
	if (!ctx) {
		error(`Failed to retrieve App Forge Context Data for Context\n${debug.traceback()}`, 2);
	}
	return ctx as typeof ctx & T;
}
