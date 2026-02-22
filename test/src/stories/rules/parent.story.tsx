// Package
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

// Dependencies
import Setup from "../setup";

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
		<Setup
			storyProps={props}
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
