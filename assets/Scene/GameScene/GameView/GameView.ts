
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, v2, v3 } from 'cc';
import { EpokerStatus } from '../../../Config/ConfigEnum';
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
    public onLoad() {
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let playGroup = new Node();
            playGroup.setPosition(new Vec3(100 * i, 0, 0))
            this.playGroupAchor.addChild(playGroup)
            this.playGroupList.push(playGroup)
        }
    }
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
    public OnEventInitGroupCard(groupIndex: number, cardIndex: number, poker: Poker) {
        // 移动UI
        let node: Node = poker.view!.node
        let wp = node.getWorldPosition(v3(0, 0, 0))
        let group = this.playGroupList[groupIndex];
        let gp = group.getPosition(wp)
        node.removeFromParent();
        node.setPosition(gp)
        group.addChild(node)
        if (poker.status === EpokerStatus.OPEN) {
            tween(node)
                .delay(0.0)
                .to(0.5, { position: v3(0, -30 * cardIndex, 0) })
                // .to(0.3, { scale: v3(0, 1, 0) })
                .call(() => {
                    poker.view?.refresh();
                })
                // .to(0.3, { scale: v3(1, 1,  1) })
                .start()
        } else {
            tween(node)
                .delay(0.0)
                .to(0.2, { position: v3(0, -30 * cardIndex, 0) })
                .start()
        }

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

