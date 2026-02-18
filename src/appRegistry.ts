// Packages
import Vide from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from "./forge";

// Hooks
import { px } from "./hooks/usePx";

export const AppRegistry = new Map<AppNames, Map<AppGroups, Types.AppRegistry.Static>>();
export const AppSources = new Map<AppNames, Map<AppGroups, Vide.Source<boolean>>>();

/**
 * Registers a Vide App with AppForge.
 *
 * This runs at definition time and validates static configuration.
 */
export function App<N extends AppNames>(props: Types.AppRegistry.Props<N>) {
	return function <
		T extends new (
			props: Types.Props.Main,
			name: AppNames,
			group?: AppGroups,
		) => Args,
	>(constructor: T) {
		if (AppRegistry.get(props.name)?.has(props.group || "None")) {
			error(
				`Duplicate registered App name "${props.name} in same Group name ${props.group || "None"}". ` +
					`App names must be globally unique.`,
				2,
			);
		}

		if (!props.name) {
			error("App registration failed: missing app name", 2);
		}

		if (!AppRegistry.get(props.name)) AppRegistry.set(props.name, new Map());

		AppRegistry.get(props.name)?.set(props.group || "None", {
			constructor,
			group: props.group || "None",
			visible: props.visible,
			rules: props.rules,
		} as Types.AppRegistry.Generic<N>);

		return constructor;
	};
}

/**
 * Base class for all AppForge Apps.
 */
export abstract class Args {
	public readonly props: Types.Props.Class;

	public readonly source: Vide.Source<boolean>;
	public readonly group: AppGroups;
	public readonly name: AppNames;

	constructor(props: Types.Props.Main, name: AppNames, group?: AppGroups) {
		const { forge } = props;

		this.group = group || "None";
		this.name = name;

		this.props = {
			...props.props,
			forge,
			px,
		};

		this.source = forge.getSource(name, group)!;
	}

	abstract render(): Vide.Node;
}
