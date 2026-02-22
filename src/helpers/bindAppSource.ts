// Packages
import Vide from "@rbxts/vide";

// Components
import { AppSources } from "../registries/apps";

export default function bindAppSource(
	name: AppNames,
	group: AppGroups,
	value: Vide.Source<boolean>,
) {
	if (!AppSources.get(name)) AppSources.set(name, new Map());

	AppSources.get(name)?.set(group, value);
}
