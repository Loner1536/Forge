// Helpers
import getAppSource from "@helpers/getAppSource";
import getAppEntry from "@helpers/getAppEntry";

export default function ParentRule(name: AppNames, group: AppGroups) {
	const entry = getAppEntry(name, group);

	if (entry?.rules && "parent" in entry.rules && entry.rules.parent) {
		const parentSource = getAppSource(entry.rules.parent, entry.rules.parentGroup ?? "None");
		if (parentSource && parentSource() === false) {
			const source = getAppSource(name, group);
			if (!source) warn(`Failed to get Source for name ${name} group ${group}`);

			if (source()) source(false);
		}
	}
}
