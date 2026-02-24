// Packages
import { App, Args, AppContext, MendArgs } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

// Components
import ContextFrame, { FrameArgs } from "@interface/components/mend/frame";

@App({
	name: "Mend",
	group: "Feature",
})
export default class Mend extends Args implements MendArgs<FrameArgs> {
	color: Color3 = Color3.fromRGB(0, 255, 0);

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
