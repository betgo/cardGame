
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { UIPoker } from '../../../View/UIPoker/UIPoker';
import GameDB, { Poker } from '../GameDB';


const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends Component {

    @property(Prefab) pokerPrefab: Prefab = null!;

    @property(Node) initArea: Node = null!;
    @property(Node) closeSendArea: Node = null!;
    @property(Node) openSendArea: Node = null!;
    @property([Node]) receiveAreaList: Node[] = [];
    @property(Node) playGroupAchor: Node = null!;

    private playGroupList: Node[] = []

    /********************************************
     * LifeCycle
    ********************************************/
    InitPokers(pokers: Poker[]) {
        // 创建扑克UI
        pokers.forEach((poker, index) => {
            let uiPoker = this.CreateUIPoker(poker)
            uiPoker.node.setPosition(0.2 * index, 0.2 * index)
            this.initArea?.addChild(uiPoker.node);
        })
    }

    /********************************************
     * Public  API
    ********************************************/
    public OnEventInit(pokers: Poker[]) {
        this.InitPokers(pokers)
    }
    public OnEventPlay() {
        this.OnPlay();
    }
    /********************************************
     * private  API
    ********************************************/
    private CreateUIPoker(poker: Poker): UIPoker {
        let uipokerNode = instantiate(this.pokerPrefab)
        let uipoker: UIPoker = uipokerNode.getComponent(UIPoker)!;
        uipoker.init(poker)
        return uipoker
    }

    private OnPlay() {
        for (let i = 0; i < this.initArea.children.length; i++) {
            let child = this.initArea.children[i];
            this.closeSendArea.addChild(child)
        }
        this.initArea.removeAllChildren();
    }

}

