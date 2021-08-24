import { instantiate, Prefab, Node, EventTarget } from "cc";
import GameDB from "./GameDB";
import { GAME_EVENT } from "./GameEvent";
import { GameView } from "./GameView/GameView";



/**
 * 游戏牌局管理者
 */
export default class GameController {

    private m_GameDB: GameDB = null!;
    private m_GameView: GameView = null!;

    public Init(gameView: GameView) {
        this.m_GameView = gameView;
        this.m_GameDB = GameDB.Instance();
        this.m_GameDB.Init()
        this.m_GameView.InitPokers(this.m_GameDB.pokers)
        this.m_GameView.BindModel(this.m_GameDB)
    }


    public Play() {
        this.m_GameDB.Play();
    }

    public Exit() {
        this.m_GameDB.Exit();
        this.m_GameView.Exit();
    }

}