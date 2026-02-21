// Package
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

// Dependencies
import Setup from "../setup";

const controls = {
	Template: ControlGroup({
		visible: Boolean(true),
	}),
	Child: ControlGroup({
		visible: Boolean(true),
	}),
};

const story = CreateVideStory(
	{
		vide: Vide,
		controls,
	},
	(storyProps: InferVideProps<typeof controls>) => (
		<Setup
			storyProps={storyProps}
			callback={(_, forge) => {
				forge.bind("Template", undefined, storyProps.controls.Template.visible);
				forge.bind("Child", undefined, storyProps.controls.Child.visible);
			}}
		/>
	),
);

export = story;
