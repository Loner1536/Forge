// Packages
import { ChildApp, ChildArgs } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

@ChildApp({
	name: "Child",
	group: "Rule",
	rules: {
		parent: "Parent",
		parentGroup: "Rule",

		anchor: true,
	},
})
export default class Child extends ChildArgs {
	public test = 1;

	render(): AppForge.Node {
		const { px } = this.props;

		const [size, _s] = spring(
			() => {
				const scale = this.source() ? 1 : 0;
				return UDim2.fromOffset(px(100 * scale), px(175 * scale));
			},
			0.4,
			0.75,
		);
		const [position, _p] = spring(
			() => {
				const xScale = this.source() ? 0 : 1;
				return new UDim2(xScale, -px(5), 0.5, 0);
			},
			0.4,
			0.75,
		);

		return (
			<frame
				BackgroundColor3={Color3.fromRGB(150, 150, 150)}
				Size={size}
				AnchorPoint={new Vector2(1, 0.5)}
				Position={position}
			>
				<uicorner CornerRadius={() => new UDim(0, px(15))} />
			</frame>
		);
	}
}
