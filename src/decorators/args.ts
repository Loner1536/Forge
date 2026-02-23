// Packages
import Vide, { source, Source } from "@rbxts/vide";

// Types
import type { AppForge } from "@root/forge";
import type Types from "@root/types";

// Helpers
import getAppSource from "@helpers/getAppSource";

// Hooks
import { px, screen } from "@hooks/usePx";

abstract class BaseArgs {
	public readonly forge: AppForge;
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

	abstract render(): AppForge.Node;
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
