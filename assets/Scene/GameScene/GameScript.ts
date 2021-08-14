
import { _decorator, Component, Label, Prefab, Node, instantiate, SystemEventType, Event, EventTarget } from 'cc';

import GameController from './GameController';
import { GAMEVENT } from './GameEvent';
import { GameView } from './GameView/GameView';
const { ccclass, property } = _decorator;

@ccclass('GameScript')
export class GameScript extends Component {


    @property(Prefab)
    gameViewPrefab: Prefab = null!;

    private _gameController: GameController = null!;
    private _gameView: GameView = null!;
    start() {
        this._gameView = instantiate(this.gameViewPrefab).getComponent(GameView)!;
        this.node.addChild(this._gameView.node)
        this._gameController = new GameController();
        this._gameController.Init(this._gameView)
        this._gameController.Play();
        ll.EventManager.getInstance().on(GAMEVENT.ON_CLICK_NEW_GAME, this.newGame, this)
    }

    newGame() {
        this.ExitGame(this._gameController);
        this._gameController = new GameController();
        this._gameController.Init(this._gameView)
        this._gameController.Play();
    }
    ExitGame(control: GameController) {
        if (control !== null) {
            control.Exit();
        }

    }
}

