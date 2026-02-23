declare global {
	type AppGroups = "Rule" | "Feature";
	type AppNames = "Parent" | "Child" | "Fade" | "Contexts";
	type AppProps = {
		player: Player;
	};
}

export {};
