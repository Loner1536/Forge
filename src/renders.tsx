// Services
import { Workspace } from "@rbxts/services";

// Packages
import Vide, { apply, spring } from "@rbxts/vide";

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
		const renders = props.renders;

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

		const load: Instance[] = [];
		const rendered = new Set<string>();

		const renderEntry = (name: AppNames, group: AppGroups): Instance | undefined => {
			const key = `${name}:${group}`;
			if (rendered.has(key)) return;
			rendered.add(key);

			// Collect all direct child containers first before building this container
			const childContainers: Instance[] = [];
			AppRegistry.forEach((groupEntries) => {
				groupEntries.forEach((childEntry, childGroup) => {
					if (!isChildEntry(childEntry)) return;
					if (childEntry.rules.parent !== name) return;
					const childParentGroup = childEntry.rules.parentGroup ?? "None";
					if (childParentGroup !== group) return;

					const childContainer = renderEntry(childEntry.name, childGroup);
					if (childContainer) childContainers.push(childContainer);
				});
			});

			const render = this.createInstance(props, name, group, childContainers);
			if (!render) return;

			if (!isChildAppRules(getAppEntry(name, group)?.rules)) {
				load.push(render.container);
			}

			return render.container;
		};

		AppRegistry.forEach((groupEntries, appName) => {
			groupEntries.forEach((entry, group) => {
				if (isChildEntry(entry)) return;
				if (names && !names.has(appName)) return;
				if (groups && !groups.has(group)) return;
				renderEntry(appName, group);
			});
		});

		return load;
	}

	private createInstance(
		props: Types.Props.Main,
		name: AppNames,
		group: AppGroups,
		childContainers: Instance[],
	) {
		const entry = getAppEntry(name, group);
		if (!entry) return;

		let entryInstance: Instance;
		let anchor: Instance | undefined;
		let parentContainer: Instance | undefined;

		if (isChildEntry(entry)) {
			entryInstance = new entry.constructor(entry as never, props).render() as Instance;

			const parentGroup = entry.rules.parentGroup ?? "None";
			const parentMap = this.Loaded.get(entry.rules.parent);
			if (parentMap) {
				const parentEntry = parentMap.get(parentGroup);
				if (parentEntry) parentContainer = parentEntry.container;
			}

			if (entry.rules.anchor) {
				anchor = this.createAnchor(entry, props, entryInstance);
			}
		} else entryInstance = new entry.constructor(entry as never, props).render() as Instance;

		entryInstance.Name = "Render";

		let container;
		if (entry.fade) {
			const source = getAppSource(name, group);

			container = (
				<FadeComponent
					name={`${group}_${name}_Container`}
					groupTransparency={
						spring(() => (source() ? 0 : 1), entry.fade.period, entry.fade.dampeningRatio)[0]
					}
					anchor={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.5, 0.5)}
					size={UDim2.fromScale(1, 1)}
					parent={parentContainer}
					zIndex={isChildAppRules(entry.rules) ? (entry.zIndex ?? 0) : (entry?.zIndex ?? 1)}
				>
					{anchor ?? entryInstance}
					{...childContainers}
				</FadeComponent>
			) as Instance;
		} else {
			container = (
				<frame
					Name={`${group}_${name}_Container`}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={UDim2.fromScale(1, 1)}
					Parent={parentContainer}
					ZIndex={isChildAppRules(entry.rules) ? (entry.zIndex ?? 0) : (entry?.zIndex ?? 1)}
				>
					{anchor ?? entryInstance}
					{...childContainers}
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
