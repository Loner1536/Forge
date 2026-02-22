// Packages
import { context } from "@rbxts/vide";

// Types
import type CreateForge from "@root/forge";
import type Types from "@root/types";

const AppContext = context<{ props: Types.Props.Class; forge: CreateForge } | undefined>(undefined);

export default AppContext;
