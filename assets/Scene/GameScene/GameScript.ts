
import { _decorator, Component, Label, Prefab, Node, instantiate } from 'cc';
import { GameView } from '../../View/GameView/GameView';

import GameCtrl from './GameCtrl';
const { ccclass, property } = _decorator;

@ccclass('GameScript')
export class GameScript extends Component {


    @property(Prefab)
    gameViewPrefab: Prefab = null!;

    private _gameCtrl: GameCtrl = null!;
    private _gameView: GameView = null!;
    start() {
        this._gameView = instantiate(this.gameViewPrefab).getComponent(GameView)!;
        this.node.addChild(this._gameView.node)
        this._gameCtrl = new GameCtrl();
        this._gameCtrl.Init(this._gameView)
        this._gameCtrl.start();
    }


}

