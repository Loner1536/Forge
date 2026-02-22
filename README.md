# @rbxts/forge

A decorator-based UI framework for [roblox-ts](https://roblox-ts.com/) that manages app registration, parent/child relationships, visibility state, and fade transitions — built on top of [Vide](https://github.com/centau/vide).

> **Issues or bugs?** Tag `@Xynz` or `@Loner71x` in the roblox-ts Discord server.

---

## Installation

```bash
npm install @rbxts/forge
```

---

## Setup

### `global.d.ts`

> ⚠️ **Required.** This file must exist at the root of your project. It defines the global type system Forge uses to enforce type-safe app names, groups, and props across your entire codebase.

```ts
declare global {
    type AppGroups = "Rules";
    type AppNames = "Parent" | "Child" | "Fade";
    type AppProps = {
        player: Player;
    };
}
export {};
```

| Type | Description |
|------|-------------|
| `AppGroups` | Union of every group name used in your project |
| `AppNames` | Union of every app/component name |
| `AppProps` | Shared props passed to all components (e.g. `player`) |

---

## Decorators

### `@App(config)`

Registers a class as a **root-level UI app**. Each `name + group` combination must be unique — Forge will throw a runtime error on duplicates.

```ts
@App({
    name: AppNames,       // Required
    group?: AppGroups,    // Defaults to "None"
    visible?: boolean,    // Defaults to false
    zIndex?: number,      // Defaults to 1
    rules?: {
        exclusiveGroup?: AppGroups, // ⚠️ Experimental
    }
})
```

---

### `@ChildApp(config)`

Registers a class as a **child UI app** linked to a parent. The child is rendered inside the parent's container. If `anchor: true`, the child's instance is placed inside a transparent copy of the parent's rendered frame, letting it position itself relative to the parent's layout.

```ts
@ChildApp({
    name: AppNames,       // Required
    group?: AppGroups,    // Defaults to "None"
    visible?: boolean,    // Defaults to false
    zIndex?: number,      // Defaults to 0
    rules: {
        parent: AppNames,           // Required
        parentGroup?: AppGroups,    // Defaults to "None"
        anchor?: boolean,           // Defaults to false
        exclusiveGroup?: AppGroups, // ⚠️ Experimental
    }
})
```

---

### `@Fade(period?, dampeningRatio?)`

Wraps an app in a spring-driven transparency fade. Must be placed **above** `@App` or `@ChildApp`. Both parameters are optional.

```ts
@Fade(0.25, 0.75)
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `period` | `0.5` | Spring period (controls speed) |
| `dampeningRatio` | `0.75` | How quickly the spring settles |

**Decorator order matters** — `@Fade` must always be outermost:

```ts
@Fade(0.25)   // ← always outermost
@App({ ... }) // ← always innermost
export default class MyApp extends Args { ... }
```

---

## Base Classes

### `Args` — for `@App`

```ts
export default class MyApp extends Args {
    render() { ... }
}
```

### `ChildArgs` — for `@ChildApp`

```ts
export default class MyChild extends ChildArgs {
    render() { ... }
}
```

Both expose the following on `this`:

| Property | Type | Description |
|----------|------|-------------|
| `forge` | `CreateForge` | The Forge controller — open, close, toggle, bind other apps |
| `source` | `Source<boolean>` | Reactive visibility state for **this** app |
| `props.player` | `Player` | The player passed in from `AppProps` |
| `props.px` | `px` | Pixel-scaling utility (see [px & screen](#px--screen)) |
| `props.screen` | `Source<Vector2>` | Reactive current screen size |
| `name` | `AppNames` | This app's registered name |
| `group` | `AppGroups` | This app's registered group (`"None"` if unset) |

`ChildArgs` additionally exposes:

| Property | Type | Description |
|----------|------|-------------|
| `parentSource` | `Source<boolean>` | Reactive visibility state of the **parent** app |

---

## Forge Controller

`this.forge` (and the `CreateForge` instance you create) exposes these methods:

```ts
forge.open("Child", "Rules")          // Set visibility to true
forge.close("Child", "Rules")         // Set visibility to false
forge.toggle("Child", "Rules")        // Flip current visibility
forge.set("Child", "Rules", true)     // Set visibility to an explicit value

// Bind an external Vide Source<boolean> directly to an app's visibility.
// Useful for wiring UI-Labs story controls.
forge.bind("Parent", "Rules", mySource)

// Render all registered apps (or a filtered subset) into a Vide tree
forge.render({ props: { props, renders } })

// Render into a story target (for UI-Labs)
forge.story({ props, target, renders, config })
```

The `group` parameter defaults to `"None"` on all methods if omitted.

---

## px & screen

`px` and `screen` are injected into `this.props` automatically. You do **not** need to call `usePx()` manually — Forge initializes it internally when you call `render()` or `story()`.

### `px(value)`

Scales a pixel value relative to the current viewport, using a base resolution of `1920×1080` and an equal blend of width and height scaling. Minimum scale defaults to `0.5`.

```ts
const { px } = this.props;

px(200)         // scaled integer (math.round)
px.scale(200)   // unrounded float
px.even(200)    // rounded to nearest even number
px.floor(200)   // math.floor
px.ceil(200)    // math.ceil
```

### `screen`

A reactive `Source<Vector2>` that holds the **current screen/viewport size** and updates automatically on resize.

```ts
const { screen } = this.props;

screen() // → e.g. Vector2.new(1920, 1080)
```

---

## Rendering In-Game

Create a `CreateForge` instance and call `forge.render()` inside a Vide `mount`. Use `renders` to filter which apps are loaded — omit it to render everything registered.

```ts
// controllers/app.ts
onInit() {
    const props = this.createProps(Players.LocalPlayer!);
    const forge = new CreateForge();

    mount(() => (
        <screengui Name={"App Tree"} ResetOnSpawn={false} IgnoreGuiInset>
            <forge.render props={{ props, renders: { name: "Parent", group: "Rules" } }} />
        </screengui>
    ), Players.LocalPlayer.WaitForChild("PlayerGui"));
}

public createProps(player: Player): AppProps {
    return { player } as const satisfies AppProps;
}
```

The `renders` filter supports:

```ts
renders?: {
    name?: AppNames        // single app by name
    names?: AppNames[]     // multiple apps by name
    group?: AppGroups      // all apps in a group
    groups?: AppGroups[]   // all apps in multiple groups
}
```

---

## UI-Labs / Stories

Use `forge.story()` for previewing components in [UI-Labs](https://github.com/flipbook-labs/ui-labs).

### Shared Setup Component

```ts
// setup.tsx
import { CreateForge, type RenderProps } from "@rbxts/forge";
import Vide from "@rbxts/vide";
import type { InferProps } from "@rbxts/ui-labs";
import { Flamework } from "@flamework/core";

const mockedPlayer = {
    Name: "UI-Labs",
    UserId: 123456,
} as const satisfies Partial<Player> as Player;

// Must point to your apps folder so all decorators run before CreateForge is constructed
Flamework.addPaths("src/client/interface/apps");

export default function Setup<T extends InferProps<{}>>({
    storyProps,
    callback,
    render,
}: {
    storyProps: T;
    callback?: (props: AppProps, forge: CreateForge) => void;
    render?: RenderProps;
}) {
    const forge = new CreateForge();
    const props = { player: mockedPlayer } as AppProps;
    if (callback) callback(props, forge);
    return <forge.story props={props} target={storyProps.target} renders={render} />;
}
```

> ⚠️ `Flamework.addPaths()` must run before `new CreateForge()` — otherwise decorators won't have had a chance to register and the AppRegistry will be empty.

### Writing a Story

Use `forge.bind()` in the `callback` to wire UI-Labs boolean controls to app visibility:

```ts
// parent.story.tsx
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";
import Setup from "../setup";

const controls = {
    Parent: ControlGroup({ visible: Boolean(true) }),
    Child: ControlGroup({ visible: Boolean(false) }),
};

const story = CreateVideStory({ vide: Vide, controls }, (props: InferVideProps<typeof controls>) => (
    <Setup
        storyProps={props}
        render={{ name: "Parent", group: "Rules" }}
        callback={(_, forge) => {
            forge.bind("Parent", "Rules", props.controls.Parent.visible);
            forge.bind("Child", "Rules", props.controls.Child.visible);
        }}
    />
));

export = story;
```

---

## Full Example

### Parent App

```ts
@Fade(0.25)
@App({ name: "Parent", group: "Rules", visible: true, rules: {} })
export default class Parent extends Args {
    render() {
        const { px } = this.props;
        const [position] = spring(
            () => UDim2.fromScale(0.5, this.source() ? 0.5 : 1.5),
            1, 0.6,
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
```

### Child App

```ts
@Fade()
@ChildApp({
    name: "Child",
    group: "Rules",
    rules: { parent: "Parent", parentGroup: "Rules", anchor: true },
})
export default class Child extends ChildArgs {
    render() {
        const { px } = this.props;
        const [position] = spring(
            () => UDim2.fromScale(this.source() ? 0 : 1, 0.5),
            0.6, 0.8,
        );
        return (
            <frame
                BackgroundColor3={Color3.fromRGB(150, 150, 150)}
                Size={() => UDim2.fromOffset(px(100), px(175))}
                AnchorPoint={new Vector2(1, 0.5)}
                Position={position}
            >
                <textbutton
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
```

---

## Notes

- `global.d.ts` with `AppGroups`, `AppNames`, and `AppProps` is **required** — the package will not work without it.
- App `name + group` combinations must be **globally unique**. Forge throws a runtime error on duplicate registration.
- `exclusiveGroup` in `rules` is **experimental** and may produce unexpected behavior.
- A test folder is available in the repository for reference implementations.

---

## License

MIT
