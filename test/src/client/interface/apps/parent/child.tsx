// Packages
import { ChildApp, ChildArgs } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

@ChildApp({
	name: "Child",
	group: "Rules",
	rules: {
		parent: "Parent",
		parentGroup: "Rules",

		anchor: true,
	},
})
export default class Child extends ChildArgs {
	render() {
		const { px } = this.props;

		const [position, _] = spring(
			() => {
				const xScale = this.source() ? 0 : 1;
				return UDim2.fromScale(xScale, 0.5);
			},
			0.4,
			0.8,
		);

		return (
			<frame
				BackgroundColor3={Color3.fromRGB(150, 150, 150)}
				Size={() => UDim2.fromOffset(px(100), px(175))}
				AnchorPoint={new Vector2(1, 0.5)}
				Position={position}
			>
				<textbutton
					Name={"Button"}
					BackgroundColor3={Color3.fromRGB(30, 30, 30)}
					AnchorPoint={new Vector2(0.5, 1)}
					Position={() => new UDim2(0.5, 0, 1, -px(5))}
					Size={() => UDim2.fromOffset(px(100), px(50))}
				>
					<uicorner CornerRadius={() => new UDim(0, px(15))} />
				</textbutton>
			</frame>
		);
	}
}
