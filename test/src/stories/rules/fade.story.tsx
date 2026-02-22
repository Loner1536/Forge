// Package
import { Boolean, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Flamework } from "@flamework/core";
import { Story } from "@rbxts/forge";
import Vide from "@rbxts/vide";

Flamework.addPaths("src/client/interface/apps");

const controls = {
	visible: Boolean(true),
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
