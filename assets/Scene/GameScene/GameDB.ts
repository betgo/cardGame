import { EventTarget } from "cc";
import { EpokerStatus, SuitEnum } from "../../Config/ConfigEnum";
import { Model } from "../../Framework/MVC/Model";
import { UIPoker } from "../../View/UIPoker/UIPoker";
import { GAMEVENT } from "./GameEvent";

export class Poker {
    public point: number = -1;
    public suit: SuitEnum = SuitEnum.Clubs
    public status: EpokerStatus = EpokerStatus.CLOSE
    private _view: UIPoker | null = null;

    public get view() { return this._view }
    public parent: any = null
    constructor(point: number, suit: SuitEnum, status: EpokerStatus) {
        this.point = point
        this.suit = suit
        this.status = status
    }

    public Bind(view: UIPoker) {
        this._view = view
    }
    public UnBind() {
        this._view = null;
    }
    public isConcatable(p: Poker): boolean {
        return this.point === p.point + 1 && this.isSimilarSuit(p.suit)
    }
    public isSimilarSuit(suit: SuitEnum) {
        return (suit + this.suit) % 2 === 0
    }
}

export class PokerGroup {

    private _pokers: Poker[] = [];
    public get pokers(): Poker[] {
        return this._pokers;
    }
    public set pokers(v) {
        this._pokers = v;
    }
    public index = -1;


    public isPokerEmpty(): boolean { return this._pokers.length === 0 }
    public RemovePoker(poker: Poker) { this._pokers.pop(); poker.parent = null; return poker }
    public TopPoker(): Poker { return this._pokers[this._pokers.length - 1]; }
    public AddPoker(poker: Poker) {
        this._pokers.push(poker)
        poker.parent = this
        return poker
    }
}

class ReceivePokerGroup extends PokerGroup {
    public isNextPoker(poker: Poker): boolean {
        if (this.suit === poker.suit) {
            if (this.TopPoker()) {
                return this.TopPoker().point + 1 === poker.point
            } else {
                return poker.point === 1
            }
        }
        return false
    }
    suit: SuitEnum | null = null
}


/**
 * 游戏牌局数据库
 */
export default class GameDB extends Model {

    /********************************************
     * Public static API
     ********************************************/
    public static Instance(): GameDB {
        let gameDB = new GameDB();
        return gameDB;
    }

    public static readonly CONST_RECEIVE_GROUPS: number = 4;
    public static readonly CONST_PLAY_GROUPS: number = 7;
    /********************************************
     * life  API
     ********************************************/
    Exit() {

    }
    /********************************************
     * Public  API
     ********************************************/
    public Play() {

        this._closeAreaPokers = this._pokers.map(p => p)
        // 洗牌
        this.shuffle(this._closeAreaPokers);
        // [this._closeAreaPokers, this._pokers] = [this._pokers, this.closeAreaPokers]
        // 通知UI层 ，发生变化
        this.emit(GAMEVENT.PLAY)
        // 发牌
        for (let cards = GameDB.CONST_PLAY_GROUPS; cards >= 1; cards--) {
            for (let i = 0; i < cards; i++) {
                let cardGroupIndex = GameDB.CONST_PLAY_GROUPS - cards + i;
                let cardGroup: ReceivePokerGroup = this._playAreaPokersGroup[cardGroupIndex];
                let poker = this._closeAreaPokers.pop();
                if (poker) {
                    (poker.status = i === 0 ? EpokerStatus.OPEN : EpokerStatus.CLOSE)
                    cardGroup.AddPoker(poker)
                    this.emit(GAMEVENT.INIT_GROUP_CARD, cardGroupIndex, GameDB.CONST_PLAY_GROUPS - cards, poker)
                }

            }
        }
    }
    public Init() {
        // 初始化牌局结构
        for (let i = 0; i < GameDB.CONST_RECEIVE_GROUPS; i++) {
            let pokerGroup = new ReceivePokerGroup();
            pokerGroup.index = i;
            pokerGroup.suit = i
            this._receiveAreaPokersGroup.push(pokerGroup);
        }
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let pokerGroup = new ReceivePokerGroup();
            pokerGroup.index = i;
            pokerGroup.suit = i
            this._playAreaPokersGroup.push(pokerGroup);
        }
        // 初始化牌局
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit, EpokerStatus.CLOSE);
                this.pokers.push(poker)
            }
        }
    }
    // 是否在play区域
    public isLocationPlayArea(poker: Poker): boolean {
        return this.playAreaPokersGroup.filter(
            pg => pg.pokers.filter(p => p.point === poker.point && p.suit === poker.suit).length > 0
        ).length > 0
    }
    // 是否在牌顶
    public isIndexPlayAreaGroupTop(poker: Poker): boolean {
        for (let pg of this.playAreaPokersGroup) {
            let pokers = pg.pokers
            if (pokers.length > 0) {
                let p = pokers[pokers.length - 1]
                if (p.point === poker.point && p.suit === poker.suit) {
                    return true
                }
            }
        }
        return false
    }
    /********************************************
    * Event  Handler
    ********************************************/
    public OnPlayAreaPokerClick(poker: Poker) {
        console.log(`OnEventPokerMoveFromPlayAreaToReceiveArea===>${poker}`);
        if (poker.status === EpokerStatus.OPEN) {
            if (this.isIndexPlayAreaGroupTop(poker)) {
                // 询问手牌区是否可以承接此牌
                for (let i = 0; i < GameDB.CONST_RECEIVE_GROUPS; i++) {
                    let rpg: ReceivePokerGroup = this._receiveAreaPokersGroup[i]
                    if (rpg.isNextPoker(poker)) {
                        // 链接数据库
                        let parent: ReceivePokerGroup = poker.parent
                        parent.RemovePoker(poker)
                        rpg.AddPoker(poker)
                        this.emit(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, poker)
                        return
                    }
                }
            }
        }
    }
    /********************************************
     * private  API
    ********************************************/


    // 洗牌
    private shuffle(pokers: Poker[], count: number = 100) {
        for (let i = 0; i < count; i++) {
            let s = parseInt('' + Math.random() * pokers.length)
            let e = parseInt('' + Math.random() * pokers.length)
            let temp = pokers[s]
            pokers[s] = pokers[e]
            pokers[e] = temp
        }

    }

    /********************************************
     * getter && setter
    ********************************************/
    public get pokers(): Poker[] { return this._pokers }
    public set pokers(v) {
        this._pokers = v
    }
    public get closeAreaPokers(): Poker[] { return this._closeAreaPokers }
    public get openAreaPokers(): Poker[] { return this._openAreaPokers }
    public get receiveAreaPokersGroup(): ReceivePokerGroup[] { return this._receiveAreaPokersGroup }
    public get playAreaPokersGroup(): ReceivePokerGroup[] { return this._playAreaPokersGroup }
    public set playAreaPokersGroup(v) {
        this._playAreaPokersGroup = v
    }

    /********************************************
     * property
    ********************************************/
    // 初始扑克牌
    private _pokers: Poker[] = [];
    // 发牌区盖着的牌
    private _closeAreaPokers: Poker[] = [];
    // 发牌区掀着的牌
    private _openAreaPokers: Poker[] = [];
    // 手牌区
    private _receiveAreaPokersGroup: ReceivePokerGroup[] = [];
    // 玩牌区
    private _playAreaPokersGroup: ReceivePokerGroup[] = [];
}