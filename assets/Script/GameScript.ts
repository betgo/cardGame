
import { _decorator, Component, Node, Label } from 'cc';
import GameCtrl from './GameCtrl';
const { ccclass, property } = _decorator;

@ccclass('GameScript')
export class GameScript extends Component {

    @property(Label)
    label: Label = null!;

    private _gameCtrl: GameCtrl = new GameCtrl();
    start() {
        this.label.string = "这里是游戏场景"
    }

    constructor() {
        super();
        this._gameCtrl.start();
        console.log(this._gameCtrl.pokers);

    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
