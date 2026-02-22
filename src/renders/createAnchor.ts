// Packages
import { apply } from "@rbxts/vide";

// Types
import type Types from "@root/types";

// Helpers
import getAppEntry from "@helpers/getAppEntry";

export default function createAnchor(
	entry: Types.Decorator.ChildEntry,
	props: Types.Props.Main,
	entryInstance: Instance,
	Loaded: Map<AppNames, Map<AppGroups, { instance: Instance }>>,
): Instance | undefined {
	const parentName = entry.rules.parent;
	const parentGroup = entry.rules.parentGroup ?? "None";
	const parentEntry = getAppEntry(parentName, parentGroup);
	const anchor = new parentEntry.constructor(parentEntry as never, props).render() as GuiObject;

	// Clear Descendants
	anchor.GetDescendants().forEach((instance) => instance.Destroy());

	if (!entryInstance) {
		const loaded = Loaded.get(entry.name)?.get(entry.group ?? "None");
		if (loaded) {
			entryInstance = loaded.instance;
		} else {
			warn("Failed to get Instance for Anchor");
			return;
		}
	}

	apply(anchor)({
		Name: "Anchor",
		BackgroundTransparency: 1,
		[0]: entryInstance,
	});

	return anchor;
}
