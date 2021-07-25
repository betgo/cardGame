import { instantiate, Prefab, Node } from "cc";
import { GameView } from "../../View/GameView/GameView";
import Poker from "../../View/Poker/Poker";
import GameDB from "./GameDB";



/**
 * 游戏牌局管理者
 */
export default class GameCtrl {

    private m_GameDB: GameDB = null!;
    private m_GameView: GameView = null!;

    public Init(gameView: GameView) {
        this.m_GameDB = GameDB.Create();
        this.m_GameView = gameView;
    }

    public start() {
        console.log('start');
        this.m_GameView.CreatePokers(this.m_GameDB.pokers);
    }


}