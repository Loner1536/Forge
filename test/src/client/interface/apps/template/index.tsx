// Packages
import Vide, { spring } from "@rbxts/vide";
import { App, Args } from "@rbxts/forge";

@App({
	name: "Template",
	visible: true,
})
export default class Template extends Args {
	render() {
		const { px, forge } = this.props;

		const [position, _] = spring(
			() => {
				const yScale = this.source() ? 0.5 : 1.5;
				return UDim2.fromScale(0.5, yScale);
			},
			0.4,
			0.6,
		);

		return (
			<frame
				Name={"Template"}
				Size={() => UDim2.fromOffset(px(200), px(200))}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={position}
				ZIndex={10}
			>
				<textbutton
					Name={"Button"}
					BackgroundColor3={Color3.fromRGB(30, 30, 30)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={UDim2.fromScale(0.5, 0.5)}
					Size={() => UDim2.fromOffset(px(100), px(50))}
					Activated={() => forge.toggle("Child")}
				>
					<uicorner CornerRadius={() => new UDim(0, px(15))} />
				</textbutton>
			</frame>
		);
	}
}
