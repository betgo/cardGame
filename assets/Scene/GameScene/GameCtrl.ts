import { instantiate, Prefab, Node } from "cc";
import GameDB from "./GameDB";
import { GameView } from "./GameView/GameView";



/**
 * 游戏牌局管理者
 */
export default class GameCtrl {

    private m_GameDB: GameDB = null!;
    private m_GameView: GameView = null!;

    public Init(gameView: GameView) {
        this.m_GameDB = GameDB.Init();
        this.m_GameView = gameView;
    }

    public start() {
        console.log('start');
        this.m_GameView.InitPokers(this.m_GameDB.pokers);
        this.m_GameView.start();
    }


}