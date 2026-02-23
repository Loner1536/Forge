// Packages
import { context } from "@rbxts/vide";

// Types
import type { Args } from "@root/decorators";

const AppContext = context<Args | undefined>(undefined);

export default AppContext;
