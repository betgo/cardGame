import { instantiate, Prefab, Node } from "cc";
import Poker from "../Config/Poker";
import { UIpoker } from "./UIpoker";

/**
 * 游戏牌局管理者
 */
export default class GameCtrl {
    pokers: Poker[] = [];

    private pokerContainer: Node | null = null;
    private pokerPrefab: Prefab = null!;


    public Init(pokerContainer: Node, pokerPrefab: Prefab) {
        this.pokerContainer = pokerContainer;
        this.pokerPrefab = pokerPrefab;
    }

    public start() {
        console.log('start');
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit);
                this.pokers.push(poker)
            }
        }
        this.pokers.forEach((poker) => {
            let uiPoker = this.CreateUIPoker(poker)
            this.pokerContainer?.addChild(uiPoker.node);
        })
    }

    private CreateUIPoker(poker: Poker): UIpoker {
        let uipokerNode = instantiate(this.pokerPrefab)
        let uipoker: UIpoker = uipokerNode.getComponent(UIpoker)!;
        uipoker.init(poker)
        uipoker.node.setPosition(Math.random() * 400 - 200, Math.random() * 400-200)
        return uipoker
    }
}