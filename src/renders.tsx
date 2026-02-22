// Services
import { Workspace } from "@rbxts/services";

// Packages
import Vide, { apply, effect, spring } from "@rbxts/vide";

// Types
import type Types from "@root/types";

// Components
import { AppRegistry } from "@registries/apps";

// Hooks
import { usePx } from "@hooks/usePx";

// Classes
import Rules from "@managers/rules";

// Components
import FadeComponent from "@components/fade";

// Helpers
import isChildAppRules from "@helpers/isChildAppRules";
import isChildEntry from "@helpers/isChildEntry";
import getAppSource from "@helpers/getAppSource";
import getAppEntry from "@helpers/getAppEntry";

type Render = {
	instance: Instance;
	container: Instance;
	anchor: Instance | undefined;
	entry: Types.Decorator.Entry | Types.Decorator.ChildEntry;
};

export default class Renders extends Rules {
	protected Loaded = new Map<AppNames, Map<AppGroups, Render>>();

	private __initalize = false;

	constructor() {
		super();
	}

	protected Initalize(props: Types.Props.Main) {
		if (!this.__initalize) {
			usePx(
				props.config?.px?.target || Workspace.CurrentCamera,
				props.config?.px?.resolution,
				props.config?.px?.minScale,
			);

			this.__initalize = true;
		}

		return this.Load(props);
	}
	private Load(props: Types.Props.Main) {
		const baseEntries = this.collectEntries(props.renders);
		const toLoad = this.expandWithChildren(baseEntries);

		const load: Instance[] = [];

		toLoad.forEach((entry) => {
			const name = entry.name;
			const group = entry.group ?? "None";

			print("Loading render for", name, group);

			const render = this.createInstance(props, name, group);

			if (!render) return;

			if (!isChildAppRules(entry.rules)) {
				load.push(render.container);
			}
		});

		return load;
	}

	private collectEntries(
		renders?: Types.Render.Props,
	): (Types.Decorator.Entry | Types.Decorator.ChildEntry)[] {
		const result: (Types.Decorator.Entry | Types.Decorator.ChildEntry)[] = [];

		const names =
			renders?.name !== undefined
				? new Set([renders.name])
				: renders?.names !== undefined
					? new Set(renders.names)
					: undefined;

		const groups =
			renders?.group !== undefined
				? new Set([renders.group])
				: renders?.groups !== undefined
					? new Set(renders.groups)
					: undefined;

		const hasNameFilter = names !== undefined;
		const hasGroupFilter = groups !== undefined;

		AppRegistry.forEach((groupEntries, appName) => {
			if (hasNameFilter && !names!.has(appName)) return;

			groupEntries.forEach((entry, group) => {
				if (hasGroupFilter && !groups!.has(group)) return;

				result.push(entry);
			});
		});

		return result;
	}
	private expandWithChildren(
		entries: (Types.Decorator.Entry | Types.Decorator.ChildEntry)[],
	): (Types.Decorator.Entry | Types.Decorator.ChildEntry)[] {
		const result = [...entries];
		const selected = new Set(entries.map((e) => e.name));
		const seen = new Set(entries.map((e) => `${e.name}:${e.group ?? "None"}`));

		AppRegistry.forEach((groupEntries) => {
			groupEntries.forEach((entry) => {
				if (!isChildEntry(entry)) return;

				const parent = entry.rules.parent;
				if (!selected.has(parent)) return;

				const key = `${entry.name}:${entry.group ?? "None"}`;
				if (seen.has(key)) return;

				seen.add(key);
				result.push(entry);
			});
		});

		return result;
	}
	private createInstance(props: Types.Props.Main, name: AppNames, group: AppGroups) {
		const entry = getAppEntry(name, group);
		if (!entry) return;

		let entryInstance: Instance;
		let anchor: Instance | undefined;
		let parentContainer: Instance | undefined;

		print(entry);
		if (isChildEntry(entry)) {
			entryInstance = new entry.constructor(entry as never, props).render() as Instance;

			const parentGroup = entry.rules.parentGroup ?? "None";
			const parentMap = this.Loaded.get(entry.rules.parent);
			if (parentMap) {
				const parentEntry = parentMap.get(parentGroup);
				if (parentEntry) parentContainer = parentEntry.container;
			}

			print(parentGroup, parentMap, entry.rules.anchor);

			if (entry.rules.anchor) {
				anchor = this.createAnchor(entry, props, entryInstance);
			}
		} else entryInstance = new entry.constructor(entry as never, props).render() as Instance;

		entryInstance.Name = "Render";

		let container;
		if (entry.fade) {
			const source = getAppSource(name, group);

			print(anchor);

			container = (
				<FadeComponent
					groupTransparency={
						spring(() => (source() ? 0 : 1), entry.fade.period, entry.fade.dampeningRatio)[0]
					}
					anchor={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.5, 0.5)}
					size={UDim2.fromScale(1, 1)}
					parent={parentContainer}
				>
					{anchor ?? entryInstance}
				</FadeComponent>
			) as Instance;
		} else {
			print("No fade for", name, group);
			container = (
				<frame
					Name={name}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Parent={parentContainer}
				>
					{anchor ?? entryInstance}
				</frame>
			) as Instance;
		}

		const render: Render = { container, instance: entryInstance, entry, anchor };
		const newMap = new Map<AppGroups, Render>();
		newMap.set(group, render);
		this.Loaded.set(name, newMap);

		return render;
	}

	protected createAnchor(
		entry: Types.Decorator.ChildEntry,
		props: Types.Props.Main,
		entryInstance: Instance,
	): Instance | undefined {
		const parentName = entry.rules.parent;
		const parentGroup = entry.rules.parentGroup ?? "None";

		const parentEntry = getAppEntry(parentName, parentGroup);

		const anchor = new parentEntry.constructor(parentEntry as never, props).render() as GuiObject;

		// Clear Descendants
		anchor.GetDescendants().forEach((instance) => instance.Destroy());

		if (!entryInstance) {
			const loaded = this.Loaded.get(entry.name)?.get(entry.group ?? "None");
			if (loaded) entryInstance = loaded.instance;
			else {
				warn("Failed to get Instance for Anchor");
				return;
			}
		}

		apply(anchor)({
			Name: "Anchor",
			BackgroundTransparency: 1,
			[0]: entryInstance,
		});

		return anchor;
	}
}
