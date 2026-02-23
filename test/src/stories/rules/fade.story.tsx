// Package
import { Boolean, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Story, Logger } from "@rbxts/forge";
import { Flamework } from "@flamework/core";
import Vide from "@rbxts/vide";

Flamework.addPaths("src/client/interface/apps");

Logger.setDebug(true);

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
