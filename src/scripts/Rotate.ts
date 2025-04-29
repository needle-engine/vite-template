import { Behaviour, PointerEventData, serializable, showBalloonMessage } from "@needle-tools/engine";

// Simple example component that does nothing but rotate an object.
export class Rotate extends Behaviour {

    @serializable()
    speed: number = .5;

    start() {
        console.log(this);
        showBalloonMessage("Hello " + this.gameObject.name);
    }
    update(): void {
        this.gameObject.rotateY(this.context.time.deltaTime * this.speed);
    }
    onPointerEnter(_args: PointerEventData) {
        this.context.input.setCursor("pointer")
        showBalloonMessage("Enter " + this.gameObject.name);
    }
    onPointerExit(_args: PointerEventData) {
        this.context.input.unsetCursor("pointer");
        showBalloonMessage("Exit " + this.gameObject.name);
    }
    onPointerClick(_args: PointerEventData) {
        //this.gameObject.scale.multiplyScalar(1.1);
    }
}