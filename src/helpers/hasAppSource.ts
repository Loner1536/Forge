// Components
import { AppSources } from "../appRegistry";

export default function hasAppSource(name: AppNames, group: AppGroups) {
	const sourceMap = AppSources.get(name);
	if (!sourceMap) return false;

	const source = sourceMap?.get(group);
	if (!source) return false;

	return true;
}
