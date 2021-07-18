import Poker from "../Config/Poker";

/**
 * 游戏牌局管理者
 */
export default class GameCtrl {
    pokers: Poker[] = [];
    public start() {
        console.log('start');
        for (let point = 1; point <= 13; point++) {
            for (let suit = 0; suit < 4; suit++) {
                let poker = new Poker(point, suit);
                this.pokers.push(poker)

            }
        }
    }

}