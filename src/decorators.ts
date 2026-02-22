//. Packages
import { source, Source } from "@rbxts/vide";

// Types
import type CreateForge from "@root/forge";
import type Types from "./types";

// Dependencies
import { AppRegistry } from "@registries/apps";

// Helpers
import getAppSource from "@helpers/getAppSource";

// Hooks
import { px, screen } from "@hooks/usePx";

export function App<N extends AppNames>(props: Types.Decorator.AppProps<N>) {
	return function <T extends Types.Decorator.Constructor<N>>(constructor: T) {
		const groupKey = props.group ?? "None";

		// Ensure uniqueness
		if (AppRegistry.get(props.name)?.has(groupKey)) {
			error(
				`Duplicate registered App name "${props.name}" in same Group "${groupKey}". ` +
					`App names must be globally unique.`,
				2,
			);
		}

		if (!props.name) error("App registration failed: missing app name", 2);

		// Initialize registry map if missing
		if (!AppRegistry.has(props.name)) AppRegistry.set(props.name, new Map());

		const fadeConfig = (constructor as Types.Fade.Constructor).__forge_fade;

		// Register app
		AppRegistry.get(props.name)!.set(groupKey, {
			constructor,
			name: props.name,
			group: props.group,
			visible: props.visible,
			rules: props.rules,
			fade: fadeConfig,
		} as Types.Decorator.Entry<N>);

		return constructor;
	};
}
export function ChildApp<N extends AppNames>(props: Types.Decorator.ChildAppProps<N>) {
	return function <T extends Types.Decorator.ChildConstructor<N>>(constructor: T) {
		const groupKey = props.group ?? "None";

		// Ensure uniqueness
		if (AppRegistry.get(props.name)?.has(groupKey)) {
			error(
				`Duplicate registered App name "${props.name}" in same Group "${groupKey}". ` +
					`App names must be globally unique.`,
				2,
			);
		}

		if (!props.name) error("App registration failed: missing app name", 2);

		// Initialize registry map if missing
		if (!AppRegistry.has(props.name)) AppRegistry.set(props.name, new Map());

		// Register app
		AppRegistry.get(props.name)!.set(groupKey, {
			constructor,
			name: props.name,
			group: props.group,
			visible: props.visible,
			rules: props.rules,
		} as Types.Decorator.ChildEntry<N>);

		return constructor;
	};
}

export function Fade(period?: number, dampeningRatio?: number) {
	return function <T extends new (...args: any[]) => {}>(ctor: T) {
		(ctor as Types.Fade.Constructor).__forge_fade = {
			period: period ?? 0.5,
			dampeningRatio: dampeningRatio ?? 0.75,
		};

		AppRegistry.forEach((groupMap) => {
			groupMap.forEach((entry) => {
				if ((entry.constructor as unknown as T) === ctor) {
					entry.fade = (ctor as Types.Fade.Constructor).__forge_fade;
				}
			});
		});

		return ctor;
	};
}

abstract class BaseArgs {
	public readonly forge: CreateForge;
	public readonly props: Types.Props.Class;

	public readonly name: AppNames;
	public readonly group: AppGroups;

	public readonly source: Source<boolean>;

	protected constructor(
		entry: Types.Decorator.Entry | Types.Decorator.ChildEntry,
		props: Types.Props.Main,
	) {
		this.name = entry.name;
		this.group = entry.group ?? "None";

		this.source = getAppSource(this.name, this.group);
		this.forge = props.forge;

		this.props = {
			...props.props,

			screen,
			px,
		};
	}

	abstract render(): Vide.Node;
}

export abstract class Args extends BaseArgs {
	constructor(entry: Types.Decorator.Entry, props: Types.Props.Main) {
		super(entry, props);
	}
}
export abstract class ChildArgs extends BaseArgs {
	public readonly childrenSources = (): Source<boolean>[] => [source(false)];
	public readonly closeChildren = () => {};

	public readonly parentSource: Source<boolean>;

	constructor(entry: Types.Decorator.ChildEntry, props: Types.Props.Main) {
		super(entry, props);

		this.parentSource = getAppSource(entry.rules?.parent!, entry.rules?.parentGroup!);
	}
}
