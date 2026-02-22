// Components
import AppContext from "@root/appContext";

export default () => {
	const context = AppContext();

	if (!context) {
		error(`Failed to retrieve App Forge Props for Context\n${debug.traceback()}`, 2);
	}

	return context;
};
