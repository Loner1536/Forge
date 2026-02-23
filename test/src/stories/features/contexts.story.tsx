// Package
import { Boolean, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Story, Logger } from "@rbxts/forge";
import { Flamework } from "@flamework/core";
import Vide from "@rbxts/vide";

// Dependencies
import createProps from "@client/controllers/app/createProps";

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
			props={createProps()}
			target={props.target}
			render={{
				name: "Contexts",
				group: "Feature",
			}}
			callback={(_, forge) => {
				forge.bind("Contexts", "Feature", props.controls.visible);
			}}
		/>
	),
);

export = story;
