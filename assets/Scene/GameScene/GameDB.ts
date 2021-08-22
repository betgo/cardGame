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

    public pokers: Poker[] = [];
    public index = -1;
    public get top(): Poker { return this.pokers[this.pokers.length - 1]; }


    public isPokerEmpty(): boolean { return this.pokers.length === 0 }
    public RemovePoker(poker: Poker) { this.pokers.pop(); poker.parent = null; return poker }
    public AddPoker(poker: Poker) {
        this.pokers.push(poker)
        poker.parent = this
        return poker
    }
    public PopPoker() {
        if (this.top) {
            return this.RemovePoker(this.top)
        } else {
            return null
        }
    }
    /**
     * 洗牌
     * @param count 次数
     */
    public shuffle(count: number = 100) {
        for (let i = 0; i < count; i++) {
            let s = parseInt('' + Math.random() * this.pokers.length)
            let e = parseInt('' + Math.random() * this.pokers.length)
            let temp = this.pokers[s]
            this.pokers[s] = this.pokers[e]
            this.pokers[e] = temp
        }

    }

}

class ReceivePokerGroup extends PokerGroup {
    public isNextPoker(poker: Poker): boolean {
        if (this.suit === poker.suit) {
            if (this.top) {
                return this.top.point + 1 === poker.point
            } else {
                return poker.point === 1
            }
        }
        return false
    }
    suit: SuitEnum | null = null
}
class PlayPokerGroup extends PokerGroup {
    public RemovePoker(poker: Poker) {
        console.log('playpoker');

        let p = super.RemovePoker(poker)
        if (!this.isPokerEmpty()) {
            this.top.status = EpokerStatus.OPEN
            ll.EventManager.getInstance().emit(GAMEVENT.CS_FLIP_POKER, this.top)
        }
        return poker
    }
}
class ClosePokerGroup extends PokerGroup {
}
class OpenAreaGroup extends PokerGroup {
    public AddPoker(poker: Poker) {
        super.AddPoker(poker)
        poker.status = EpokerStatus.OPEN
        return poker
    }
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

        // this.closeAreaGroup.pokers = this._pokers.map(p => p)
        this._pokers.map((p) => {
            this.closeAreaGroup.AddPoker(p)
        })
        // 洗牌
        this.closeAreaGroup.shuffle()
        // [this._closeAreaPokers, this._pokers] = [this._pokers, this.closeAreaPokers]
        // 通知UI层 ，发生变化
        this.emit(GAMEVENT.PLAY)
        // 发牌
        for (let cards = GameDB.CONST_PLAY_GROUPS; cards >= 1; cards--) {
            for (let i = 0; i < cards; i++) {
                let cardGroupIndex = GameDB.CONST_PLAY_GROUPS - cards + i;
                let cardGroup: PlayPokerGroup = this._playAreaPokersGroup[cardGroupIndex];
                let poker = this.closeAreaGroup.PopPoker();
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
            let pokerGroup = new PlayPokerGroup();
            pokerGroup.index = i;
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
    // 是否在Close区域
    public isLocationCloseArea(poker: Poker): boolean {
        return this.closeAreaGroup.pokers.filter(p => p.point === poker.point && p.suit === poker.suit).length > 0;
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
    // 是否在close牌顶
    public isIndexCloseAreaGroupTop(poker: Poker): boolean {
        let pokers = this.closeAreaGroup.pokers
        if (pokers.length > 0) {
            let p = pokers[pokers.length - 1]
            if (p.point === poker.point && p.suit === poker.suit) {
                return true
            }
        }
        return false
    }
    /********************************************
    * Event  Handler
    ********************************************/
    public OnPlayAreaPokerClick(poker: Poker) {
        console.log(`OnPlayAreaPokerClick===>${poker}`);
        if (poker.status === EpokerStatus.OPEN) {
            if (this.isIndexPlayAreaGroupTop(poker)) {
                // 询问手牌区是否可以承接此牌
                for (let i = 0; i < GameDB.CONST_RECEIVE_GROUPS; i++) {
                    let rpg: ReceivePokerGroup = this._receiveAreaPokersGroup[i]
                    if (rpg.isNextPoker(poker)) {
                        // 链接数据库
                        let parent: PlayPokerGroup = poker.parent
                        parent.RemovePoker(poker)
                        rpg.AddPoker(poker)
                        this.emit(GAMEVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA, poker)
                        return
                    }
                }
            }
        }
    }
    public OnPlayClosePokerClick(poker: Poker) {
        console.log(`OnPlayClosePokerClick===>${poker}`);
        if (this.isIndexCloseAreaGroupTop(poker)) {
            let parent: ClosePokerGroup = poker.parent
            parent.RemovePoker(poker)
            this.openAreaGroup.AddPoker(poker);
            this.emit(GAMEVENT.CS_POKER_MOVE_FROM_CLOSEAREA_TO_OPENAREA, poker)
        }
    }
    /********************************************
     * private  API
    ********************************************/


    /********************************************
     * getter && setter
    ********************************************/
    public get pokers(): Poker[] { return this._pokers }
    public set pokers(v) {
        this._pokers = v
    }
    public get closeAreaPokers(): Poker[] { return this.closeAreaGroup.pokers }
    public get openAreaPokers(): Poker[] { return this.openAreaGroup.pokers }
    public get receiveAreaPokersGroup(): ReceivePokerGroup[] { return this._receiveAreaPokersGroup }
    public get playAreaPokersGroup(): PlayPokerGroup[] { return this._playAreaPokersGroup }
    public set playAreaPokersGroup(v) {
        this._playAreaPokersGroup = v
    }

    /********************************************
     * property
    ********************************************/
    // 初始扑克牌
    private _pokers: Poker[] = [];
    // 发牌区盖着的牌
    private closeAreaGroup: ClosePokerGroup = new ClosePokerGroup();
    // 发牌区掀着的牌
    private openAreaGroup: OpenAreaGroup = new OpenAreaGroup();
    // 手牌区
    private _receiveAreaPokersGroup: ReceivePokerGroup[] = [];
    // 玩牌区
    private _playAreaPokersGroup: PlayPokerGroup[] = [];
}