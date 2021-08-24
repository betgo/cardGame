
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, v2, v3 } from 'cc';
import { EpokerStatus } from '../../../Config/ConfigEnum';
import { Model } from '../../../Framework/MVC/Model';
import View from '../../../Framework/MVC/View';
import { Pool } from '../../../Pool/Pool';
import UIUtil from '../../../Util/UIUtil';
import { UIPoker } from '../../../View/UIPoker/UIPoker';
import GameDB, { Poker, PokerGroup } from '../GameDB';
import { GAME_EVENT } from '../GameEvent';


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
        this.on(GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive, this)
        ll.EventManager.getInstance().on(GAME_EVENT.CS_FLIP_POKER, this.OnEvntFlipPoker, this)
    }
    start() {
        // console.log('gameview,start')
    }
    public BindModel(DB: GameDB) {
        this._model = DB
        this._model.on(GAME_EVENT.PLAY, this.OnEventPlay, this)
        this._model.on(GAME_EVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard, this)
        this._model.on(GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive, this)
        this._model.on(GAME_EVENT.CS_POKER_MOVE_FROM_CLOSEAREA_TO_OPENAREA, this.OnEventMovePokerFromCloseToOpen, this)
        this._model.on(GAME_EVENT.CS_POKER_MOVE_FROM_OPENAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromOpenToReceive, this)

    }
    public UnBindMOdel() {
        this._model.off(GAME_EVENT.PLAY, this.OnEventPlay)
        this._model.off(GAME_EVENT.INIT_GROUP_CARD, this.OnEventInitGroupCard)
        this._model.off(GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, this.OnEventMovePokerFromPlayToReceive)
        this._model.off(GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA)
        this._model.off(GAME_EVENT.CS_POKER_MOVE_FROM_OPENAREA_TO_RECEIVEAREA)
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
        this.off(GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA)
        this._model.pokers.forEach(p => {
            Pool.getIntance().uipoker.put(p.view!.node);
        })
    }
    /** 创建扑克实例，添加到初始区 */
    public InitPokers(pokers: Poker[]) {
        // 创建扑克UI
        pokers.forEach((poker, index) => {
            let uiPoker = this.CreateUIPoker(poker)
            uiPoker.node.setPosition(v3(0, 0))
            this.initArea?.addChild(uiPoker.node);
        })
    }
    /********************************************
    * Interface for UIPoker 
    ********************************************/
    onNewGameClick() {
        ll.EventManager.getInstance().emit(GAME_EVENT.ON_CLICK_NEW_GAME)
    }
    /********************************************
    * Interface for UIPoker 
    ********************************************/
    public OnClickUIPoker(uiPoker: UIPoker) {
        if (this.isLocationPlayArea(uiPoker)) {
            if (uiPoker.isOpen()) {
                if (this.isIndexPlayTop(uiPoker)) {
                    this._model.OnPlayAreaPokerClick(uiPoker.poker)
                }
            }
        } else if (this.isLocationClose(uiPoker)) {
            if (this.isIndexCloseTop(uiPoker)) {
                this._model.OnPlayClosePokerClick(uiPoker.poker)
            }
        } else if (this.isLocationOpen(uiPoker)) {
            if (this.isLocationOpenTop(uiPoker)) {
                this._model.OnPlayOpenPokerClick(uiPoker.poker)
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
    // 从玩牌区移动到收牌区
    public OnEventMovePokerFromPlayToReceive(poker: Poker) {
        this._handlePokerMoveToReceive(poker)
    }
    // 从close区移动到open区
    public OnEventMovePokerFromCloseToOpen(poker: Poker) {
        let node = poker.view!.node
        UIUtil.move(node, this.openSendArea);
        node.setSiblingIndex(poker.parent.pokers.indexOf(poker))
        let DX = node.position.x
        tween(node)
            .to(0.2, { position: v3(DX / 2, 0, 0), scale: v3(0, 1, 1) })
            .call(() => {
                poker.view?.refresh();
            })
            .to(0.2, { position: v3(0, 0, 0), scale: v3(1, 1, 1) })
            .start()
        let offsetX = -24;
        for (let i = 0; i <= 1; i++) {
            let p = this._model.openAreaGroup.GetPoker(-2 - i)
            if (p) {
                tween(p.view?.node)
                    .to(0.2, { position: v3(offsetX * (i + 1), 0, 0) })
                    .start()
            }
        }
    }
    // 从open区移动到收牌区
    public OnEventMovePokerFromOpenToReceive(poker: Poker) {
        this._handlePokerMoveToReceive(poker)
    }
    // 扑克打开
    public OnEvntFlipPoker(poker: Poker) {
        tween(poker.view?.node)
            .to(0.3, { scale: new Vec3(0, 1, 1) })
            .call(() => {
                poker.view?.refresh();
            })
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /********************************************
     * private  API
    ********************************************/

    private _handlePokerMoveToReceive(poker: Poker) {
        let receiveIndex = poker.parent.index
        let node = poker.view!.node
        let receive: Node = this.receiveAreaList[receiveIndex]
        UIUtil.move(node, receive);
        node.setSiblingIndex(poker.point)
        tween(node)
            .to(0.5, { position: v3(0, 0, 0) })
            .start()
    }

    /** 实例方法 */
    private CreateUIPoker(poker: Poker): UIPoker {
        let uiPokerNode = Pool.getIntance().uipoker.get()
        if (uiPokerNode == null) {
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
    private isLocationClose(uiPoker: UIPoker): boolean {
        return this._model.isLocationClose(uiPoker.poker)
    }
    private isLocationOpen(uiPoker: UIPoker): boolean {
        return this._model.isLocationOpen(uiPoker.poker)
    }
    private isIndexPlayTop(uiPoker: UIPoker): boolean {
        return this._model.isIndexPlayTop(uiPoker.poker)
    }
    private isIndexCloseTop(uiPoker: UIPoker): boolean {
        return this._model.isIndexCloseTop(uiPoker.poker)
    }
    private isLocationOpenTop(uiPoker: UIPoker): boolean {
        return this._model.isIndexOpenTop(uiPoker.poker)
    }
}

