// Packages
import type { Node } from "@rbxts/vide";

declare global {
	// These will be overridden by the user
	// They are only placeholders for your build
	type AppGroups = string;
	type AppNames = string;
	type AppProps = {};

	// HELPERS FOR AUTOCOMPLETION TYPES
	namespace AppForge {
		type AppNode = Node;
	}
}
export {};
