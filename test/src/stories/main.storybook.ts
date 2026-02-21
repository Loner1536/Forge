// Types
import { type Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
	name: "Test",
	storyRoots: [script.Parent!.FindFirstChild("test")! as Folder],
};

export = storybook;
