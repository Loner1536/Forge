// Packages
import { context } from "@rbxts/vide";

// Types
import type { ChildArgs } from "@root/decorators";

const ChildAppContext = context<ChildArgs | undefined>(undefined);

export default ChildAppContext;
