# AppForge

> ⚠️ **Documentation Notice**  
> Written with AI assistance. Please report any issues in [GitHub Issues](https://github.com/Loner1536/AppForge/issues) or on Discord: `@loner71x`.

**AppForge** is a **declarative UI application manager** for [Vide](https://github.com/centau/vide) in **roblox-ts**. It allows you to structure, mount, and control UI “apps” with centralized visibility, parent-child relationships, exclusive groups, and ZIndex rules — without tangled state.

---

## ✨ Features

- **App-based UI architecture**: self-contained UI units  
- **Centralized visibility** per app  
- **Rules system**: parent/child, exclusive groups, ZIndex  
- **Render groups** for selective mounting  
- **Built-in debug logger & performance tracing**  
- **Fully typed with roblox-ts**

---

## 📦 Installation

```bash
npm install @rbxts/app-forge
npm install @rbxts/vide

Or using Bun:

bun add @rbxts/app-forge
bun add @rbxts/vide

🧠 Core Concepts
App

An App is a self-contained UI unit:

    Owns its visibility source

    Renders a Vide tree

    Can have rules: parent/child, exclusive groups, ZIndex

Apps are defined using the @App decorator and must extend Args.
Forge

AppForge is the runtime manager:

    Holds all visibility sources

    Mounts/unmounts apps in the UI

    Applies rules automatically

    Exposes imperative helpers: open, close, toggle

    Owns debugger & logger

One Forge per UI root is recommended.
Rules
Rule	Description
parent	Child app closes automatically when parent closes
detach	Prevents automatic anchoring to parent
exclusiveGroup	Only one app in the group may be open
index	Sets ZIndex of the app container

Rules are reactively enforced when visibility changes.
Render Groups

Render groups let you mount selective apps:

    Example: Lobby UI vs In-Game UI

    Example: HUD vs Menus

Apps can be rendered by group, name, or multiple names using the Forge’s internal rendering methods.
🧩 Basic Usage
Creating a Forge

import { CreateForge } from "@rbxts/app-forge";

const forge = new CreateForge();

Mounting to the PlayerGui

forge.mount(
 <screengui
  Name="AppRoot"
  ZIndexBehavior="Sibling"
  ResetOnSpawn={false}
 />,
 { props: {}, forge },
 Players.LocalPlayer.WaitForChild("PlayerGui")
);

    ⚠️ Note: You pass the root node directly, not a function.

Controlling Apps

forge.open("Inventory");
forge.close("Inventory");
forge.toggle("Inventory");

    open(name): Shows the app

    close(name): Hides the app

    toggle(name): Toggles visibility

Defining an App

import { App, Args } from "@rbxts/app-forge";

@App({
 name: "Inventory",
 renderGroup: "Lobby",
 visible: false,
 rules: { zIndex: 2 },
})
export class Inventory extends Args {
 render() {
  const { px } = this.props; // px comes from the Forge

  return (
   <frame
    BackgroundColor3={Color3.fromRGB(100, 100, 100)}
    Size={() => UDim2.fromOffset(px(500), px(500))}
   />
  );
 }
}

    @App registers the app with the Forge

    px provides scaling helpers automatically

    rules define relationships (parent, exclusive group, ZIndex)

🐞 Debugging

AppForge provides Studio-only debug logging:

forge.debug.enable("render");
forge.debug.enable("rules");
forge.debug.enableAll();   // everything
forge.debug.disable("render");

Performance tracing example:

[PERF][render][Inventory] 1.243ms

🧱 Architecture Overview

AppForge
 ├─ AppRegistry (static)
 ├─ Visibility Sources
 ├─ Render Manager
 ├─ Rule Engine
 │   ├─ Parent Rule
 │   └─ Exclusive Group Rule
 ├─ Debugger / Logger
 └─ Vide Mount

⚠️ Notes

    Apps are singletons per Forge

    Rendering twice warns if px is re-initialized

    Rules are reactive

    Debug logging only runs in Studio

    API is alpha — may change

🛣 Roadmap

    Better developer warnings

    Debug inspector

📜 License

MIT