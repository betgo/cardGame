declare namespace __my__ {
    interface eventInterface {
        callback: Function;
        target: any;
    }
    export class EventManager {
        Events: {
            [key: string]: Array<eventInterface>;
        };
        private static _instance;
        static getInstance(): EventManager;
        constructor();
        /**
         * 发布/ 触发
         * @param eventName 方法名
         * @param args
         */
        emit(eventName: string, ...args: any): void;
        /**
         * 订阅/监听
         * @param eventName 事件
         * @param callback 方法
         * @param target call
         */
        on(eventName: string, callback?: Function, target?: any): void;
        /**
         * 只订阅一次/监听一次：
         * 思路：
         * 1. 重新包装一个回调函数(有名的)，进行注册订阅/监听,
         * 2. 包装函数里面直接调用 once方法的第二个参数回调函数，然后调用off方法 卸载该包装函数
         * @param eventName
         * @param callback
         */
        once(eventName: string, callback?: Function): this;
        /**
         * 卸载/取消 某一个回调监听(不是取消eventName的所有回调监听),主要配合once一起,实例单独调用,无意义
         * @param eventName
         * @param callback
         */
        remove(eventName: string, callback: Function): this;
        /**
         * 卸载/取消 指定eventName 的所有订阅/监听
         * @param eventName
         * @param callback
         */
        off(eventName: string, callback?: Function): this;
    }
    export {};
}
import ll = __my__;