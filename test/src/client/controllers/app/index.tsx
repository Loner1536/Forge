// Services
import { Players } from "@rbxts/services";

// Packages
import { Controller, OnInit } from "@flamework/core";
import Vide, { mount } from "@rbxts/vide";
import AppForge from "@rbxts/forge";

// Dependencies
import createProps from "./createProps";

@Controller({ loadOrder: 1 })
export default class AppController implements OnInit {
	onInit() {
		const props = createProps();
		const forge = new AppForge();

		mount(() => {
			return (
				<screengui Name={"App Tree"} ResetOnSpawn={false} IgnoreGuiInset>
					<forge.render props={{ props, renders: { name: "Parent", group: "Rule" } }} />
				</screengui>
			);
		}, Players.LocalPlayer.WaitForChild("PlayerGui"));
	}
}
