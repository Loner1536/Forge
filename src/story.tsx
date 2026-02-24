// Packages
import { AppForge } from "@root/forge";
import Vide from "@rbxts/vide";
import Logger from "./logger";

// Types
import type Types from "@root/types";

export default function Story({
	debug,
	props,
	target,
	render,
	callback,
}: {
	debug?: boolean;
	props: AppProps;
	target: GuiObject;
	render?: Types.Render.Props;
	callback?: (props: AppProps, Forge: AppForge) => void;
}) {
	if (debug) Logger.setDebug(true);

	const forge = new AppForge();
	const rendered = <forge.story props={props} target={target} renders={render} />;

	if (callback) callback(props, forge);

	return rendered;
}
