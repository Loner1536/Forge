// Packages
import { App, Args, AppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

// Components
import ContextFrame from "@interface/components/context/frame";

@App({
	name: "Context",
	group: "Feature",
})
export default class Context extends Args {
	render(): AppForge.Node {
		const { px } = this.props;

		return (
			<Provider context={AppContext} value={this}>
				{() => (
					<>
						<ContextFrame>
							<uicorner CornerRadius={() => new UDim(0, px(15))} />
						</ContextFrame>
					</>
				)}
			</Provider>
		);
	}
}
