// Packages
import { Source } from "@rbxts/vide";

// Types
import type Types from "@root/types";

export type RegistryMap<N> = Map<AppNames, Map<AppGroups, N>>;
export type AnyAppEntry<N extends AppNames = AppNames> =
	| Types.Decorator.Entry<N>
	| Types.Decorator.ChildEntry<N>;

export const AppRegistry: RegistryMap<AnyAppEntry> = new Map();
export const AppSources: RegistryMap<Source<boolean>> = new Map();
