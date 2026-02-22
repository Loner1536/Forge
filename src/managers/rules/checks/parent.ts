// Types
import type { AppForge } from "@root/forge";

// Packages
import { batch } from "@rbxts/vide";

// Helpers
import getAppSource from "@helpers/getAppSource";
import isChildEntry from "@helpers/isChildEntry";
import getAppEntry from "@helpers/getAppEntry";

// Registries
import { AppRegistry } from "@registries/apps";

const cache = new Map<string, boolean>();
const cachedOnClose = new Set<string>();
const closingParents = new Set<string>();

export default function ParentRule(forge: AppForge, name: AppNames, group: AppGroups) {
	const entry = getAppEntry(name, group);
	if (!entry) return;

	const isVisible = getAppSource(name, group)();
	const key = `${name}:${group}`;

	if (isChildEntry(entry)) {
		const parentName = entry.rules.parent;
		const parentGroup = entry.rules.parentGroup ?? "None";
		const parentKey = `${parentName}:${parentGroup}`;
		const parentVisible = getAppSource(parentName, parentGroup)();

		if (!parentVisible && !closingParents.has(parentKey)) cache.set(key, isVisible);
	} else {
		if (!isVisible) {
			if (closingParents.has(key) || cachedOnClose.has(key)) return;

			cachedOnClose.add(key);
			AppRegistry.forEach((entryMap) => {
				entryMap.forEach((childEntry, childGroup) => {
					if (!isChildEntry(childEntry)) return;
					if (childEntry.rules.parent !== name) return;
					if ((childEntry.rules.parentGroup ?? "None") !== group) return;

					const childKey = `${childEntry.name}:${childGroup}`;
					const childVisible = getAppSource(childEntry.name, childGroup)();

					cache.set(childKey, childVisible);
				});
			});

			closingParents.add(key);
			batch(() => {
				AppRegistry.forEach((entryMap) => {
					entryMap.forEach((childEntry, childGroup) => {
						if (!isChildEntry(childEntry)) return;
						if (childEntry.rules.parent !== name) return;
						if ((childEntry.rules.parentGroup ?? "None") !== group) return;

						forge.close(childEntry.name, childGroup);
					});
				});
			});
			closingParents.delete(key);
		} else {
			cachedOnClose.delete(key);

			AppRegistry.forEach((entryMap) => {
				entryMap.forEach((childEntry, childGroup) => {
					if (!isChildEntry(childEntry)) return;
					if (childEntry.rules.parent !== name) return;
					if ((childEntry.rules.parentGroup ?? "None") !== group) return;

					const childKey = `${childEntry.name}:${childGroup}`;
					const cached = cache.get(childKey);

					forge.set(childEntry.name, childGroup, cached ?? false);
				});
			});
		}
	}
}
