// Packages
import { context } from "@rbxts/vide";

// Types
import type { ChildArgs } from "@root/decorators";

const AppContext = context<ChildArgs | undefined>(undefined);

export default AppContext;
