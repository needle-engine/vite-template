---
name: needle-engine
description: >
  Provides Needle Engine context for web-based 3D projects built on Three.js
  with the @needle-tools/engine component system. Use this skill whenever the user
  is working with Needle Engine components, GLB files exported from Unity or Blender,
  Vite configs with needlePlugins, TypeScript classes extending Behaviour, or anything
  involving @needle-tools/engine imports. Also trigger when the user mentions
  "needle engine", "needle tools", serializable decorators (@serializable, @syncField,
  @registerType), the <needle-engine> web component, or 3D scenes loaded from GLB
  in a web context — even if they don't explicitly name the engine.
compatibility:
  - optional: needle_search MCP tool (search Needle Engine docs, forum posts, and community answers)
---

# Needle Engine

You are an expert in Needle Engine — a web-first 3D engine built on Three.js with a component system and Unity/Blender-based workflow.

## Quick Start

```html
<needle-engine src="assets/scene.glb"></needle-engine>
<script type="module">
  import "@needle-tools/engine";
</script>
```

Minimal TypeScript component:
```ts
import { Behaviour, serializable, registerType } from "@needle-tools/engine";

@registerType
export class HelloWorld extends Behaviour {
  @serializable() message: string = "Hello!";

  start() {
    console.log(this.message);
  }
}
```

> ⚠️ **TypeScript config required:** `tsconfig.json` must have `"experimentalDecorators": true` and `"useDefineForClassFields": false` for decorators to work. Without `useDefineForClassFields: false`, TypeScript overwrites `@serializable()` properties with their default values *after* the decorator runs, silently breaking deserialization.

---

## Key Concepts

**Needle Engine** ships 3D scenes from Unity or Blender as GLB files and renders them in the browser using Three.js. TypeScript components attached to objects are serialized into the GLB and re-hydrated at runtime.

- **Unity workflow:** C# MonoBehaviours → auto-generated TypeScript stubs → GLB export on play/build
- **Blender workflow:** Components added via the Needle Engine Blender addon → GLB export with component data embedded
- **Embedding:** `<needle-engine src="assets/scene.glb">` web component creates and manages a 3D context
- **Context access:** use `onStart(ctx => { ... })` or `onInitialize(ctx => { ... })` lifecycle hooks (preferred); `document.querySelector("needle-engine").context` works but only from UI event handlers

### `<needle-engine>` Attributes

Boolean attributes can be disabled with `="0"` (e.g. `camera-controls="0"`).

```html
<needle-engine
  src="assets/scene.glb"
  camera-controls
  auto-rotate
  autoplay
  background-color="#222"
  environment-image="studio"
  contactshadows
></needle-engine>
```

| Attribute | Description |
|---|---|
| `src` | GLB/glTF file path(s) — string, array, or comma-separated |
| `camera-controls` | Adds default OrbitControls with auto-fit if no `OrbitControls`/`ICameraController` exists in the root GLB. Disable with `="0"` for fully custom camera. To tweak defaults, get `OrbitControls` from the main camera in `onStart` |
| `auto-rotate` | Auto-rotate the camera (requires `camera-controls`) |
| `autoplay` | Auto-play animations in the loaded scene |
| `background-color` | Hex or RGB background color (e.g. `#ff0000`) |
| `background-image` | Skybox URL or preset: `studio`, `blurred-skybox`, `quicklook`, `quicklook-ar` |
| `background-blurriness` | Blur intensity for background (0–1) |
| `environment-image` | Environment lighting image URL or preset (same presets as `background-image`) |
| `contactshadows` | Enable contact shadows |
| `tone-mapping` | `none`, `linear`, `neutral`, `agx` |
| `poster` | Placeholder image URL shown while loading |
| `loadstart` / `progress` / `loadfinished` | Callback functions for loading lifecycle |

---

## Unity → Needle Cheat Sheet

