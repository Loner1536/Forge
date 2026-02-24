declare global {
	type AppGroups = "Rule" | "Feature";
	type AppNames = "Parent" | "Child" | "Fade" | "Context" | "ChildContext" | "Mend";
	type AppProps = {
		player: Player;
	};
}

export {};
