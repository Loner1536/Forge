// Services
import { Players } from "@rbxts/services";

// Packages
import { Controller, OnInit } from "@flamework/core";
import Vide, { mount } from "@rbxts/vide";
import AppForge from "@rbxts/forge";
@Controller({ loadOrder: 1 })
export default class AppController implements OnInit {
	onInit() {
		const props = this.createProps(Players.LocalPlayer!);
		const forge = new AppForge();

		mount(() => {
			return (
				<screengui Name={"App Tree"} ResetOnSpawn={false} IgnoreGuiInset>
					<forge.render props={{ props, renders: { name: "Parent", group: "Rules" } }} />
				</screengui>
			);
		}, Players.LocalPlayer.WaitForChild("PlayerGui"));
	}

	public createProps(player: Player) {
		const local_player = Players.LocalPlayer ?? player;

		if (!player) error("No LocalPlayer nor MockedPlayer found for AppController props");

		return {
			player: local_player,
		} as const satisfies AppProps;
	}
}
