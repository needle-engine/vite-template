import { Behaviour, showBalloonMessage, DragControls, onStart, DragMode, PointerEventData, serializable, RemoteSkybox, WebXR, addComponent, ContactShadows, SceneSwitcher, findObjectOfType, OrbitControls, PostProcessingManager, ToneMappingEffect, BloomEffect, SharpeningEffect, ScreenSpaceAmbientOcclusionN8 } from "@needle-tools/engine";
import * as THREE from "three";

// Simple example component that does nothing but rotate an object.
export class Rotate extends Behaviour {

    @serializable()
    speed: number = .5;

    start() {
        console.log(this);
        showBalloonMessage("Hello Cube");
    }
    update(): void {
        this.gameObject.rotateY(this.context.time.deltaTime * this.speed);
    }
    onPointerEnter(_args: PointerEventData) {
        showBalloonMessage("Hovering Cube!");
        this.speed *= 4;
    }
    onPointerExit(_args: PointerEventData) {
        showBalloonMessage("Bye Cube!");
        this.speed *= .25;
    }
    onPointerClick(_args: PointerEventData) {
        this.gameObject.scale.multiplyScalar(1.1);
    }
}

// onStart is one way to hook into the needle engine event loop (this is called once at the beginning of the update loop)
// you can also directly hook into update events using onUpdate
// or use NeedleEngine.addContextCreatedCallback
onStart(context =>{
    const scene = context.scene;

    // you can use regular threejs syntax to create objects
    const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
    const material = new THREE.MeshStandardMaterial( {color: 0xdddddd} ); 
    const cube = new THREE.Mesh(geometry, material); 
    cube.position.x = 1;
    cube.position.y += .5;
    scene.add(cube);
    // use `addComponent` to add components to objects
    addComponent(cube, new Rotate(), { 
        // You can initialize component properties inline:
        // speed: 5
    });

    // DragControls is a builtin Needle Engine componen to allow users to drag an object.
    // This works on desktop as well as AR or VR
    addComponent(cube, DragControls, {
        showGizmo: false,
        dragMode: DragMode.XZPlane,
    });

    // add WebXR support
    addComponent(scene, WebXR, {
        createARButton: true,
        createQRCode: true,
        createVRButton: true,
        createSendToQuestButton: true,
    });

    // We can modify the background or scene lighting easily using a RemoteSkybox
    // We can also set the skybox directly on the scene if we load it manually
    // Or just assign a skybox-image or environment-image attribute on <needle-engine>
    // See https://engine.needle.tools/docs/reference/needle-engine-attributes.html 
    addComponent(scene, RemoteSkybox, {
        url: "quicklook-ar",
        environment: true,
        background: false,
    });
    // Make the background blurry
    if(context.mainCameraComponent)
        context.mainCameraComponent.backgroundBlurriness = 1;
     // Let's also add a Contact Shadow component
     ContactShadows.auto();

    // To load or switch additional content it's easy to use a SceneSwitcher 
    const sceneSwitcher = addComponent(scene, SceneSwitcher, {
        autoLoadFirstScene: false
    });
    sceneSwitcher.addScene("https://engine.needle.tools/demos/gltf-progressive/assets/cyberpunk/model.glb")

    sceneSwitcher.select(0).then(_success => {
        console.log("Loaded Scene", sceneSwitcher.currentlyLoadedScene);
        sceneSwitcher.currentlyLoadedScene?.asset.scale.multiplyScalar(20);
        sceneSwitcher.currentlyLoadedScene?.asset.rotateY(Math.PI * -.5);

        const orbitControls = findObjectOfType(OrbitControls);
        if(orbitControls) orbitControls.fitCamera(scene.children, {
            immediate: false
        });
        ContactShadows.auto();    
    });


    // To add postprocessing simple add a PostProcessingManager component to your scene
    const post = addComponent(context.scene, PostProcessingManager);
    const tonemapping = post.addEffect(new ToneMappingEffect())
    tonemapping.setMode("AgX");
    post.addEffect(new SharpeningEffect());
})