// Package
import { Boolean, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

// Dependencies
import Setup from "../setup";

const controls = {
	visible: Boolean(true),
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
				name: "Fade",
				group: "Rules",
			}}
			callback={(_, forge) => {
				forge.bind("Fade", "Rules", props.controls.visible);
			}}
		/>
	),
);

export = story;
