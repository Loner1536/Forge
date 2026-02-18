// Components
import { AppRegistry } from "../appRegistry";

export default function getAppEntry(name: AppNames, group: AppGroups) {
	const entryMap = AppRegistry.get(name);

	const entry = entryMap?.get(group);
	if (!entry) warn(`Failed to get entry for name ${name} and group ${group}`);

	return entry;
}
