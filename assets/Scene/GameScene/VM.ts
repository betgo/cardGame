import { Node, view } from "cc";
import GameDB, { Poker, PokerGroup } from "./GameDB";
import { GameView } from "./GameView/GameView";

// TODO 实现数据与视图的绑定，数据发生变化时，视图自动更新，比如 A poker 被添加到 B poker ，A poker 消失，B出现 
export class VM {
    private _DB
    private _view
    constructor(DB: GameDB, View: GameView) {
        this._DB = DB;
        this._view = View
    }

    viewModel() {
        console.log('viewmodel');

        this._DB.pokers = this.bind(this._view.openSendArea, this._DB.pokers) as Poker[];
        // this._DB.playAreaPokersGroup = this.bind(this._view.openSendArea, this._DB.playAreaPokersGroup) as PokerGroup[];
    }
    private bind(area: Node, P: PokerGroup[] | Poker[]) {
        // console.log(P);

        if (P[0] instanceof PokerGroup) {
            // console.log(2);
            console.log(P);

            P.forEach((pokergroup) => {
                //@ts-ignore
                pokergroup = new Proxy([], {
                    get: function (target: Poker[], property: string) {
                        // console.log('getting ' + property + ' for ' + target);
                        // property is index in this case
                        return target[property];
                    }, set: function (target: Poker[], property: string, value: string) {
                        // console.log('setting ' + property + ' for ' + target + ' with value ' + value);
                        console.log('group');

                        target[property] = value;
                        // you have to return true to accept the changes
                        return true;
                    }
                });

            })
        } else {
            console.log(1);

            P = new Proxy([], {
                get: function (target: Poker[], property: string) {
                    // console.log('getting ' + property + ' for ' + target);
                    // property is index in this case
                    return target[property];
                }, set: function (target: Poker[], property: string, value: string) {
                    // console.log('setting ' + property + ' for ' + target + ' with value ' + value);
                    console.log('pokers');
                    target[property] = value;
                    // you have to return true to accept the changes
                    return true;
                }
            });
        }
        return P
    }
}
