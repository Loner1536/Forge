// Components
import { AppSources } from "../appRegistry";

export default function getAppSource(name: AppNames, group: AppGroups) {
	const sourceMap = AppSources.get(name);

	const source = sourceMap?.get(group);
	if (!source)
		warn(`Failed to find source for name: ${name} group: ${group} \n ${debug.traceback()}`);

	return source;
}
