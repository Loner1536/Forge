const PREFIX = "[Forge]";
let DEBUG = false;

const Logger = {
	/**
	 * Enable or disable debug logging.
	 * Should be called before CreateForge is instantiated.
	 */
	setDebug: (enabled: boolean) => {
		DEBUG = enabled;
	},

	/**
	 * General debug log — only prints when debug mode is enabled.
	 */
	debug: (context: string, message: string) => {
		if (!DEBUG) return;
		print(`${PREFIX}[${context}]: ${message}`);
	},

	/**
	 * Always prints a warning.
	 */
	warn: (context: string, message: string) => {
		warn(`${PREFIX}[${context}]: ${message}`);
	},

	/**
	 * Always throws an error.
	 */
	error: (context: string, message: string) => {
		error(`${PREFIX}[${context}]: ${message}`, 2);
	},

	/**
	 * Times how long a render function takes and logs it if debug is enabled.
	 * Returns whatever the callback returns.
	 */
	time: <T>(context: string, name: string, fn: () => T): T => {
		if (!DEBUG) return fn();
		const start = os.clock();
		const result = fn();
		const elapsed = os.clock() - start;
		print(`${PREFIX}[${context}]: "${name}" rendered in ${string.format("%.4f", elapsed)}s`);
		return result;
	},
};

export default Logger;
