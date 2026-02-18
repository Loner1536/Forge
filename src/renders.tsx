// Packages
import Vide, { apply, mount } from "@rbxts/vide";

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
	entry: Types.AppRegistry.Static;
};

export default class Renders extends Rules {
	private __px = false;

	protected Loaded = new Map<AppNames, Map<AppGroups, Render>>();

	constructor() {
		super();
	}

	Load = (props: Types.Props.Main) => {
		const baseEntries = this.collectEntries(props.renders);
		const toLoad = this.expandWithChildren(baseEntries);

		const load: Instance[] = [];

		toLoad.forEach((entry) => {
			const name = tostring(entry.constructor);
			const group = entry.group!;
			const render = this.createInstance(props, name, group);

			if (!render) return;

			if (!render.entry.rules?.parent) {
				load.push(render.container);
			}
		});

		return load;
	};

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
		const selected = new Set(entries.map((e) => tostring(e.constructor)));

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

	private createInstance(props: Types.Props.Main, name: AppNames, group: AppGroups) {
		const entry = getAppEntry(name, group);
		if (!entry) return;

		// App Entry Instance/Render
		const entryInstance = new entry.constructor(props, name, group).render() as Instance;
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
		if (entry.rules?.anchor) {
			const parentName = entry.rules.parent;
			const parentGroup = entry.rules.parentGroup || "None";
			if (!parentName) return;

			const parentEntry = getAppEntry(entry.rules.parent, parentGroup);
			if (!parentEntry) return;

			anchor = new parentEntry.constructor(props, parentName, parentGroup).render() as GuiObject;
			anchor.GetDescendants().forEach((instance) => instance.Destroy());

			apply(anchor)({
				Name: "Anchor",
				BackgroundTransparency: 1,

				[0]: entryInstance,
			});
		}

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
		const render = { container, instance: entryInstance, entry };
		newMap.set(group, render);

		this.Loaded.set(name, newMap);

		return render;
	}

	protected initalize(
		props: Types.Props.Main,
		target?: GuiObject | Instance,
		root?: GuiObject | Instance,
	) {
		if (target) {
			mount(() => {
				if (!this.__px) {
					usePx(props.config?.px.target, props.config?.px.resolution, props.config?.px.minScale);

					this.__px = true;
				}

				const renders = <this.Load {...props} />;

				if (root) {
					root.Name = "App Tree";

					apply(root)({
						[0]: renders,
					});

					return root;
				}

				return (
					<screengui Name={"App Tree"} ZIndexBehavior="Sibling" ResetOnSpawn={false}>
						{renders}
					</screengui>
				);
			}, target);
		} else {
			if (!this.__px) {
				usePx(props.config?.px.target, props.config?.px.resolution, props.config?.px.minScale);

				this.__px = true;
			}

			return <this.Load {...props} />;
		}
	}
}
