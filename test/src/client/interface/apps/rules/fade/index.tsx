// Packages
import { App, Args, Fade } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

// Components
@Fade(0.25)
@App({
	name: "Fade",
	group: "Rule",
	visible: true,
})
export default class Template extends Args {
	render(): AppForge.Node {
		const { px } = this.props;

		const [size, _s] = spring(
			() => {
				const scale = this.source() ? 1 : 0;
				return UDim2.fromOffset(px(200 * scale), px(200 * scale));
			},
			0.5,
			0.75,
		);
		const [position, _p] = spring(
			() => {
				const yScale = this.source() ? 0.5 : 1.5;
				return UDim2.fromScale(0.5, yScale);
			},
			0.5,
			0.75,
		);

		return (
			<frame Size={size} AnchorPoint={new Vector2(0.5, 0.5)} Position={position} ZIndex={10}>
				<uicorner CornerRadius={() => new UDim(0, px(15))} />
			</frame>
		);
	}
}
