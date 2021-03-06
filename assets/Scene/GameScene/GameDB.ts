import { EventTarget } from "cc";
import { ELocation, EpokerStatus, SuitEnum } from "../../Config/ConfigEnum";
import { Model } from "../../Framework/MVC/Model";
import { UIPoker } from "../../View/UIPoker/UIPoker";
import { GAME_EVENT } from "./GameEvent";

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
    public indexInGroup() {
        return this.parent?.IndexOfPokers(this)
    }
    public isConcatable(p: Poker): boolean {
        return this.point === p.point + 1 && !this.isSimilarSuit(p.suit)
    }
    public isSimilarSuit(suit: SuitEnum) {
        return (suit + this.suit) % 2 === 0
    }
}

export class PokerGroup {

    constructor(location: ELocation) {
        this.location = location
    }

    public pokers: Poker[] = [];
    public index = -1;
    public get top(): Poker { return this.pokers[this.pokers.length - 1]; }
    public get bottom(): Poker { return this.pokers[0]; }
    public location: ELocation | null = null;

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
    public GetPoker(index: number) {
        if (!this.isPokerEmpty() && index >= -this.pokers.length) {
            let i = index >= 0 ? index : this.pokers.length + index
            return this.pokers[i]
        }
        return null;
    }
    public IndexOfPokers(poker: Poker) {
        return this.pokers.indexOf(poker)
    }
    /**
     * ??????
     * @param count ??????
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
    public isConcatPoker(poker: Poker) {
        if (this.isPokerEmpty()) {
            return poker.point === 13
        } else {
            return this.top.isConcatable(poker)
        }

    }

}

class ReceivePokerGroup extends PokerGroup {

    constructor() {
        super(ELocation.RECERIVE)
    }
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
    constructor() {
        super(ELocation.PLAY)
    }
    public RemovePoker(poker: Poker) {

        let p = super.RemovePoker(poker)
        if (!this.isPokerEmpty() && this.top.status === EpokerStatus.CLOSE) {
            this.top.status = EpokerStatus.OPEN
            ll.EventManager.getInstance().emit(GAME_EVENT.CS_FLIP_POKER, this.top)
        }
        return poker
    }
}
class ClosePokerGroup extends PokerGroup {
    constructor() {
        super(ELocation.CLOSE)
    }
    public AddPoker(poker: Poker) {
        super.AddPoker(poker)
        poker.status = EpokerStatus.CLOSE
        return poker
    }
}
class OpenAreaGroup extends PokerGroup {
    constructor() {
        super(ELocation.OPEN)
    }
    public AddPoker(poker: Poker) {
        super.AddPoker(poker)
        poker.status = EpokerStatus.OPEN
        return poker
    }

}

/**
 * ?????????????????????
 */
export default class GameDB extends Model {

    /********************************************
     * Public static API
     ********************************************/
    // public static Instance(): GameDB {
    //     let gameDB = new GameDB();
    //     return gameDB;
    // }

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

