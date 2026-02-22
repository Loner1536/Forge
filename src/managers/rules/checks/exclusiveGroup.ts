// Types
import type AppForge from "@root/forge";

// Components
import { AppRegistry } from "@registries/apps";

// Helpers
import getAppSource from "@helpers/getAppSource";
import getAppEntry from "@helpers/getAppEntry";

export default function ExclusiveGroupRule(forge: AppForge, name: AppNames, group: AppGroups) {
	const entry = getAppEntry(name, group);
	if (!entry)
		error(`Failed to find app entry for "ExclusiveGroupRule" name ${name} group ${group}`);

	const entryVisible = getAppSource(name, group)();
	if (!entryVisible) return;

	AppRegistry.forEach((entryMap, entryGroup) => {
		entryMap.forEach((entry, entryName) => {
			if (name === entryName) return;
			if (entry.rules?.exclusiveGroup !== entryGroup) return;

			const visible = getAppSource(entryName)!();
			if (!visible) return;

			forge.close(entryName, entryGroup);
		});
	});
}
