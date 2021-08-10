
import { _decorator, Component, Label, Prefab, Node, instantiate, SystemEventType, Event } from 'cc';

import GameController from './GameController';
import { GameView } from './GameView/GameView';
const { ccclass, property } = _decorator;

@ccclass('GameScript')
export class GameScript extends Component {


    @property(Prefab)
    gameViewPrefab: Prefab = null!;

    private _gameCtrl: GameController = null!;
    private _gameView: GameView = null!;
    start() {
        this._gameView = instantiate(this.gameViewPrefab).getComponent(GameView)!;
        this.node.addChild(this._gameView.node)

        this._gameCtrl = new GameController();
        this._gameCtrl.Init(this._gameView)
        this._gameCtrl.Play();

    }

    onDestroy() {
        this._gameCtrl.Exit();
    }
    _sayHello() {
        console.log('Hello World');
    }

}

