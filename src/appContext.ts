// Packages
import { context } from "@rbxts/vide";

// Types
import type { AppForge } from "@root/forge";
import type Types from "@root/types";

const AppContext = context<{ props: Types.Props.Class; forge: AppForge } | undefined>(undefined);

export default AppContext;
