// Types
import { type Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
	name: "Features",
	storyRoots: [script.Parent!.FindFirstChild("features")! as Folder],
};

export = storybook;
