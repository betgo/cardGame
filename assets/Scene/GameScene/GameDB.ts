

export enum SuitEnum {
    Spades = 0,
    Hearts = 1,
    Clubs = 2,
    Diamonds = 3,
}

export class Poker {
    public point: number = -1;
    public suit: SuitEnum = SuitEnum.Clubs

    constructor(point?: number, suit?: SuitEnum) {
        if (point) this.point = point
        if (suit) this.suit = suit
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
                let poker = new Poker(point, suit);
                this.pokers.push(poker)
            }
        }
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