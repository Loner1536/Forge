// Packages
import { useChildForgeContext } from "@rbxts/forge";
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
	const { props, source } = useChildForgeContext();
	const { px } = props;

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 0, 0)}
			Size={size ?? (() => UDim2.fromOffset(px(200), px(200)))}
			AnchorPoint={anchor ?? new Vector2(1, 0.5)}
			Position={
				position ??
				spring(
					() => {
						const xOffset = source() ? 0 : 100;
						return new UDim2(0, px(xOffset), 0.5, 0);
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
