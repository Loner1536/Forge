# @rbxts/forge

A decorator-based UI framework for [roblox-ts](https://roblox-ts.com/) that manages app registration, parent/child relationships, visibility state, rules, and fade transitions — built on top of [Vide](https://github.com/centau/vide).

> **Issues or bugs?** Tag `@Xynz` or `@Loner71x` in the roblox-ts Discord server.

---

## Installation

```bash
npm install @rbxts/forge
```

---

## Setup

### `global.d.ts`

> ⚠️ **Required.** This file must exist at the root of your project before anything else. It defines the global type system Forge uses to enforce type-safe app names, groups, and props across your entire codebase.

```ts
declare global {
    type AppGroups = "HUD" | "Menus";
    type AppNames = "Inventory" | "Settings" | "Tooltip";
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
| `AppProps` | Shared props passed to every component (e.g. `player`) |

The package also exposes a global `AppForge` namespace with shared utility types:

| Type | Description |
|------|-------------|
| `AppForge.AppNode` | The return type for `render()` — equivalent to `Vide.Node` |

Use `AppForge.AppNode` as the return type of your `render()` method:

```ts
export default class MyApp extends Args {
    render(): AppForge.AppNode {
        return <frame />;
    }
}
```

---

## Decorators

### `@App(config)`

Registers a class as a **root-level UI app**. Each `name + group` combination must be globally unique — Forge throws a runtime error on duplicates.

```ts
@App({
    name: AppNames,       // Required
    group?: AppGroups,    // Defaults to "None"
    visible?: boolean,    // Defaults to false
    zIndex?: number,      // Defaults to 1
    rules?: {},           // Optional — reserved for future rule types
})
```

---

### `@ChildApp(config)`

Registers a class as a **child UI app** linked to a parent. The child is rendered inside the parent's container.

If `anchor: true`, the child's instance is placed inside a transparent clone of the parent's rendered frame — allowing the child to position itself relative to the parent's layout without inheriting its properties.

```ts
@ChildApp({
    name: AppNames,       // Required
    group?: AppGroups,    // Defaults to "None"
    visible?: boolean,    // Defaults to false
    zIndex?: number,      // Defaults to 0
    rules: {              // Required
        parent: AppNames,           // Required — the parent app's name
        parentGroup?: AppGroups,    // Defaults to "None"
        anchor?: boolean,           // Defaults to false
    }
})
```

---

### `@Fade(period?, dampeningRatio?)`

Wraps an app in a **spring-driven transparency fade** using a `CanvasGroup`. Must be placed **above** `@App` or `@ChildApp`.

```ts
@Fade(0.25, 0.75)
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `period` | `0.5` | Spring period in seconds — lower is faster |
| `dampeningRatio` | `0.75` | How quickly the spring settles — `1` = no overshoot |

**Decorator order matters** — `@Fade` must always be the outermost decorator:

```ts
@Fade(0.25)   // ← outermost
@App({ ... }) // ← innermost
export default class MyApp extends Args { ... }
```

---

## Base Classes

### `Args` — use with `@App`

```ts
export default class MyApp extends Args {
    render(): AppForge.AppNode { ... }
}
```

### `ChildArgs` — use with `@ChildApp`

```ts
export default class MyChild extends ChildArgs {
    render(): AppForge.AppNode { ... }
}
```

Both expose the following on `this`:

| Property | Type | Description |
|----------|------|-------------|
| `forge` | `AppForge` | The Forge controller — open, close, toggle, bind other apps |
| `source` | `Source<boolean>` | Reactive visibility state for **this** app |
| `name` | `AppNames` | This app's registered name |
| `group` | `AppGroups` | This app's registered group (`"None"` if unset) |
| `props.px` | `px` | Pixel-scaling utility (see [px & screen](#px--screen)) |
| `props.screen` | `Source<Vector2>` | Reactive current screen/viewport size |
| `props.[...AppProps]` | — | Everything from your global `AppProps` (e.g. `props.player`) |

`ChildArgs` additionally exposes:

| Property | Type | Description |
|----------|------|-------------|
| `parentSource` | `Source<boolean>` | Reactive visibility state of the **parent** app |

---

## Forge Controller

`this.forge` (and the `AppForge` instance you create) exposes these methods:

```ts
forge.open("Inventory", "HUD")            // Set visibility to true
forge.close("Inventory", "HUD")           // Set visibility to false
forge.toggle("Inventory", "HUD")          // Flip current visibility
forge.set("Inventory", "HUD", true)       // Set to an explicit boolean value

// Sync an external Vide Source<boolean> into an app's visibility.
// The external source drives the internal one — rules still apply on top.
forge.bind("Inventory", "HUD", mySource)

// Render registered apps into a Vide tree (used in-game)
forge.render({ props: { props, renders } })

// Render into a story container (used with UI-Labs)
forge.story({ props, target, renders, config })
```

The `group` parameter defaults to `"None"` on all methods if omitted.

> **Note on `bind`:** `bind` creates a one-way sync — the external source pushes into the internal one. Rules still fire on top of whatever the bound source sets. This means if a rule closes an app, the external source stays at its current value and will re-apply when it next changes.

---

## Rules

Rules are logic that Forge automatically applies whenever an app's visibility changes. They are set up via `setupRuleEffects` after rendering and fire reactively through Vide's `effect` system.

### ParentRule

The only active rule currently. It enforces a visibility relationship between parent and child apps:

**When a parent closes:**
- Each child's current visibility is cached
- All children are closed

**When a parent opens:**
- Each child is restored to its cached visibility state

**While a parent is closed:**
- If a child's visibility is changed (e.g. via `forge.set` or `forge.bind`), the cache updates to reflect the new desired state
- When the parent opens, the child will restore to this updated value

This means the cache always represents **what the child wants to be** when the parent is visible again — not just what it was when the parent closed.

```ts
// Example behavior:
// Parent open, Child open → close parent → child closes, cache = true
// While parent closed → forge.close("Child") → cache updates to false
// Open parent → child stays closed (cache was false)

// Parent open, Child open → close parent → child closes, cache = true
// While parent closed → forge.open("Child") → cache updates to true
// Open parent → child reopens (cache was true)
```

---

## Contexts & useForgeContext

Forge exposes two Vide contexts that let components deep in your tree access app data without prop drilling.

### `AppContext` — for root apps (`Args`)

Use this inside apps decorated with `@App`. Set up a `Provider` in your `render()` and pass `this` as the value:

```ts
import AppForge, { Args, App, Fade, AppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

@Fade(0.25)
@App({ name: "Inventory", group: "HUD", visible: true })
export default class Inventory extends Args {
    render(): AppForge.AppNode {
        return (
            <frame Size={UDim2.fromScale(1, 1)}>
                <Provider context={AppContext} value={this}>
                    {() => <TooltipButton />}
                </Provider>
            </frame>
        );
    }
}
```

### `ChildAppContext` — for child apps (`ChildArgs`)

Use this inside apps decorated with `@ChildApp` when you need to expose `parentSource` to descendants:

```ts
import { ChildArgs, ChildApp, ChildAppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

@ChildApp({ name: "Tooltip", group: "HUD", rules: { parent: "Inventory", parentGroup: "HUD" } })
export default class Tooltip extends ChildArgs {
    render(): AppForge.AppNode {
        return (
            <frame>
                <Provider context={ChildAppContext} value={this}>
                    {() => <TooltipContent />}
                </Provider>
            </frame>
        );
    }
}
```

### `useForgeContext()` — consuming root app context

Call inside any component nested under an `AppContext` provider:

```ts
import { useForgeContext } from "@rbxts/forge";

export function TooltipButton() {
    const { props, forge, source, name, group } = useForgeContext();
    const { px } = props;

    return (
        <textbutton
            Size={() => UDim2.fromOffset(px(100), px(40))}
            Activated={() => forge.toggle("Tooltip", "HUD")}
        />
    );
}
```

### `useChildForgeContext()` — consuming child app context

Call inside any component nested under a `ChildAppContext` provider:

```ts
import { useChildForgeContext } from "@rbxts/forge";

export function TooltipContent() {
    const { props, forge, source, parentSource } = useChildForgeContext();
    const { px } = props;

    return (
        <frame Size={() => UDim2.fromOffset(px(200), px(100))} />
    );
}
```

Both hooks throw a descriptive runtime error with a traceback if called outside their respective provider.

| Hook | Context | Returns |
|------|---------|---------|
| `useForgeContext()` | `AppContext` | `forge`, `props`, `source`, `name`, `group` |
| `useChildForgeContext()` | `ChildAppContext` | `forge`, `props`, `source`, `name`, `group`, `parentSource` |

---

## px & screen

`px` and `screen` are injected into `this.props` automatically. You do **not** need to call `usePx()` manually — Forge initializes it internally when `render()` or `story()` is called.

### `px(value)`

Scales a pixel value relative to the current viewport using a base resolution of `1920×1080` and an equal blend of width/height scaling. Minimum scale defaults to `0.5`.

```ts
const { px } = this.props;

px(200)         // scaled integer (math.round)
px.scale(200)   // unrounded float
px.even(200)    // rounded to nearest even number
px.floor(200)   // math.floor
px.ceil(200)    // math.ceil
```

### `screen`

A reactive `Source<Vector2>` holding the **current size** of the render target. Updates automatically when the viewport or GuiObject resizes.

```ts
const { screen } = this.props;
screen() // → e.g. Vector2.new(1920, 1080)
```

---

## Config (optional)

Both `render()` and `story()` accept an optional `config` to override px defaults:

```ts
type Config = {
    px?: {
        target?: GuiObject | Camera  // defaults to Workspace.CurrentCamera
        resolution?: Vector2         // defaults to Vector2.new(1920, 1080)
        minScale?: number            // defaults to 0.5
    }
}
```

---

## renders Filter (optional)

Both `render()` and `story()` accept an optional `renders` filter to control which registered apps are loaded. `name`/`names` and `group`/`groups` are mutually exclusive in each pair — the type system enforces this.

```ts
renders: { name: "Inventory" }
renders: { names: ["Inventory", "Settings"] }
renders: { group: "HUD" }
renders: { groups: ["HUD", "Menus"] }
renders: { name: "Inventory", group: "HUD" }
renders: { names: ["Inventory", "Settings"], group: "HUD" }
```

Omitting `renders` entirely loads **all** registered apps.

---

## Logger

Forge includes a built-in logger for debug output and render timing. Debug mode is **off by default** — all `debug` and `time` calls are silent in production.

```ts
import AppForge, { Logger } from "@rbxts/forge";

Logger.setDebug(true); // enable before constructing AppForge
```

| Method | Always fires | Description |
|--------|-------------|-------------|
| `Logger.debug(context, message)` | No | Prints only when debug is enabled |
| `Logger.warn(context, message)` | Yes | Always prints a warning |
| `Logger.error(context, message)` | Yes | Always throws an error |
| `Logger.time(context, name, fn)` | No | Times `fn` and prints result when debug is enabled |

When debug is enabled, Forge automatically logs render timing for every app and total load time:

```
[Forge][Renders]: "HUD:Inventory" rendered in 0.0003s
[Forge][Renders]: "HUD:Tooltip" rendered in 0.0001s
[Forge][Renders]: Load completed in 0.0008s — 2 app(s) rendered
```

---

## Exported Types

```ts
import type { ForgeProps, ClassProps, RenderProps } from "@rbxts/forge";
```

| Export | Description |
|--------|-------------|
| `ForgeProps` | Full props object for `render()` and `story()` — includes `props`, `forge`, `config`, `renders` |
| `ClassProps` | What `this.props` looks like inside a component — your `AppProps` plus `px` and `screen` |
| `RenderProps` | The `renders` filter object |

---

## Exports Reference

```ts
import AppForge, {
    // Decorators
    App, ChildApp, Fade,
    // Base classes
    Args, ChildArgs,
    // Contexts
    AppContext, ChildAppContext,
    // Hooks
    useForgeContext, useChildForgeContext,
    // Story component
    Story,
    // Logger
    Logger,
} from "@rbxts/forge";
```

---

## Rendering In-Game

```ts
// client/controllers/app.ts
onInit() {
    const forge = new AppForge();
    const props = { player: Players.LocalPlayer } as AppProps;

    mount(() => (
        <screengui Name="App Tree" ResetOnSpawn={false} IgnoreGuiInset>
            <forge.render props={{ props, renders: { group: "HUD" } }} />
        </screengui>
    ), Players.LocalPlayer.WaitForChild("PlayerGui"));
}
```

---

## UI-Labs / Stories

Use `forge.story()` for previewing components with [UI-Labs](https://github.com/PepeElToro41/ui-labs) — a storybook plugin for Roblox. Get the plugin on the [Roblox Store](https://create.roblox.com/store/asset/14293316215/UI-Labs) and the roblox-ts package on [npm](https://www.npmjs.com/package/@rbxts/ui-labs).

Forge exports a `Story` component you can use directly in your story files. It handles `AppForge` construction and the `forge.story()` call for you.

> ⚠️ **`Flamework.addPaths()` must be a string literal** pointing to your apps folder and must be called before `Story` renders. Flamework transforms it at compile time — you cannot pass a dynamic string. This means it must live in your project, not inside the package.

### Story Example

```ts
// src/client/interface/stories/inventory.story.tsx
import { Boolean, ControlGroup, CreateVideStory, type InferVideProps } from "@rbxts/ui-labs";
import { Flamework } from "@flamework/core";
import { Story } from "@rbxts/forge";
import Vide from "@rbxts/vide";

// Must be a string literal — points to your apps folder
Flamework.addPaths("src/client/interface/apps");

const controls = {
    Inventory: ControlGroup({
        visible: Boolean(true),
    }),
    Tooltip: ControlGroup({
        visible: Boolean(false),
    }),
};

const story = CreateVideStory(
    { vide: Vide, controls },
    (props: InferVideProps<typeof controls>) => (
        <Story
            target={props.target}
            render={{ name: "Inventory", group: "HUD" }}
            callback={(_, forge) => {
                forge.bind("Inventory", "HUD", props.controls.Inventory.visible);
                forge.bind("Tooltip", "HUD", props.controls.Tooltip.visible);
            }}
        />
    ),
);

export = story;
```

`forge.bind()` wires UI-Labs controls directly to app visibility. Rules still apply on top — so if `Inventory` closes while `Tooltip` is open, `ParentRule` will cache and close `Tooltip` correctly regardless of the bound control's value.

---

## Full Examples

### Root App with Fade and Context

```ts
// src/client/interface/apps/inventory.ts
import AppForge, { App, Args, Fade, AppContext } from "@rbxts/forge";
import Vide, { Provider, spring } from "@rbxts/vide";

@Fade(0.25)
@App({
    name: "Inventory",
    group: "HUD",
    visible: true,
})
export default class Inventory extends Args {
    render(): AppForge.AppNode {
        const { px } = this.props;
        const [position] = spring(
            () => UDim2.fromScale(0.5, this.source() ? 0.5 : 1.5),
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
                <Provider context={AppContext} value={this}>
                    {() => <TooltipButton />}
                </Provider>
            </frame>
        );
    }
}

function TooltipButton() {
    const { forge, props } = useForgeContext();
    const { px } = props;
    return (
        <textbutton
            BackgroundColor3={Color3.fromRGB(30, 30, 30)}
            AnchorPoint={new Vector2(0.5, 1)}
            Position={() => new UDim2(0.5, 0, 1, -px(5))}
            Size={() => UDim2.fromOffset(px(100), px(50))}
            Activated={() => forge.toggle("Tooltip", "HUD")}
        >
            <uicorner CornerRadius={() => new UDim(0, px(15))} />
        </textbutton>
    );
}
```

### Child App

```ts
// src/client/interface/apps/tooltip.ts
import { ChildApp, ChildArgs } from "@rbxts/forge";
import Vide, { spring } from "@rbxts/vide";

@ChildApp({
    name: "Tooltip",
    group: "HUD",
    rules: {
        parent: "Inventory",
        parentGroup: "HUD",
        anchor: true,
    },
})
export default class Tooltip extends ChildArgs {
    render(): AppForge.AppNode {
        const { px } = this.props;
        const [position] = spring(
            () => UDim2.fromScale(this.source() ? 0 : 1, 0.5),
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

- `global.d.ts` with `AppGroups`, `AppNames`, and `AppProps` is **required** — Forge will not work without it.
- App `name + group` combinations must be **globally unique** — Forge throws a runtime error on duplicates.
- Sources are only created for apps that are actually rendered — unrendered apps have no source and no rule effects.
- `Flamework.addPaths()` must be a string literal in your project — it cannot be inside the package or passed as a variable.
- Use `AppContext` with `useForgeContext()` for root apps, and `ChildAppContext` with `useChildForgeContext()` for child apps — mixing them will throw a runtime error.
- A test folder is available in the repository for reference implementations.

---

## License

MIT