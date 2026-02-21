// Types
import type AppForge from "../../forge";

// Components
import { AppRegistry } from "../../appRegistry";

// Helpers
import getAppEntry from "../../helpers/getAppEntry";

export default function ExclusiveGroupRule(forge: AppForge, name: AppNames, group: AppGroups) {
	const entry = getAppEntry(name, group);
	if (!entry)
		error(`Failed to find app entry for "ExclusiveGroupRule" name ${name} group ${group}`);

	const entryVisible = forge.getSource(name, group)();
	if (!entryVisible) return;

	AppRegistry.forEach((entryMap, entryGroup) => {
		entryMap.forEach((entry, entryName) => {
			if (name === entryName) return;
			if (entry.rules?.exclusiveGroup !== entryGroup) return;

			const visible = forge.getSource(entryName)!();
			if (!visible) return;

			forge.close(entryName, entryGroup, false);
		});
	});
}
