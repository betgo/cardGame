import { instantiate, Prefab, Node, EventTarget } from "cc";
import GameDB from "./GameDB";
import { GAMEVENT } from "./GameEvent";
import { GameView } from "./GameView/GameView";



/**
 * 游戏牌局管理者
 */
export default class GameController extends EventTarget {

    private m_GameDB: GameDB = null!;
    private m_GameView: GameView = null!;

    // TODO 修改订阅逻辑
    public Init(gameView: GameView) {
        this.m_GameView = gameView;
        this.m_GameDB = GameDB.Instance();
        this.m_GameDB.Init()
        this.m_GameView.InitPokers(this.m_GameDB.pokers)
        // vm.viewModel();
        // EventTarget.on(GAMEVENT.PLAY, this.m_GameView.OnEventPlay, this.m_GameView)
        // EventTarget.on(GAMEVENT.INIT_GROUP_CARD, this.m_GameView.OnEventInitGroupCard, this.m_GameView)
        ll.EventManager.getInstance().on(GAMEVENT.PLAY, this.m_GameView.OnEventPlay, this.m_GameView)
        ll.EventManager.getInstance().on(GAMEVENT.INIT_GROUP_CARD, this.m_GameView.OnEventInitGroupCard, this.m_GameView)
    }


    public Play() {
        this.m_GameDB.Play();
    }

    public Exit() {

    }

}