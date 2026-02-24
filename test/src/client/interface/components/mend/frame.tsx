// Packages
import { useAppContext } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

export type FrameArgs = { color: Color3 };

export default function MendFrame({
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
	const { props, color, source } = useAppContext<FrameArgs>();
	const { px } = props;

	return (
		<frame
			BackgroundColor3={color}
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
