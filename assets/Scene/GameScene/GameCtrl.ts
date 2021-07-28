import { instantiate, Prefab, Node } from "cc";
import GameDB from "./GameDB";
import { GAMEVENT } from "./GameEvent";
import { GameView } from "./GameView/GameView";



/**
 * 游戏牌局管理者
 */
export default class GameCtrl {

    private m_GameDB: GameDB = null!;
    private m_GameView: GameView = null!;

    public Init(gameView: GameView) {
        this.m_GameView = gameView;
        ll.EventManager.getInstance().on(GAMEVENT.INIT_POKER, this.m_GameView.OnEventInit, this.m_GameView)
        ll.EventManager.getInstance().on(GAMEVENT.PLAY, this.m_GameView.OnEventPlay, this.m_GameView)
        this.m_GameDB = GameDB.Init();
    }

    public Play() {
        this.m_GameDB.Play();
    }

    public Exit() {
        ll.EventManager.getInstance().off(GAMEVENT.INIT_POKER, this.m_GameView.OnEventInit)
    }

}