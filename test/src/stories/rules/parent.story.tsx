// Package
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Story, Logger } from "@rbxts/forge";
import { Flamework } from "@flamework/core";
import Vide from "@rbxts/vide";

Flamework.addPaths("src/client/interface/apps");

Logger.setDebug(true);

const controls = {
	Parent: ControlGroup({
		visible: Boolean(true),
	}),
	Child: ControlGroup({
		visible: Boolean(false),
	}),
};

const story = CreateVideStory(
	{
		vide: Vide,
		controls,
	},
	(props: InferVideProps<typeof controls>) => (
		<Story
			target={props.target}
			render={{
				name: "Parent",
				group: "Rules",
			}}
			callback={(_, forge) => {
				forge.bind("Parent", "Rules", props.controls.Parent.visible);
				forge.bind("Child", "Rules", props.controls.Child.visible);
			}}
		/>
	),
);

export = story;