        this._pokers.map((p) => {
            this.closeAreaGroup.AddPoker(p)
        })
        // ??????
        this.closeAreaGroup.shuffle()
        // ??????UI??? ???????????????
        this.emit(GAME_EVENT.PLAY)
        // ??????
        for (let cards = GameDB.CONST_PLAY_GROUPS; cards >= 1; cards--) {
            for (let i = 0; i < cards; i++) {
                let cardGroupIndex = GameDB.CONST_PLAY_GROUPS - cards + i;
                let cardGroup: PlayPokerGroup = this._playAreaPokersGroup[cardGroupIndex];
                let poker = this.closeAreaGroup.PopPoker();
                if (poker) {
                    (poker.status = i === 0 ? EpokerStatus.OPEN : EpokerStatus.CLOSE)
                    cardGroup.AddPoker(poker)
                    this.emit(GAME_EVENT.INIT_GROUP_CARD, cardGroupIndex, GameDB.CONST_PLAY_GROUPS - cards, poker)
                }

            }
        }
    }
    public Init() {

        // ?????????????????????
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
        // ???????????????
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit, EpokerStatus.CLOSE);
                this.pokers.push(poker)
            }
        }
    }
    // ?????????play??????
    public isLocationPlayArea(poker: Poker): boolean {
        return poker.parent?.location === ELocation.PLAY
    }
    // ?????????Close??????
    public isLocationClose(poker: Poker): boolean {
        return poker.parent?.location === ELocation.CLOSE

    }
    // ?????????Open??????
    public isLocationOpen(poker: Poker): boolean {
        return poker.parent?.location === ELocation.OPEN

    }
    // ?????????Receive??????
    public isLocationReceive(poker: Poker): boolean {
        return poker.parent.location === ELocation.RECERIVE

    }
    // ????????????????????????
    public isIndexPlayTop(poker: Poker): boolean {
        for (let gp of this.playAreaPokersGroup) {
            if (gp.top === poker) {
                return true
            }
        }
        return false
    }
    // ?????????close??????
    public isIndexCloseTop(poker: Poker): boolean {
        if (this.isLocationClose(poker)) {
            let gp: ClosePokerGroup = poker.parent
            return gp.top === poker;
        }
        return false;
    }
    // ?????????Open??????
    public isIndexOpenTop(poker: Poker): boolean {
        if (this.isLocationOpen(poker)) {
            let gp: OpenAreaGroup = poker.parent
            return gp.top === poker;
        }
        return false;
    }
    // ?????????Receive??????
    public isIndexReceiveTop(poker: Poker): boolean {
        if (this.isLocationReceive(poker)) {
            let gp: ReceivePokerGroup = poker.parent
            return gp.top === poker;
        }
        return false;
    }
    /********************************************
    * Event  Handler
    ********************************************/
    public OnPlayAreaPokerClick(poker: Poker) {
        if (poker.status === EpokerStatus.OPEN) {
            if (this.isIndexPlayTop(poker)) {
                this._pokerToReceive(poker, GAME_EVENT.CS_POKER_MOVE_FROM_PLAYAREA_TO_RECEIVEAREA);
            } else {
                // ??????????????????????????????
                // play???????????????????????????
                let parent: PokerGroup = poker.parent
                for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
                    let rpg: PlayPokerGroup = this._playAreaPokersGroup[i]
                    if (rpg.isConcatPoker(poker)) {
                        // ???????????????
                        let pokers: Poker[] = [];
                        while (true) {
                            let top = parent.PopPoker();
                            top && pokers.push(top)
                            if (top == poker) {
                                break;
                            }
                        }
                        for (let i = pokers.length - 1; i >= 0; i--) {
                            let p: Poker = pokers[i]
                            rpg.AddPoker(p)
                        }
                        this.emit(GAME_EVENT.CS_POKERS_MOVE_TO_PLAY, pokers)
                        return
                    }
                }
            }
        }
    }
    public OnClosePokerClick(poker: Poker) {
        if (this.isIndexCloseTop(poker)) {
            let parent: ClosePokerGroup = poker.parent
            parent.RemovePoker(poker)
            this._openAreaGroup.AddPoker(poker);
            this.emit(GAME_EVENT.CS_POKER_MOVE_FROM_CLOSEAREA_TO_OPENAREA, poker)
        }
    }
    public OnOpenPokerClick(poker: Poker) {
        if (poker.status === EpokerStatus.OPEN) {
            if (this.isIndexOpenTop(poker)) {
                this._pokerToReceive(poker, GAME_EVENT.CS_POKER_MOVE_FROM_OPENAREA_TO_RECEIVEAREA)

            }
        }
    }
    // ???????????????
    public OnReceivePokerClick(poker: Poker) {
        if (poker.status === EpokerStatus.OPEN) {
            if (this.isIndexReceiveTop(poker)) {
                let parent: PokerGroup = poker.parent
                for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
                    let rpg: PlayPokerGroup = this._playAreaPokersGroup[i]
                    if (rpg.isConcatPoker(poker)) {
                        // ???????????????
                        parent.RemovePoker(poker)
                        rpg.AddPoker(poker)
                        this.emit(GAME_EVENT.CS_POKER_MOVE_TO_PLAY, poker)
                        return
                    }
                }
            }
        }
    }
    // close ????????????
    public onClickCloseBottom() {
        console.assert(this.closeAreaGroup.isPokerEmpty())
        let pokerIsMove = !this.openAreaGroup.isPokerEmpty();
        let pokers = [];

        while (!this.openAreaGroup.isPokerEmpty()) {
            let poker = this.openAreaGroup.PopPoker();
            this.closeAreaGroup.AddPoker(poker!)
            pokers.push(poker)

        }
        if (pokerIsMove) {
            this.emit(GAME_EVENT.CS_ALL_POKERS_MOVE_FROM_OPENAREA_TO_CLOSEAREA, pokers)
        }
    }
    /********************************************
     * private  API
    ********************************************/
    // poker?????????receive and play???
    private _pokerToReceive(poker: Poker, EventType: string) {
        let parent: PokerGroup = poker.parent

        // ???????????????????????????????????????
        for (let i = 0; i < GameDB.CONST_RECEIVE_GROUPS; i++) {
            let rpg: ReceivePokerGroup = this._receiveAreaPokersGroup[i]
            if (rpg.isNextPoker(poker)) {
                // ???????????????
                let parent: PokerGroup = poker.parent
                parent.RemovePoker(poker)
                rpg.AddPoker(poker)
                this.emit(EventType, poker)
                return
            }
        }
        // play???????????????????????????
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let rpg: PlayPokerGroup = this._playAreaPokersGroup[i]
            if (rpg.isConcatPoker(poker)) {
                // ???????????????
                parent.RemovePoker(poker)
                rpg.AddPoker(poker)
                this.emit(GAME_EVENT.CS_POKER_MOVE_TO_PLAY, poker)
                return
            }
        }
    }

    /********************************************
     * getter && setter
    ********************************************/
    public get pokers(): Poker[] { return this._pokers }
    public set pokers(v) {
        this._pokers = v
    }
    public get closeAreaPokers(): Poker[] { return this.closeAreaGroup.pokers }
    public get openAreaPokers(): Poker[] { return this._openAreaGroup.pokers }
    public get openAreaGroup(): OpenAreaGroup { return this._openAreaGroup }
    public get receiveAreaPokersGroup(): ReceivePokerGroup[] { return this._receiveAreaPokersGroup }
    public get playAreaPokersGroup(): PlayPokerGroup[] { return this._playAreaPokersGroup }
    public set playAreaPokersGroup(v) {
        this._playAreaPokersGroup = v
    }

    /********************************************
     * property
    ********************************************/
    // ???????????????
    private _pokers: Poker[] = [];
    // ?????????????????????
    private closeAreaGroup: ClosePokerGroup = new ClosePokerGroup();
    // ?????????????????????
    private _openAreaGroup: OpenAreaGroup = new OpenAreaGroup();
    // ?????????
    private _receiveAreaPokersGroup: ReceivePokerGroup[] = [];
    // ?????????
    private _playAreaPokersGroup: PlayPokerGroup[] = [];
}