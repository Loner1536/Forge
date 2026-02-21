// Components
import Contexts from "../context";

export default () => {
	const context = Contexts.App();

	if (!context) {
		error(`Failed to retrieve App Props for Vide\n${debug.traceback()}`, 2);
	}

	return context;
};
