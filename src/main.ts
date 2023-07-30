import { Behaviour, GameObject, showBalloonMessage, registerType, NeedleEngine, DragControls } from "@needle-tools/engine";
import { AxesHelper, GridHelper } from "three";
import * as THREE from "three";

@registerType
export class Rotate extends Behaviour {
    start() {
        console.log(this);
        showBalloonMessage("Hello Cube");
    }
    update(): void {
        this.gameObject.rotateY(this.context.time.deltaTime);
    }
}

NeedleEngine.addContextCreatedCallback(args =>{
    const context = args.context;
    const scene = context.scene;

    const grid = new GridHelper();
    scene.add(grid);

    const axis = new AxesHelper();
    axis.position.y = 1;
    scene.add(axis);

    const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
    const material = new THREE.MeshStandardMaterial( {color: 0xdddddd} ); 
    const cube = new THREE.Mesh(geometry, material); 
    cube.position.y += .5;
    scene.add(cube);

    const dragControls = GameObject.addNewComponent(cube, DragControls);
    dragControls.showGizmo = false;
    dragControls.useViewAngle = false;

    GameObject.addComponent(cube, new Rotate());
})