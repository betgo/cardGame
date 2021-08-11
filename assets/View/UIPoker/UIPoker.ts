
import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Color, color, SystemEventType, Event, systemEvent } from 'cc';
import { EpokerStatus, SuitEnum } from '../../Config/ConfigEnum';
import View from '../../Framework/MVC/View';
import { Poker } from '../../Scene/GameScene/GameDB';
import { GameView } from '../../Scene/GameScene/GameView/GameView';
const { ccclass, property } = _decorator;

const PONIT_MAP = {
    '1': 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    '11': 'J',
    '12': 'Q',
    '13': 'K',
}

@ccclass('UIpoker')
export class UIPoker extends View {

    @property(Label)
    number: Label = null!;
    @property(Sprite)
    suit: Sprite = null!;
    @property(Sprite)
    suitSmall: Sprite = null!;
    // RESOURCE
    @property(Sprite) TexFrontBg: Sprite = null!;
    @property(Sprite) TexBackBg: Sprite = null!;
    @property(Sprite) Back: Sprite = null!;
    @property([SpriteFrame]) suitList: SpriteFrame[] = [];
    @property([SpriteFrame]) suitListSmall: SpriteFrame[] = [];
    @property([SpriteFrame]) TexFaces: SpriteFrame[] = [];

    private redTextColor = color(183, 23, 40);
    private blackTextColor = Color.BLACK;

    public get poker() { return this._poker }
    private _poker: Poker = null!;
    private _view: GameView = null!;
    /********************************************
    * LifeCycle
    ********************************************/
    public start() {

    }

    onEnable() {
        // 注册触摸事件
        this.node.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(SystemEventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(SystemEventType.TOUCH_CANCEL, this.onTouchEnd, this)
        this.node.on(SystemEventType.TOUCH_END, this.onTouchEnd, this)
    }

    onDestroy() {
        this.node.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
        this.node.off(SystemEventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.off(SystemEventType.TOUCH_CANCEL, this.onTouchEnd, this)
        this.node.off(SystemEventType.TOUCH_END, this.onTouchEnd, this)
    }

    init(poker: Poker, view: GameView) {
        poker.Bind(this)
        this._poker = poker
        this._view = view

        if (poker.point < 11) {
            this.suit.spriteFrame = this.suitList[poker.suit]
        } else {
            this.suit.spriteFrame = this.TexFaces[poker.point - 11]
        }
        this.number.string = `${PONIT_MAP[poker.point + '']}`;
        this.number.color = (poker.suit === SuitEnum.Clubs || poker.suit === SuitEnum.Spades) ? this.blackTextColor : this.redTextColor
        this.suitSmall.spriteFrame = this.suitListSmall[poker.suit]
        this.refresh()
    }


    refresh() {
        if (this._poker.status === EpokerStatus.CLOSE) {
            this.Back.node.active = true
        } else {
            this.Back.node.active = false

        }
    }

    public isOpen() {
        return this._poker.status === EpokerStatus.OPEN
    }

    public isPoint(num: number) {
        return this._poker.point === num
    }
    /********************************************
     * Event Handler
    ********************************************/
    onTouchStart(_event: any) {
        console.log("touch:start");

    }
    onTouchMove(_event: any) {
        console.log("touch:move");

    }
    onTouchEnd(_event: any) {
        console.log("touch:end");
        this._view.OnClickUIPoker(this)
    }
}
