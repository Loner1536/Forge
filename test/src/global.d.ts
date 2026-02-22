declare global {
	type AppGroups = "Rules";
	type AppNames = "Parent" | "Child" | "Fade";
	type AppProps = {
		player: Player;
	};
}

export {};
