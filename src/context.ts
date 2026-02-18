// Packages
import { context } from "@rbxts/vide";

// Types
import type Types from "./types";

const Contexts = {
	App: context<Types.Props.Class | undefined>(undefined),
} as const;

export default Contexts;
