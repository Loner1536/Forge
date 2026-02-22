// Types
import type Types from "@root/types";

// Dependencies
import { AppRegistry } from "@registries/apps";

export default function Fade(period?: number, dampeningRatio?: number) {
	return function <T extends new (...args: any[]) => {}>(ctor: T) {
		(ctor as Types.Fade.Constructor).__forge_fade = {
			period: period ?? 0.5,
			dampeningRatio: dampeningRatio ?? 0.75,
		};

		AppRegistry.forEach((groupMap) => {
			groupMap.forEach((entry) => {
				if ((entry.constructor as unknown as T) === ctor) {
					entry.fade = (ctor as Types.Fade.Constructor).__forge_fade;
				}
			});
		});

		return ctor;
	};
}
