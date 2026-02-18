// Types
import type { Args } from "./appRegistry";
import type AppForge from "./forge";

declare namespace Types {
	namespace Props {
		type NameSelector =
			| { name: AppNames; names?: never }
			| { names: AppNames[]; name?: never }
			| { name?: undefined; names?: undefined };

		type GroupSelector =
			| { group: AppGroups; groups?: never }
			| { groups: AppGroups[]; group?: never }
			| { group?: undefined; groups?: undefined };

		export type Render = NameSelector & GroupSelector;

		type Main = {
			props: AppProps;
			forge: AppForge;
			config?: {
				px: {
					target?: GuiObject | Camera;
					resolution?: Vector2;
					minScale?: number;
				};
			};
			renders?: Render;
		};

		type Class = AppProps & {
			forge: AppForge;
			px: typeof import("./hooks/usePx").px;
		};
	}

	namespace AppRegistry {
		type Props<N extends AppNames> = {
			name: N;
			visible?: boolean;
			group?: AppGroups;
			rules?: Rules.Generic<N>;
		};

		type Static = {
			constructor: new (props: Types.Props.Main, name: AppNames, group?: AppGroups) => Args;

			visible?: boolean;
			group?: AppGroups;
			rules?: Rules.Static;
		};

		type Generic<N extends AppNames = AppNames> = {
			constructor: new (props: Types.Props.Main, name: AppNames, group?: AppGroups) => Args;

			visible?: boolean;
			group?: AppGroups;
			rules?: Rules.Generic<N>;
		};
	}

	namespace Rules {
		type WithParent<P> = {
			parent: P;

			parentGroup?: AppGroups;
			anchor?: boolean;
		};

		type WithoutParent = {
			parent?: never;

			parentGroup?: never;
			anchor?: never;
		};

		export type Static = {
			exclusiveGroup?: string;
			zIndex?: number;
		} & (WithParent<string> | WithoutParent);

		export type Generic<N extends AppNames = AppNames> = {
			exclusiveGroup?: AppGroups;
			zIndex?: number;
		} & (WithParent<Exclude<AppNames, N>> | WithoutParent);
	}
}

export type ForgeProps = Types.Props.Main;
export type ClassProps = Types.Props.Class;
export type RenderProps = Types.Props.Render;

export default Types;
