// Components
import { AppSources } from "@registries/apps";

export default function getAppSource(name: AppNames, group: AppGroups = "None") {
	const sourceMap = AppSources.get(name);

	const source = sourceMap?.get(group);
	if (!source)
		error(`Failed to find source for name: ${name} group: ${group} \n ${debug.traceback()}`);

	return source;
}
