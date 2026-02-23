// Packages
import { ChildApp, ChildArgs, ChildAppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

// Components
import ContextChildFrame from "@interface/components/context/childFrame";

@ChildApp({
	name: "ChildContext",
	group: "Feature",

	rules: {
		parent: "Context",
		parentGroup: "Feature",

		anchor: true,
	},
})
export default class ChildContext extends ChildArgs {
	render(): AppForge.Node {
		const { px } = this.props;

		return (
			<Provider context={ChildAppContext} value={this}>
				{() => (
					<>
						<ContextChildFrame size={() => UDim2.fromOffset(px(100), px(175))}>
							<uicorner CornerRadius={() => new UDim(0, px(15))} />
						</ContextChildFrame>
					</>
				)}
			</Provider>
		);
	}
}
