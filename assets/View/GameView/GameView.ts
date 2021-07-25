
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import Poker from '../Poker/Poker';
import { UIPoker } from '../Poker/UIPoker';


const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    @property(Prefab) pokerPrefab: Prefab = null!;

    @property(Node) closeSendArea: Node = null!;
    @property(Node) openSendArea: Node = null!;
    @property([Node]) receiveAreaList: Node[] = [];
    @property(Node) playGroupAchor: Node = null!;

    private playGroupList: Node[] = []


    start() {

    }

    CreatePokers(pokers: Poker[]) {
        pokers.forEach((poker, index) => {
            let uiPoker = this.CreateUIPoker(poker)
            uiPoker.node.setPosition(0.5 * index, 0)
            this.closeSendArea?.addChild(uiPoker.node);
        })
    }
    private CreateUIPoker(poker: Poker): UIPoker {
        let uipokerNode = instantiate(this.pokerPrefab)
        let uipoker: UIPoker = uipokerNode.getComponent(UIPoker)!;
        uipoker.init(poker)
        // uipoker.node.setPosition(Math.random() * 400 - 200, Math.random() * 400 - 200)
        return uipoker
    }

}

