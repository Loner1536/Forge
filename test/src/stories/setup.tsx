// Packages
import { CreateForge, type RenderProps } from "@rbxts/forge";
import { Flamework } from "@flamework/core";
import Vide from "@rbxts/vide";

// Types
import type { InferProps } from "@rbxts/ui-labs";

const mockedPlayer = {
	Name: "UI-Labs",
	UserId: 123456,
} as const satisfies Partial<Player> as Player;

// IMPORTANT: Ensures all decorators under @shared/apps are registered
Flamework.addPaths("src/client/interface/apps");

export default function Setup<T extends InferProps<{}>>({
	storyProps,
	callback,
	render,
}: {
	storyProps: T;
	callback?: (props: AppProps, Forge: CreateForge) => void;
	render?: RenderProps;
}) {
	const forge = new CreateForge();
	const props = {
		player: mockedPlayer,
	} as AppProps;

	if (callback) callback(props, forge);

	return <forge.story props={props} target={storyProps.target} renders={render} />;
}
