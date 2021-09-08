
import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Color, color, SystemEventType, Event, systemEvent, EventTouch, Vec3, Vec2, v3, tween } from 'cc';
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
    private _isTouchStart = false;
    private _isDragStart = false;
    private _StarToDragSchedule: Function = null!;
    private _DragStartPostion: Vec3 = null!;
    private _TouchLocation: Vec2 | null = null;
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

        this.number.string = `${PONIT_MAP[poker.point + '']}`;
        this.number.color = (poker.suit === SuitEnum.Clubs || poker.suit === SuitEnum.Spades) ? this.blackTextColor : this.redTextColor
        if (poker.point < 11) {
            this.suit.spriteFrame = this.suitList[poker.suit]
        } else {
            this.suit.spriteFrame = this.TexFaces[poker.point - 11]
        }
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
    //TODO 实现拖拽
    onTouchStart(_event: EventTouch) {
        if (this._isTouchStart) return
        this._isTouchStart = true
        this._isDragStart = false
        this._TouchLocation = _event.getLocation();
        this._StarToDragSchedule = () => {
            console.log(">>>>start Drag ");
            this._DragStartPostion = this.node.position.clone()
            this._isDragStart = true
        }
        this.scheduleOnce(this._StarToDragSchedule, 0.2)

        console.log('touch!!');

    }
    onTouchMove(_event: EventTouch) {
        if (!this._isTouchStart) return;
        if (this._isDragStart) {
            if (this._TouchLocation === null) {
                this._TouchLocation = _event.getLocation();
            }
            let newLocation = _event.getLocation();
            let dx = newLocation.x - this._TouchLocation.x
            let dy = newLocation.y - this._TouchLocation.y
            // console.log('x: ', this._DragStartPostion.x + dx, ' y: ', this._DragStartPostion.y + dy);

            this.node.setPosition(this._DragStartPostion.x + dx, this._DragStartPostion.y + dy)
            // this.node.setWorldPosition(v3(this._DragStartPostion.x + dx, this._DragStartPostion.y + dy, 0))
        }
    }
    onTouchEnd(_event: any) {
        console.log('end!!');

        if (!this._isTouchStart) return;
        this._isTouchStart = false;
        this.unschedule(this._StarToDragSchedule)
        this._TouchLocation = null;
        // this._view.OnClickUIPoker(this)
        //TODO 复位动画
        if (this._isDragStart) {
            this._isDragStart = false
            tween(this.node)
                .to(.2, { position: this._DragStartPostion })
                .start()
        }
    }
}
