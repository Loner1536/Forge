// Packages
import { AppForge } from "@root/forge";
import Vide from "@rbxts/vide";

// Types
import type Types from "@root/types";

const mockedPlayer = {
	Name: "Story",
	UserId: 123456,
} as const satisfies Partial<Player> as Player;

export default function Story({
	target,
	render,
	callback,
}: {
	target: GuiObject;
	render?: Types.Render.Props;
	callback?: (props: AppProps, Forge: AppForge) => void;
}) {
	const forge = new AppForge();
	const props = {
		player: mockedPlayer,
	} as AppProps;

	const rendered = <forge.story props={props} target={target} renders={render} />;

	if (callback) callback(props, forge);

	return rendered;
}
