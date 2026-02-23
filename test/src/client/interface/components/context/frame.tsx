// Packages
import { useForgeContext } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

export default function ContextFrame({
	size,
	anchor,
	position,
	children,
}: {
	size?: UDim2 | (() => UDim2);
	anchor?: Vector2 | (() => Vector2);
	position?: UDim2 | (() => UDim2);
	children?: AppForge.Node;
}) {
	const { props, source } = useForgeContext();
	const { px } = props;

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			Size={size ?? (() => UDim2.fromOffset(px(200), px(200)))}
			AnchorPoint={anchor ?? new Vector2(0.5, 0.5)}
			Position={
				position ??
				spring(
					() => {
						const yScale = source() ? 0.5 : 1.5;
						return UDim2.fromScale(0.5, yScale);
					},
					0.5,
					0.75,
				)[0]
			}
		>
			{children}
		</frame>
	);
}
