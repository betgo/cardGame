import { instantiate, Prefab, Node } from "cc";
import { GameView } from "../../View/GameView/GameView";
import Poker from "../../View/Poker/Poker";



/**
 * 游戏牌局数据库
 */
export default class GameDB {

    /********************************************
     * Public static API
     ********************************************/
    public static Create(): GameDB {
        let gameDB = new GameDB;
        return gameDB;
    }
    /********************************************
     * Public  API
     ********************************************/


    /********************************************
     * private  API
    ********************************************/
    constructor() {
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

    /********************************************
     * property
    ********************************************/
    private _pokers: Poker[] = [];
}