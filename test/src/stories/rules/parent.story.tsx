// Package
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Flamework } from "@flamework/core";
import { Story } from "@rbxts/forge";
import Vide from "@rbxts/vide";

// Dependencies
import createProps from "@client/controllers/app/createProps";

Flamework.addPaths("src/client/interface/apps");

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
			props={createProps()}
			target={props.target}
			render={{
				name: "Parent",
				group: "Rule",
			}}
			callback={(_, forge) => {
				forge.bind("Parent", "Rule", props.controls.Parent.visible);
				forge.bind("Child", "Rule", props.controls.Child.visible);
			}}
			debug
		/>
	),
);

export = story;
