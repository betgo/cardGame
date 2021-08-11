
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, v2, v3, UITransform, SystemEventType, Event } from 'cc';
import { EpokerStatus } from '../../../Config/ConfigEnum';
import { Model } from '../../../Framework/MVC/Model';
import View from '../../../Framework/MVC/View';
import UIUtil from '../../../Util/UIUtil';
import { UIPoker } from '../../../View/UIPoker/UIPoker';
import GameDB, { Poker } from '../GameDB';
import { GAMEVENT } from '../GameEvent';


const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends View {

    @property(Prefab) pokerPrefab: Prefab = null!;

    @property(Node) initArea: Node = null!;
    @property(Node) closeSendArea: Node = null!;
    @property(Node) openSendArea: Node = null!;
    @property([Node]) receiveAreaList: Node[] = [];
    @property(Node) playGroupRoot: Node = null!;

    private playGroupList: Node[] = []
    private _model: GameDB = null!;
    /********************************************
     * LifeCycle
    ********************************************/
    constructor() {
        super();
        this.on(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventPokerMoveFromPlayAreaToReceiveArea, this)
    }
    start() {
        console.log('gameview,start')
    }
    public BindModel(DB: GameDB) {
        this._model = DB
        this._model.on(GAMEVENT.PLAY, this.OnEventPlay, this)
        this._model.on(GAMEVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard, this)
    }
    public UnBindMOdel() {
        this._model.off(GAMEVENT.PLAY, this.OnEventPlay)
        this._model.off(GAMEVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard)
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
    * Interface for UIPoker 
    ********************************************/
    public OnClickUIPoker(uiPoker: UIPoker) {
        if (this.isLocationPlayArea(uiPoker)) {
            console.log(1111);
            if (uiPoker.isOpen()) {
                console.log(222);
                if (this.isIndexPlayAreaGroupTop(uiPoker)) {
                    console.log(333);
                    if (uiPoker.isPoint(1)) {
                        console.log(4444);
                        this.emit(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, uiPoker.poker)
                    }
                }
            }
        }
    }
    /********************************************
     * Public  API
    ********************************************/
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
                .to(0.3, { scale: new Vec3(0, 1, 1) })
                .call(() => {
                    poker.view?.refresh();
                })
                .to(0.3, { scale: new Vec3(1, 1, 1) })
                .start()
        } else {
            tween(node)
                .delay(delay)
                .to(0.2, { position: v3(px, -30 * cardIndex, 0) })
                .start()
        }

    }
    /********************************************
      * Event Handler
     ********************************************/
    public OnEventPokerMoveFromPlayAreaToReceiveArea(poker: Poker) {
        console.log(`OnEventPokerMoveFromPlayAreaToReceiveArea===>${poker}`);

    }
    /********************************************
     * private  API
    ********************************************/

    /** 实例方法 */
    private CreateUIPoker(poker: Poker): UIPoker {
        let uipokerNode = instantiate(this.pokerPrefab)
        let uipoker: UIPoker = uipokerNode.getComponent(UIPoker)!;
        // prefab实例初始化
        uipoker.init(poker, this)
        return uipoker
    }

    /** 将初始区的牌移到发牌区 */
    private OnPlay() {

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

    private isLocationPlayArea(uiPoker: UIPoker): boolean {
        return this._model.isLocationPlayArea(uiPoker.poker)
    }
    private isIndexPlayAreaGroupTop(uiPoker: UIPoker): boolean {
        return this._model.isIndexPlayAreaGroupTop(uiPoker.poker)
    }

}

