
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, v2, v3 } from 'cc';
import { EpokerStatus } from '../../../Config/ConfigEnum';
import { Model } from '../../../Framework/MVC/Model';
import View from '../../../Framework/MVC/View';
import { Pool } from '../../../Pool/Pool';
import UIUtil from '../../../Util/UIUtil';
import { UIPoker } from '../../../View/UIPoker/UIPoker';
import GameDB, { Poker, PokerGroup } from '../GameDB';
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
        this.on(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive, this)
    }
    start() {
        // console.log('gameview,start')
    }
    public BindModel(DB: GameDB) {
        this._model = DB
        this._model.on(GAMEVENT.PLAY, this.OnEventPlay, this)
        this._model.on(GAMEVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard, this)
        this._model.on(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive, this)

    }
    public UnBindMOdel() {
        this._model.off(GAMEVENT.PLAY, this.OnEventPlay)
        this._model.off(GAMEVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard)
        this._model.off(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive)
    }
    public onLoad() {
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let playGroup = new Node();
            playGroup.setPosition(new Vec3(85 * i, 0, 0))
            this.playGroupRoot.addChild(playGroup)
            this.playGroupList.push(playGroup)
        }

    }

    public Exit() {
        this.UnBindMOdel()
        this.off(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA)
        this._model.pokers.forEach(p => {
            Pool.getIntance().uipoker.put(p.view!.node);
        })
        // Pool.getIntance().uipoker.put()
    }
    /** 创建扑克实例，添加到初始区 */
    public InitPokers(pokers: Poker[]) {
        // 创建扑克UI
        pokers.forEach((poker, index) => {
            let uiPoker = this.CreateUIPoker(poker)
            uiPoker.node.setPosition(v3(0, 0))
            // uiPoker.node.setPosition(0.2 * index, 0.2 * index)
            this.initArea?.addChild(uiPoker.node);
        })
    }
    /********************************************
    * Interface for UIPoker 
    ********************************************/
    onNewGameClick() {
        ll.EventManager.getInstance().emit(GAMEVENT.ON_CLICK_NEW_GAME)
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
                    this._model.OnPlayAreaPokerClick(uiPoker.poker)
                    // this.emit(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, uiPoker.poker)

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
        node.setSiblingIndex(-1)
        let delay = index * 0.05
        let px = groupIndex * 85
        let tw = tween(node)
            .delay(delay)
            .call(() => {
                node.setSiblingIndex(index)
            })
            .to(0.5, { position: v3(px, -30 * cardIndex, 0) })
        if (poker.status === EpokerStatus.OPEN) {
            tw = tw.to(0.3, { scale: new Vec3(0, 1, 1) })
                .call(() => {
                    poker.view?.refresh();
                })
                .to(0.3, { scale: new Vec3(1, 1, 1) })
        }
        tw.start();
    }
    /********************************************
      * Event Handler
     ********************************************/
    public OnEventMovePokerFromPlayToReceive(poker: Poker) {
        let receiveIndex = poker.parent.index
        let node = poker.view!.node
        let receive: Node = this.receiveAreaList[receiveIndex]
        UIUtil.move(node, receive);
        tween(node)
            .to(0.5, { position: v3(0, 0, 0) })
            .start()
    }
    /********************************************
     * private  API
    ********************************************/

    /** 实例方法 */
    private CreateUIPoker(poker: Poker): UIPoker {
        let uiPokerNode = Pool.getIntance().uipoker.get()
        if (uiPokerNode == null) {
            console.log('createUIpoker');

            uiPokerNode = instantiate(this.pokerPrefab)
        }

        let uipoker: UIPoker = uiPokerNode!.getComponent(UIPoker)!;
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

        // 对各个节点排序
        this._model.closeAreaPokers.forEach((p, index) => {
            p.view?.node.setSiblingIndex(index)
        })
    }

    private isLocationPlayArea(uiPoker: UIPoker): boolean {
        return this._model.isLocationPlayArea(uiPoker.poker)
    }
    private isIndexPlayAreaGroupTop(uiPoker: UIPoker): boolean {
        return this._model.isIndexPlayAreaGroupTop(uiPoker.poker)
    }

}

