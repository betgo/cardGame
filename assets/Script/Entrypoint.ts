
import { _decorator, Component, Node, Label, director, } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Entrypoint')
export class Entrypoint extends Component {


    @property(Label)
    label: Label = null!;

    start() {
        this.label.string = "这是加载场景"
        setTimeout(() => {
            director.loadScene('StartGame')
        }, 1000);

    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

