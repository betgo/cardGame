import { CCClass, Component } from "cc";
import { EventManager } from "../Base/EventManager";


export default class View extends Component {
    private _Event = new EventManager();
    public on(eventName: string, callback: Function, target?: any) {
        return this._Event.on(eventName, callback, target)
    }
    emit(eventName: string, ...args: any) {
        return this._Event.emit(eventName, ...args)
    }


    once(eventName: string, callback?: Function) {
        return this._Event.once(eventName, callback)

    }

    remove(eventName: string, callback: Function) {
        return this._Event.once(eventName, callback)

    }

    off(eventName: string, callback?: Function) {
        return this._Event.once(eventName, callback)
    }
}