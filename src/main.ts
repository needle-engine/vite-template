import { onStart, RemoteSkybox, WebXR, addComponent, ContactShadows, SceneSwitcher, findObjectOfType, OrbitControls, PostProcessingManager, ToneMappingEffect, BloomEffect, SharpeningEffect, ScreenSpaceAmbientOcclusionN8, ObjectUtils, onUpdate, Gizmos, getTempVector, GroundProjectedEnv, fitObjectIntoVolume, Antialiasing, AnimationUtils, Mathf, useForAutoFit, setAutoFitEnabled } from "@needle-tools/engine";
import * as THREE from "three";
import { Rotate } from "./scripts/Rotate.js";

// onStart is an easy way to hook into needle engine (this is called once at the beginning of the update loop)
onStart(context => {
    const scene = context.scene;

    context.mainCamera.position.set(0,1,10);
    context.menu.showFullscreenOption(true);


    // To add contact shadows we can add the ContactShadows component to the scene (scene.addComponent(ContactShadows))
    // Or we can call `ContactShadows.auto()` which automatically fits the shadows to our scene
    const contactshadows = ContactShadows.auto();
    contactshadows.darkness = .8;
    contactshadows.opacity = .9;

    // Needle Engine offers a couple of helper methods for creating common simple shapes. 
    // But you can also use all the regular three.js APIs at any time
    const cylinder = ObjectUtils.createPrimitive("Cylinder", {
        scale: [1, .05, 1],
        position: [0, -.025, 0],
        material: new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.8,0.8,0.8),
            metalness: .1,
            roughness: .6,
        })
    });
    setAutoFitEnabled(cylinder, false);
    scene.add(cylinder);


    // To load or switch additional content it's easy to use a SceneSwitcher 
    const sceneSwitcher = addComponent(scene, SceneSwitcher, {
        autoLoadFirstScene: false,
        createMenuButtons: true,
        clamp: false,
        preloadNext: 1,
        preloadPrevious: 1,
    });
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBZ21QnG-latest-world/file");
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBzvPW9-latest-product/file");
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBZvGGVp-latest-product/file");
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBZ20RjNk-latest-product/file");
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXB27L6Db-1QlLnf-world/file");
    sceneSwitcher.addScene("https://cloud.needle.tools/-/assets/Z23hmXBZ2sPRdk-world/file");

    sceneSwitcher.sceneLoaded.addEventListener(()=>{
        const loaded = sceneSwitcher.currentlyLoadedScene?.asset
        if (loaded) {

            const volumeSize = new THREE.Vector3(1,1.5,1);
            fitObjectIntoVolume(loaded, new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,volumeSize.y*.501,0), volumeSize));

            contactshadows.fitShadows({object:loaded, positionOffset: {y:0.01}});

            AnimationUtils.autoplayAnimations(loaded);

            const orbitControls = findObjectOfType(OrbitControls);
            if (orbitControls) {
                orbitControls.enablePan = true;
                orbitControls.fitCamera({
                    objects: loaded,
                    immediate: false,
                    fitOffset: 1,
                    fitDirection: {x:-.5,y:.3,z:1},
                    relativeTargetOffset: {y:0},
                    fov: 20,
                });
            }
        }
    })

    sceneSwitcher.select(0);


    // To add postprocessing simple add a PostProcessingManager component to your scene
    const post = addComponent(context.scene, PostProcessingManager);
    post.addEffect(new SharpeningEffect());
    post.addEffect(new ToneMappingEffect()).setMode("AgX")
    post.addEffect(new Antialiasing());
    const bloom = post.addEffect(new BloomEffect());
    bloom.scatter.value = .9;
    bloom.threshold.value = 2;
    bloom.intensity.value = .2;


    // adding WebXR support can be done by simply adding a WebXR component. 
    // For more fine-grained control use the static NeedleXRSession methods
    addComponent(scene, WebXR, {
        createARButton: true,
        createVRButton: true,
        createQRCode: true,
        createSendToQuestButton: true,
        autoPlace: true,
    });


    // you can use also regular threejs syntax to create objects
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
        Gizmos.DrawSphere(hit.point, 0.005, 0x33ff33);
        if(hit.normal) 
        {
            Gizmos.DrawLine(hit.point, getTempVector(hit.normal).multiplyScalar(.1).add(hit.point), 0x33ff33)
        }
    }
})