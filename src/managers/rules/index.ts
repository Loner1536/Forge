// Types
import type AppForge from "@root/forge";
import type Types from "@root/types";

// Rules
import ExclusiveGroupRule from "./check/exclusiveGroup";
import AnchorRule from "./render/anchor";
import ParentRule from "./check/parent";

// Helpers
import isChildAppRules from "@helpers/isChildAppRules";
import getAppEntry from "@helpers/getAppEntry";

export default class Rules {
	protected processing = new Set<AppNames>();

	protected renderRules(name: AppNames, group: AppGroups = "None", props: Types.Props.Main) {
		const entry = getAppEntry(name, group);
		if (!entry) {
			error(`renderRules: App Entry name "${name}" group "${group}" not registered`, 2);
		}

		const rules = entry.rules;
		if (!rules) return;

		// Parent Anchor
		if (isChildAppRules(rules) && rules.anchor) AnchorRule(name, group, props);

		// Index
		if (rules.zIndex !== undefined) {
			// TODO: will be a separate file under ruleEngine
			// forge.index(name, rules.zIndex);
		}
	}

	protected checkRules(forge: AppForge, name: AppNames, group: AppGroups) {
		if (this.processing.has(name)) return;

		this.processing.add(name);

		try {
			ParentRule(name, group);
			ExclusiveGroupRule(forge, name, group);
		} finally {
			this.processing.delete(name);
		}
	}
}
