// Services
import { Workspace } from "@rbxts/services";

// Packages
import Vide, { apply } from "@rbxts/vide";

// Types
import type Types from "./types";

// Components
import { AppRegistry } from "./appRegistry";

// Hooks
import { usePx } from "./hooks/usePx";

// Classes
import Rules from "./ruleEngine";

// Helpers
import getAppEntry from "./helpers/getAppEntry";

type Render = {
	instance: Instance;
	container: Instance;
	anchor: Instance | undefined;
	entry: Types.AppRegistry.Static;
};

export default class Renders extends Rules {
	protected Loaded = new Map<AppNames, Map<AppGroups, Render>>();
	protected props!: Types.Props.Main;

	private __initalize = false;

	constructor() {
		super();
	}

	private Load(props: Types.Props.Main) {
		const baseEntries = this.collectEntries(props.renders);
		const toLoad = this.expandWithChildren(baseEntries);

		const load: Instance[] = [];

		toLoad.forEach((entry) => {
			const name = entry.name;
			const group = entry.group!;
			const render = this.createInstance(name, group);

			if (!render) return;

			if (!render.entry.rules?.parent) {
				load.push(render.container);
			}
		});

		return load;
	}
	protected Initalize(props: Types.Props.Main) {
		if (!this.__initalize) {
			usePx(
				props.config?.px.target || Workspace.CurrentCamera,
				props.config?.px.resolution,
				props.config?.px.minScale,
			);

			this.props = props;

			this.__initalize = true;
		}

		return this.Load(props);
	}

	private collectEntries(renders?: Types.Props.Render): Types.AppRegistry.Static[] {
		const result: Types.AppRegistry.Static[] = [];

		const names =
			renders?.name !== undefined
				? new Set([renders.name])
				: renders?.names
					? new Set(renders.names)
					: undefined;

		const groups =
			renders?.group !== undefined
				? new Set([renders.group])
				: renders?.groups
					? new Set(renders.groups)
					: undefined;

		AppRegistry.forEach((groupEntries, appName) => {
			if (names && !names.has(appName)) return;

			groupEntries.forEach((entry, group) => {
				if (groups && !groups.has(group)) return;
				result.push(entry);
			});
		});

		return result;
	}
	private expandWithChildren(entries: Types.AppRegistry.Static[]) {
		const result = [...entries];
		const selected = new Set(entries.map((e) => e.name));

		AppRegistry.forEach((groupEntries) => {
			groupEntries.forEach((entry) => {
				const parent = entry.rules?.parent;
				if (parent && selected.has(parent)) {
					result.push(entry);
				}
			});
		});

		return result;
	}
	private createInstance(name: AppNames, group: AppGroups) {
		const entry = getAppEntry(name, group);
		if (!entry) return;

		// App Entry Instance/Render
		const entryInstance = new entry.constructor(this.props, name, group).render() as Instance;
		entryInstance.Name = "Render";

		// Parent Container
		let parentContainer;
		if (entry.rules?.parent) {
			const group = entry.rules.parentGroup || "None";

			const parentMap = this.Loaded.get(entry.rules.parent);
			if (parentMap) {
				const parentEntry = parentMap.get(group);
				if (parentEntry) parentContainer = parentEntry.container;
			}
		}

		// Anchor
		let anchor;
		if (entry.rules?.anchor) anchor = this.createAnchor(name, group, entryInstance);

		const container = (
			<frame
				Name={name}
				BackgroundTransparency={1}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromScale(1, 1)}
				Parent={parentContainer}
			>
				{anchor ? anchor : entryInstance}
			</frame>
		) as Instance;

		const newMap = new Map<AppGroups, Render>();
		const render = { container, instance: entryInstance, entry, anchor };
		newMap.set(group, render);

		this.Loaded.set(name, newMap);

		return render;
	}

	protected createAnchor(
		name: AppNames,
		group: AppGroups,
		entryInstance: Instance,
	): Instance | undefined {
		const entry = getAppEntry(name, group);
		if (!entry || !entry.rules) return;

		if (!entryInstance) {
			const loaded = this.Loaded.get(name)?.get(group);
			if (loaded) {
				entryInstance = loaded.instance;
			} else {
				warn("Failed to get Instance for Anchor");
				return;
			}
		}

		const parentName = entry.rules.parent;
		const parentGroup = entry.rules.parentGroup || "None";
		if (!parentName) return;

		const parentEntry = getAppEntry(entry.rules.parent, parentGroup);
		if (!parentEntry) return;

		const anchor = new parentEntry.constructor(
			this.props,
			parentName,
			parentGroup,
		).render() as GuiObject;

		// Clear Descendants
		anchor.GetDescendants().forEach((instance) => instance.Destroy());

		apply(anchor)({
			Name: "Anchor",
			BackgroundTransparency: 1,

			[0]: entryInstance,
		});

		return anchor;
	}
}
