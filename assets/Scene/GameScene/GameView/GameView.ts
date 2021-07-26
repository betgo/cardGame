
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { UIPoker } from '../../../View/UIPoker/UIPoker';
import GameDB, { Poker } from '../GameDB';


const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    @property(Prefab) pokerPrefab: Prefab = null!;

    @property(Node) closeSendArea: Node = null!;
    @property(Node) openSendArea: Node = null!;
    @property([Node]) receiveAreaList: Node[] = [];
    @property(Node) playGroupAchor: Node = null!;

    private playGroupList: Node[] = []
    private m_GameDB: GameDB = null!;

    start() {

    }

    InitWithDB(DB: GameDB) {
        this.m_GameDB = DB
        this.m_GameDB.closeAreaPokers.forEach((poker, index) => {
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

