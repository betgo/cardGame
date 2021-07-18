import { SuitEnum } from "./ConfigEnum";

export default class Poker {
    public point: number = -1;
    public suit: SuitEnum = SuitEnum.Clubs

    constructor(point?: number, suit?: SuitEnum) {
        if (point) this.point = point
        if (suit) this.suit = suit
    }
}