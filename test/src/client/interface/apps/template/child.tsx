// Packages
import { App, Args } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

@App({
	name: "Child",
	rules: {
		parent: "Template",
		anchor: true,
	},
})
export default class Child extends Args {
	render() {
		const { px, forge } = this.props;

		const [position, _] = spring(
			() => {
				const parentSource = forge.getSource("Template");

				const xScale = parentSource() && this.source() ? 0 : 1;
				return UDim2.fromScale(xScale, 0.5);
			},
			0.6,
			0.8,
		);

		return (
			<frame
				Name={"Child"}
				BackgroundColor3={Color3.fromRGB(150, 150, 150)}
				Size={() => UDim2.fromOffset(px(100), px(175))}
				AnchorPoint={new Vector2(1, 0.5)}
				Position={position}
			/>
		);
	}
}
