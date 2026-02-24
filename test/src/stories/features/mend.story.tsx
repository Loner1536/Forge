// Package
import { Boolean, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Flamework } from "@flamework/core";
import { Story } from "@rbxts/forge";
import Vide from "@rbxts/vide";

// Dependencies
import createProps from "@client/controllers/app/createProps";

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
			props={createProps()}
			target={props.target}
			render={{
				name: "Mend",
				group: "Feature",
			}}
			callback={(_, forge) => {
				forge.bind("Mend", "Feature", props.controls.visible);
			}}
			debug
		/>
	),
);

export = story;
