import { instantiate, Prefab, Node } from "cc";
import Poker from "../View/Poker/Poker";
import { GameView } from "../View/GameView";


/**
 * 游戏牌局管理者
 */
export default class GameCtrl {
    pokers: Poker[] = [];

    private m_GameView: GameView = null!;


    public Init(gameView: GameView) {
        this.m_GameView = gameView;
    }

    public start() {
        console.log('start');
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit);
                this.pokers.push(poker)
            }
        }
        this.m_GameView.CreatePokers(this.pokers);
    }

    // private CreateUIPoker(poker: Poker): UIPoker {
    //     let uipokerNode = instantiate(this.pokerPrefab)
    //     let uipoker: UIPoker = uipokerNode.getComponent(UIPoker)!;
    //     uipoker.init(poker)
    //     uipoker.node.setPosition(Math.random() * 400 - 200, Math.random() * 400 - 200)
    //     return uipoker
    // }
}