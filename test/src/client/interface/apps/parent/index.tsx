// Packages
import { App, Args, Fade } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

@Fade(0.25)
@App({
	name: "Parent",
	group: "Rules",
	visible: true,

	rules: {},
})
export default class Parent extends Args {
	render() {
		const { px } = this.props;

		const [position, _] = spring(
			() => {
				const yScale = this.source() ? 0.5 : 1.5;
				return UDim2.fromScale(0.5, yScale);
			},
			1,
			0.6,
		);

		return (
			<frame
				Size={() => UDim2.fromOffset(px(200), px(200))}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={position}
				ZIndex={10}
			>
				<uicorner CornerRadius={() => new UDim(0, px(15))} />

				<textbutton
					Name={"Button"}
					BackgroundColor3={Color3.fromRGB(30, 30, 30)}
					AnchorPoint={new Vector2(0.5, 1)}
					Position={() => new UDim2(0.5, 0, 1, -px(5))}
					Size={() => UDim2.fromOffset(px(100), px(50))}
					Activated={() => this.forge.toggle("Child", "Rules")}
				>
					<uicorner CornerRadius={() => new UDim(0, px(15))} />
				</textbutton>
			</frame>
		);
	}
}
