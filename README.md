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

### `AppForge` Namespace

Forge injects a global `AppForge` namespace into your project automatically. It provides utility types so you never need to import anything from Vide or Forge just to annotate your components.

| Type | Description |
|------|-------------|
| `AppForge.Node` | Return type for `render()` in both `Args` and `ChildArgs` — equivalent to `JSX.Element` without needing to import it from Vide |
| `AppForge.Props.Class` | The type of `this.props` inside any component — your `AppProps` plus the full `px` and `screen` utilities |
| `AppForge.Props.Main` | Full props object passed to `render()` and `story()` — useful when building utilities around the render layer |
| `AppForge.Props.Config` | The optional `config` object for overriding px defaults |

```ts
// Typing render() — no Vide import needed
export default class MyApp extends Args {
    render(): AppForge.Node {
        return <frame />;
    }
}

// Typing a standalone component that receives forwarded props
function MyComponent(props: { appProps: AppForge.Props.Class }) {
    const { px, screen } = props.appProps;
}

// Typing a utility that wraps the render layer
function myHelper(props: AppForge.Props.Main, config?: AppForge.Props.Config) { ... }
```

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
    render(): AppForge.Node { ... }
}
```

### `ChildArgs` — use with `@ChildApp`

```ts
export default class MyChild extends ChildArgs {
    render(): AppForge.Node { ... }
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

## MendArgs — Custom Properties

`MendArgs` allows you to extend your apps with type-safe custom properties that can be accessed via context hooks.

```ts
import { App, Args, MendArgs } from "@rbxts/forge";

// Define custom properties
type CustomProps = {
  color: Color3;
  title: string;
};

@App({
  name: "CustomApp",
  group: "UI",
})
export default class CustomApp extends Args implements MendArgs<CustomProps> {
  public color = Color3.fromRGB(255, 100, 100);
  public title = "My Custom App";
  
  render(): AppForge.Node {
    const { px } = this.props;
    return (
      <frame BackgroundColor3={this.color}>
        <textlabel Text={this.title} TextSize={px(20)} />
      </frame>
    );
  }
}
```

### Accessing Custom Properties

Access custom properties in child components using `useAppContext`:

```tsx
import { useAppContext } from "@rbxts/forge";

type CustomProps = { 
  color: Color3;
  title: string;
};

function ChildComponent() {
  const { color, title, props } = useAppContext<CustomProps>();
  const { px } = props;
  
  return (
    <frame BackgroundColor3={color}>
      <textlabel Text={title} TextSize={px(16)} />
    </frame>
  );
}
```

The generic parameter merges your custom properties with the base context properties (`forge`, `props`, `source`, `name`, `group`), giving you full type safety.

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

## Contexts & Hooks

Forge exposes two Vide contexts that let components deep in your tree access app data without prop drilling.

### `AppContext` — for root apps (`Args`)

Use inside apps decorated with `@App`. Pass `this` as the `value` to give all descendants access to `forge`, `props`, `source`, `name`, `group`, and any custom properties defined via `MendArgs`:

```ts
import AppForge, { Args, App, Fade, AppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

@Fade(0.25)
@App({ name: "Inventory", group: "HUD", visible: true })
export default class Inventory extends Args {
    render(): AppForge.Node {
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

Use inside apps decorated with `@ChildApp` when descendants need access to `parentSource`:

```ts
import { ChildArgs, ChildApp, ChildAppContext } from "@rbxts/forge";
import Vide, { Provider } from "@rbxts/vide";

@ChildApp({ name: "Tooltip", group: "HUD", rules: { parent: "Inventory", parentGroup: "HUD" } })
export default class Tooltip extends ChildArgs {
    render(): AppForge.Node {
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

### `useAppContext()` — consuming root app context

Call inside any component nested under an `AppContext` provider. Returns the full `Args` instance plus any custom properties:

```ts
import { useAppContext } from "@rbxts/forge";

type CustomProps = {
  backgroundColor: Color3;
};

export function TooltipButton() {
    const { forge, props, source, name, group, backgroundColor } = useAppContext<CustomProps>();
    const { px } = props;

    return (
        <textbutton
            BackgroundColor3={backgroundColor}
            Size={() => UDim2.fromOffset(px(100), px(40))}
            Activated={() => forge.toggle("Tooltip", "HUD")}
        />
    );
}
```

### `useChildAppContext()` — consuming child app context

Call inside any component nested under a `ChildAppContext` provider. Returns the full `ChildArgs` instance including `parentSource`:

```ts
import { useChildAppContext } from "@rbxts/forge";

export function TooltipContent() {
    const { forge, props, source, parentSource } = useChildAppContext();
    const { px } = props;

    return (
        <frame Size={() => UDim2.fromOffset(px(200), px(100))} />
    );
}
```

Both hooks throw a descriptive runtime error with a traceback if called outside their respective provider.

| Hook | Context | Returns |
|------|---------|---------|
| `useAppContext<T>()` | `AppContext` | `forge`, `props`, `source`, `name`, `group`, + custom properties from `T` |
| `useChildAppContext<T>()` | `ChildAppContext` | `forge`, `props`, `source`, `name`, `group`, `parentSource`, + custom properties from `T` |

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
import type { ForgeProps, ClassProps, RenderProps, StoryProps } from "@rbxts/forge";
```

| Export | Description |
|--------|-------------|
| `ForgeProps` | Full props object for `render()` and `story()` — includes `props`, `forge`, `config`, `renders` |
| `ClassProps` | What `this.props` looks like inside a component — your `AppProps` plus `px` and `screen` |
| `RenderProps` | The `renders` filter object |
| `StoryProps` | Props for the `Story` component |

---

## Exports Reference

```ts
import AppForge, {
    // Decorators
    App, ChildApp, Fade, MendArgs,
    // Base classes
    Args, ChildArgs,
    // Contexts
    AppContext, ChildAppContext,
    // Hooks
    useAppContext, useChildAppContext,
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

### Story Component Props

```ts
export interface StoryProps {
    debug?: boolean;          // Enable debug logging (default: false)
    props: AppProps;          // Your global app props
    target: GuiObject;        // Target container for rendering
    render?: RenderProps;     // Optional filter for which apps to render
    callback?: (props: AppProps, forge: AppForge) => void; // Optional callback after render
}
```

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
            props={{ player: game.GetService("Players").LocalPlayer }}
            target={props.target}
            render={{ name: "Inventory", group: "HUD" }}
            debug // Enable debug logging to see render times
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

When `debug` is enabled, you'll see render timing output in the console:

```
[Forge][Renders]: "HUD:Inventory" rendered in 0.0003s
[Forge][Renders]: "HUD:Tooltip" rendered in 0.0001s
[Forge][Renders]: Load completed in 0.0008s — 2 app(s) rendered
```

---

## Full Examples

### Root App with Fade, Context, and Custom Properties

```ts
// src/client/interface/apps/inventory.ts
import AppForge, { App, Args, Fade, AppContext, MendArgs } from "@rbxts/forge";
import Vide, { Provider, spring, source } from "@rbxts/vide";

type InventoryProps = {
    backgroundColor: Color3;
};

@Fade(0.25)
@App({
    name: "Inventory",
    group: "HUD",
    visible: true,
})
export default class Inventory extends Args implements MendArgs<InventoryProps> {
    public backgroundColor = Color3.fromRGB(40, 40, 40);

    render(): AppForge.Node {
        const { px } = this.props;
        const [position] = spring(
            () => UDim2.fromScale(0.5, this.source() ? 0.5 : 1.5),
            1,
            0.6,
        );
        return (
            <frame
                BackgroundColor3={this.backgroundColor}
                Size={() => UDim2.fromOffset(px(200), px(200))}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Position={position}
                ZIndex={10}
            >
                <uicorner CornerRadius={() => new UDim(0, px(15))} />
                <Provider context={AppContext} value={this}>
                    {() => <ToggleButton />}
                </Provider>
            </frame>
        );
    }
}

function ToggleButton() {
    const { forge, props, backgroundColor } = useAppContext<InventoryProps>();
    const { px } = props;
    return (
        <textbutton
            BackgroundColor3={backgroundColor}
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

### Child App with Anchor

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
    render(): AppForge.Node {
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
                <uicorner CornerRadius={() => new UDim(0, px(8))} />
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

### Reactive Counter with Custom Properties

```ts
import { App, Args, MendArgs } from "@rbxts/forge";
import { source } from "@rbxts/vide";

type CounterProps = {
    count: Vide.Source<number>;
};

@App({ name: "Counter", group: "UI" })
export default class Counter extends Args implements MendArgs<CounterProps> {
    public count = source(0);
    
    render(): AppForge.Node {
        const { px } = this.props;
        
        return (
            <frame 
                BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                Size={UDim2.fromOffset(px(300), px(100))}
                Position={UDim2.fromScale(0.5, 0.5)}
                AnchorPoint={new Vector2(0.5, 0.5)}
            >
                <uicorner CornerRadius={new UDim(0, px(12))} />
                <textlabel
                    Text={() => `Count: ${this.count()}`}
                    Size={UDim2.fromScale(1, 0.5)}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={px(20)}
                />
                <textbutton
                    Text="Increment"
                    Size={UDim2.fromScale(1, 0.5)}
                    Position={UDim2.fromScale(0, 0.5)}
                    BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={px(16)}
                    Event={{
                        Activated: () => this.count(this.count() + 1),
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, px(12))} />
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
- Use `AppContext` with `useAppContext()` for root apps, and `ChildAppContext` with `useChildAppContext()` for child apps — mixing them will throw a runtime error.
- Use `MendArgs<T>` to add type-safe custom properties to your apps that are accessible via `useAppContext<T>()`.
- A test folder is available in the repository for reference implementations.

---

## License

MIT