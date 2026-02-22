// Types
import { type Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
	name: "Rules",
	storyRoots: [script.Parent!.FindFirstChild("rules")! as Folder],
};

export = storybook;
