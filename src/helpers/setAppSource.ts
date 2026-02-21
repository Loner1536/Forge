// Packages
import { source } from "@rbxts/vide";

// Components
import { AppSources } from "../appRegistry";

export default function setAppSource(name: AppNames, group: AppGroups, value: boolean) {
	if (!AppSources.get(name)) AppSources.set(name, new Map());

	const src = AppSources.get(name)?.get(group);
	if (!src) {
		const newSource = source(value);

		AppSources.get(name)?.set(group, newSource);
	} else {
		src(false);
	}
}
