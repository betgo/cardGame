
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, v2, v3, UITransform, SystemEventType, Event } from 'cc';
import { EpokerStatus } from '../../../Config/ConfigEnum';
import UIUtil from '../../../Util/UIUtil';
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
    @property(Node) playGroupRoot: Node = null!;

    private playGroupList: Node[] = []

    /********************************************
     * LifeCycle
    ********************************************/
    start() {
        console.log('gameview,start')

        // this.node.on(SystemEventType.TOUCH_START, (event: Event) => console.log(event), this)
    }
    public onLoad() {
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let playGroup = new Node();
            playGroup.setPosition(new Vec3(85 * i, 0, 0))
            this.playGroupRoot.addChild(playGroup)
            this.playGroupList.push(playGroup)
        }

    }
    /** 创建扑克实例，添加到初始区 */
    public InitPokers(pokers: Poker[]) {
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
        let index = GameDB.CONST_PLAY_GROUPS * cardIndex - cardIndex * (cardIndex - 1) / 2 - cardIndex + groupIndex;
        // 移动UI
        let node: Node = poker.view!.node

        UIUtil.move(node, this.playGroupRoot)
        node.setSiblingIndex(index)
        let delay = index * 0.05
        let px = groupIndex * 85
        if (poker.status === EpokerStatus.OPEN) {
            tween(node)
                .delay(delay)
                .to(0.5, { position: v3(px, -30 * cardIndex, 0) })
                .call(() => {
                    poker.view?.refresh();
                })
                .start()
        } else {
            tween(node)
                .delay(delay)
                .to(0.2, { position: v3(px, -30 * cardIndex, 0) })
                .start()
        }

    }
    /********************************************
     * private  API
    ********************************************/

    /** 实例方法 */
    private CreateUIPoker(poker: Poker): UIPoker {
        let uipokerNode = instantiate(this.pokerPrefab)
        let uipoker: UIPoker = uipokerNode.getComponent(UIPoker)!;
        // prefab实例初始化
        uipoker.init(poker)
        return uipoker
    }

    /** 将初始区的牌移到发牌区 */
    private OnPlay() {

        // addChild  会将实例对象移除，造成只能复制一半
        // for (let i = 0; i < this.initArea.children.length; i++) {
        //     let child = this.initArea.children[i];
        //     this.closeSendArea.addChild(child)
        // }
        // while (this.initArea.children.length) {
        //     this.closeSendArea.addChild(this.initArea.children[0])
        // }

        // this.initArea.removeAllChildren();
        let statck: Node[] = []
        for (let i = this.initArea.children.length - 1; i >= 0; i--) {
            let child = this.initArea.children[i]
            statck.push(child)
            this.initArea.removeChild(child)
        }
        for (let i = statck.length - 1; i >= 0; i--) {
            let child = statck[i]
            this.closeSendArea.addChild(child)
        }
    }

}

