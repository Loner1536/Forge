// Package
import { CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

const controls = {};

const story = CreateVideStory(
	{
		vide: Vide,
		controls,
	},
	(props: InferVideProps<typeof controls>) => {},
);

export = story;
