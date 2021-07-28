import { EpokerStatus, SuitEnum } from "../../Config/ConfigEnum";
import { GAMEVENT } from "./GameEvent";

export class Poker {
    public point: number = -1;
    public suit: SuitEnum = SuitEnum.Clubs
    public status: EpokerStatus = EpokerStatus.CLOSE

    constructor(point: number, suit: SuitEnum, status: EpokerStatus) {
        this.point = point
        this.suit = suit
        this.status = status
    }
}

export class PokerGroup {

    private _pokers: Poker[] = [];
    public get pokers(): Poker[] {
        return this._pokers;
    }
}



/**
 * 游戏牌局数据库
 */
export default class GameDB {

    /********************************************
     * Public static API
     ********************************************/
    public static Init(): GameDB {
        let gameDB = new GameDB();
        return gameDB;
    }

    public static readonly CONST_RECEIVE_GROUPS: number = 4;
    public static readonly CONST_PLAY_GROUPS: number = 7;
    /********************************************
     * Public  API
     ********************************************/
    public Play() {
        [this._closeAreaPokers, this._pokers] = [this._pokers, this.closeAreaPokers]
        // 通知UI层 ，发生变化
        ll.EventManager.getInstance().emit(GAMEVENT.PLAY, this._pokers)
    }

    /********************************************
     * private  API
    ********************************************/
    constructor() {
        // 初始化牌局结构
        for (let i = 0; i < GameDB.CONST_RECEIVE_GROUPS; i++) {
            let pokerGroup = new PokerGroup();
            this._receiveAreaPokersGroup.push(pokerGroup);
        }
        for (let i = 0; i < GameDB.CONST_PLAY_GROUPS; i++) {
            let pokerGroup = new PokerGroup();
            this._playAreaPokersGroup.push(pokerGroup);
        }
        // 初始化牌局
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit, EpokerStatus.CLOSE);
                this.pokers.push(poker)
            }
        }
        // 派发初始牌局事件
        ll.EventManager.getInstance().emit(GAMEVENT.INIT_POKER, this._pokers)
    }

    /********************************************
     * getter && setter
    ********************************************/
    public get pokers(): Poker[] { return this._pokers }
    public get closeAreaPokers(): Poker[] { return this._closeAreaPokers }
    public get openAreaPokers(): Poker[] { return this._openAreaPokers }
    public get receiveAreaPokersGroup(): PokerGroup[] { return this._receiveAreaPokersGroup }
    public get playAreaPokersGroup(): PokerGroup[] { return this._playAreaPokersGroup }

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
    private _receiveAreaPokersGroup: PokerGroup[] = [];
    // 玩牌区
    private _playAreaPokersGroup: PokerGroup[] = [];
}