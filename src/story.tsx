// Packages
import { AppForge } from "@root/forge";
import Vide from "@rbxts/vide";

// Types
import type Types from "@root/types";

export default function Story({
	props,
	target,
	render,
	callback,
}: {
	props: AppProps;
	target: GuiObject;
	render?: Types.Render.Props;
	callback?: (props: AppProps, Forge: AppForge) => void;
}) {
	const forge = new AppForge();
	const rendered = <forge.story props={props} target={target} renders={render} />;

	if (callback) callback(props, forge);

	return rendered;
}
