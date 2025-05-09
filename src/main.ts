import { onStart, RemoteSkybox, WebXR, addComponent, ContactShadows, SceneSwitcher, findObjectOfType, OrbitControls, PostProcessingManager, ToneMappingEffect, BloomEffect, SharpeningEffect, ScreenSpaceAmbientOcclusionN8, ObjectUtils, onUpdate, Gizmos, getTempVector } from "@needle-tools/engine";
import * as THREE from "three";
import { Rotate } from "./scripts/Rotate.js";


// onStart is one way to hook into the needle engine event loop (this is called once at the beginning of the update loop)
// you can also directly hook into update events using onUpdate
// or use NeedleEngine.addContextCreatedCallback
onStart(context => {
    const scene = context.scene;
    // add WebXR support
    addComponent(scene, WebXR, {
        createARButton: true,
        createQRCode: true,
        createVRButton: true,
        createSendToQuestButton: true,
    });

    // We can modify the background or scene lighting easily using a RemoteSkybox
    // We can also set the skybox directly on the scene if we load it manually
    // Or just assign a background-image or environment-image attribute on <needle-engine>
    // See https://engine.needle.tools/docs/reference/needle-engine-attributes.html 
    addComponent(scene, RemoteSkybox, {
        // You can assign an URL here or one of the built-in keywords
        url: "studio",
        environment: true,
        background: false,
    });

    // Make the background blurry
    if (context.mainCameraComponent) {
        context.mainCameraComponent.backgroundBlurriness = 1.2;
    }

    // Let's also add a Contact Shadow component
    const contactshadows = ContactShadows.auto();

    // To load or switch additional content it's easy to use a SceneSwitcher 
    const sceneSwitcher = addComponent(scene, SceneSwitcher, {
        autoLoadFirstScene: false
    });
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBZ1Mqr5s-Z1Mqr5s-world/file")

    sceneSwitcher.select(0).then(_success => {
        const loaded = sceneSwitcher.currentlyLoadedScene?.asset
        if (loaded) {
            console.log("Loaded Scene", loaded);
            loaded?.rotateY(Math.PI * -.5);
            loaded.addComponent(Rotate);

            const orbitControls = findObjectOfType(OrbitControls);
            if (orbitControls) {
                orbitControls.enablePan = false;
                orbitControls.doubleClickToFocus = false;
                orbitControls.fitCamera(scene.children, {
                    immediate: false
                });
            }
        }
    });


    // To add postprocessing simple add a PostProcessingManager component to your scene
    const post = addComponent(context.scene, PostProcessingManager);
    post.addEffect(new SharpeningEffect());
    //post.addEffect(new ToneMappingEffect()).setMode("AgX")
    const bloom = post.addEffect(new BloomEffect());
    bloom.scatter.value = .8;
    bloom.threshold.value = 1;

    const sphere = ObjectUtils.createPrimitive("Cube", {
        scale: [1, .005, 1],
        position: [0, -.01, 0],
        material: new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: .9,
            roughness: .6,
        })
    });
    scene.add(sphere);



    // you can use regular threejs syntax to create objects
    /*
    const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
    const material = new THREE.MeshStandardMaterial( { color: 0xaaaaaa } ); 
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
    */

})


onUpdate((ctx)=> {
    const hits = ctx.physics.raycast({ray: undefined});
    if(hits?.length) {
        const hit = hits[0];
        Gizmos.DrawSphere(hit.point, 0.02, 0xffff00);
        if(hit.normal) 
        {
            Gizmos.DrawLine(hit.point, getTempVector(hit.point).add(hit.normal), 0xff00ff)
        }
    }
})