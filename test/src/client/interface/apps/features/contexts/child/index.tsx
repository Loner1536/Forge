// Packages
import { App, Args } from "@rbxts/forge";
import Vide from "@rbxts/vide";

@App({
	name: "Contexts",
})
export default class ChildContexts extends Args {
	render(): AppForge.Node {
		return <frame />;
	}
}
