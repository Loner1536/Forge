// Services
import { RunService } from "@rbxts/services";

// Packages
import Vide, { apply, create, effect, untrack } from "@rbxts/vide";

// Types
import type Types from "./types";

// Classes
import Renders from "./renders";

// Components
import { AppRegistry } from "./appRegistry";

// Helpers
import bindAppSource from "./helpers/bindAppSource";
import getAppSource from "./helpers/getAppSource";
import hasAppSource from "./helpers/hasAppSource";
import setAppSource from "./helpers/setAppSource";
import getAppEntry from "./helpers/getAppEntry";

export default class AppForge extends Renders {
	constructor() {
		super();
		AppRegistry.forEach((entryMap, name) => {
			entryMap.forEach((_, group) => {
				this.createSource(name, group);
			});
		});
	}

	private createSource(name: AppNames, group: AppGroups = "None") {
		const entry = getAppEntry(name, group);
		if (!entry) return;

		if (hasAppSource(name, group)) return;

		setAppSource(name, group, entry.visible ?? false);
	}
	public getSource(name: AppNames, group: AppGroups = "None") {
		if (!hasAppSource(name, group)) this.createSource(name, group);

		const src = getAppSource(name, group);

		return src!;
	}
	public bind(name: AppNames, group: AppGroups = "None", value: Vide.Source<boolean>) {
		bindAppSource(name, group, value);
	}

	// TODO: make a separate files for rules
	public set(name: AppNames, group: AppGroups = "None", value: boolean, rules = true) {
		let src = getAppSource(name, group);
		if (!src) return;

		const prev = src();
		if (prev === value) return;

		src(value);

		if (rules) this.checkRules(this, name, group);
	}

	public open(name: AppNames, group: AppGroups = "None", rules = true) {
		this.set(name, group, true, rules);
	}
	public close(name: AppNames, group: AppGroups = "None", rules = true) {
		this.set(name, group, false, rules);
	}
	public toggle(name: AppNames, group: AppGroups = "None", rules = true) {
		const src = this.getSource(name, group);
		if (!src) return;

		this.set(name, group, !src(), rules);
	}

	story = ({
		props,
		target,
		renders,
		config,
	}: {
		props: AppProps;
		target: GuiObject;
		renders?: Types.Props.Render;
		config?: Types.Props.Config;
	}) => {
		const Container = create("Frame")({
			Name: "Story Container",
			BackgroundTransparency: 1,
			AnchorPoint: new Vector2(0.5, 0.5),
			Position: UDim2.fromScale(0.5, 0.5),
			Size: UDim2.fromScale(1, 1),
		});

		apply(Container as Instance)({
			[0]: this.Initalize({
				props,
				forge: this,
				renders,
				config: {
					px: {
						target,
						minScale: config?.px.minScale,
					},
				},
			}),
		});

		return Container;
	};
	render = ({ props }: { props: Omit<Types.Props.Main, "forge"> }) => {
		return this.Initalize({ ...props, forge: this });
	};
}