| Unity (C#) | Needle Engine (TypeScript) |
|---|---|
| `MonoBehaviour` | `Behaviour` |
| `[SerializeField]` / public field | `@serializable()` (required for all serialized fields) |
| `Instantiate(prefab)` | `instantiate(obj)` |
| `Destroy(obj)` | `destroy(obj)` |
| `GetComponent<T>()` | `this.gameObject.getComponent(T)` |
| `AddComponent<T>()` | `this.gameObject.addComponent(T)` |
| `FindObjectOfType<T>()` | `findObjectOfType(T, ctx)` |
| `transform.position` | `this.gameObject.worldPosition` (world) / `this.gameObject.position` (local) |
| `transform.rotation` | `this.gameObject.worldQuaternion` (world) / `this.gameObject.quaternion` (local) |
| `transform.localScale` | `this.gameObject.worldScale` (world) / `this.gameObject.scale` (local) |
| `Resources.Load<T>()` | No direct equivalent — use `@serializable(AssetReference)` to assign refs in editor, then `.instantiate()` or `.asset` at runtime |
| `StartCoroutine()` | `this.startCoroutine()` (in a component; unlike Unity, coroutines stop when the component is disabled) |
| `Time.deltaTime` | `this.context.time.deltaTime` |
| `Camera.main` | `this.context.mainCamera` (THREE.Camera) / `this.context.mainCameraComponent` (Needle Camera component) |
| `Debug.Log()` | `console.log()` |
| `OnCollisionEnter()` | `onCollisionEnter(col: Collision)` |
| `OnTriggerEnter()` | `onTriggerEnter(col: Collision)` |

---

## Three.js → Needle Cheat Sheet

| Three.js | Needle Engine |
|---|---|
| `new Mesh(geo, mat)` | Created in Unity/Blender, exported as GLB; access via `Renderer.sharedMesh` / `Renderer.sharedMaterials` |
| `scene.add(obj)` | `this.gameObject.add(obj)` or `instantiate(prefab)` |
| `scene.remove(obj)` | `obj.removeFromParent()` (re-parent) or `destroy(obj)` (permanent) |
| `obj.position` | `obj.position` (local) / `obj.worldPosition` (world — Needle extension) |
| `obj.quaternion` | `obj.quaternion` (local) / `obj.worldQuaternion` (world — Needle extension) |
| `obj.scale` | `obj.scale` (local) / `obj.worldScale` (world — Needle extension) |
| `obj.getWorldPosition(v)` | `obj.worldPosition` (getter, no temp vec needed) |
| `obj.traverse(cb)` | `obj.traverse(cb)` (same — it's Three.js underneath) |
| `obj.children` | `obj.children` (same) |
| `obj.parent` | `obj.parent` (same) |
| `raycaster.intersectObjects()` | `this.context.physics.raycast()` (auto BVH, faster) |
| `renderer.setAnimationLoop(cb)` | `update() {}` in a component, or `onUpdate(cb)` hook |
| `clock.getDelta()` | `this.context.time.deltaTime` |
| `new GLTFLoader().load(url)` | `AssetReference.getOrCreate(base, url)` then `.instantiate()`, or `loadAsset(url)` |

Needle Engine extends `Object3D` with component methods (`getComponent`, `addComponent`, `worldPosition`, `worldQuaternion`, `worldScale`, `worldForward`, `worldRight`, `worldUp`, `contains`, etc.). `this.gameObject` is the `Object3D` a component is attached to. The underlying Three.js API still works directly.

---

## Creating a New Project

```bash
npm create needle my-app                  # Vite (default)
npm create needle my-app -t react         # React + Vite
npm create needle my-app -t vue           # Vue + Vite
npm create needle my-app -t sveltekit     # SvelteKit
npm create needle my-app -t nextjs        # Next.js
npm create needle my-app -t react-three-fiber  # R3F
```

---

## Vite Plugin System

```ts
import { defineConfig } from "vite";
import { needlePlugins } from "@needle-tools/engine/vite";

export default defineConfig(async ({ command }) => ({
  plugins: [
    ...(await needlePlugins(command, {}, {})),
  ],
}));
```

---

## Deployment

- **Needle Cloud** — `npx needle-cloud deploy`
- **Vercel / Netlify** — standard Vite web app
- **itch.io** — for games
- **Any static host / FTP** — `npm run build` (or `npm run build:production`) produces a standard dist folder

From Unity, built-in deployment components (e.g. `DeployToNetlify`) require a PRO license. Needle Cloud deployment works with the free tier.

---

## Progressive Loading (`@needle-tools/gltf-progressive`)

```ts
import { useNeedleProgressive } from "@needle-tools/gltf-progressive";
useNeedleProgressive(gltfLoader, renderer);
gltfLoader.load(url, (gltf) => scene.add(gltf.scene));
```

In Needle Engine projects this is built in — configure via **Compression & LOD Settings** in Unity.

---

## Searching the Documentation

Use the `needle_search` MCP tool to find relevant docs, forum posts, and community answers:

```
needle_search("how to play animation clip from code")
needle_search("SyncedTransform multiplayer")
needle_search("deploy to Needle Cloud CI")
```

Use this *before* guessing at API details — the docs are the source of truth.

---

## Common Gotchas

- `@registerType` is required or the component won't be instantiated from GLB. Unity/Blender export adds this automatically via codegen; hand-written components need it explicitly.
- GLB assets go in `assets/`, static files (fonts, images, videos) in `public/` (configurable via `needle.config.json`)
- `useDefineForClassFields: false` must be set in `tsconfig.json` — otherwise TypeScript overwrites decorated fields with their defaults after the decorator runs, silently breaking serialization
- `@syncField()` only triggers on reassignment — mutating an array/object in place won't sync. Do `this.arr = this.arr` to force a sync event.
- Physics callbacks (`onCollisionEnter` etc.) require a Needle `Collider` component (BoxCollider, SphereCollider ...) on the GameObject — they won't fire on mesh-only objects
- `removeComponent()` does NOT call `onDestroy` — any cleanup logic in `onDestroy` (event listeners, timers, allocated resources) will be skipped. Use `destroy(obj)` for full cleanup.
- Prefer the standalone `instantiate()` and `destroy()` functions over `GameObject.instantiate()` / `GameObject.destroy()` — the standalone versions are the current API
- `loadAsset()` returns a model wrapper (not an Object3D) — use `.scene` to get the root Object3D
- `AssetReference.getOrCreateFromUrl()` caches by URL — loading the same URL twice returns the same Object3D. Use `.instantiate()` or `loadAsset()` with `{ context }` for multiple independent copies

---

## References

Read these **only when needed** — don't load them all upfront:

- 📖 [Full API Reference](https://raw.githubusercontent.com/needle-tools/ai/refs/heads/main/providers/claude/plugin/skills/needle-engine/references/api.md) — read when writing component code (lifecycle, decorators, context API, animation, networking, XR, physics)
- 🔗 [Framework Integration](https://raw.githubusercontent.com/needle-tools/ai/refs/heads/main/providers/claude/plugin/skills/needle-engine/references/integration.md) — read when integrating with React, Svelte, Vue, or vanilla JS
- 🐛 [Troubleshooting](https://raw.githubusercontent.com/needle-tools/ai/refs/heads/main/providers/claude/plugin/skills/needle-engine/references/troubleshooting.md) — read when debugging errors or unexpected behavior
- 🧩 [Component Template](https://raw.githubusercontent.com/needle-tools/ai/refs/heads/main/providers/claude/plugin/skills/needle-engine/templates/my-component.ts) — use as a starting point for new components

## Important URLs

- Docs: https://engine.needle.tools/docs/
- Samples: https://engine.needle.tools/samples/
- GitHub: https://github.com/needle-tools/needle-engine-support
- npm: https://www.npmjs.com/package/@needle-tools/engine
