// Services
import { Players } from "@rbxts/services";

const mockedPlayer = { name: "MockedPlayer", UserId: 123 } as Partial<Player>;

export default function createProps(plr?: Player) {
	const player = Players.LocalPlayer ?? plr ?? mockedPlayer;

	return { player } as const satisfies AppProps;
}
