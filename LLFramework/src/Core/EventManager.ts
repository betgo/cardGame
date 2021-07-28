namespace __my__ {
    interface eventInterface {
        callback: Function,
        target: any
    }
    export class EventManager {
        Events: { [key: string]: Array<eventInterface> } //约束示例:{"eventName":[function(){},function(){},.....],......}
        private static _instance: EventManager;

        public static getInstance() {
            if (this._instance == null) {
                this._instance = new EventManager();
            }
            return this._instance
        }
        constructor() {
            this.Events = {}
        }
        /**
         * 发布/ 触发
         * @param eventName 方法名
         * @param args 
         */
        emit(eventName: string, ...args: any) {
            let callbackList = this.Events[eventName] || [];
            callbackList.forEach(({ callback, target }) => callback.apply(target, args))
            return;
            // 如果用js写，遍历的时候要做一下判断是否是函数，ts 用类型约束，在调用或者编译阶段会检测是否合法
            // callbackList.map(fn=>{
            //     if(typeof fn==="function") fn.apply(this,args)
            // })
        }
        /**
         * 订阅/监听
         * @param eventName 事件
         * @param callback 方法
         * @param target call
         */
        on(eventName: string, callback?: Function, target?) {
            // if(!eventName||typeof eventName !=="string") return  ；// 因为用了ts 写，所以这句不用写了，如果是js写，建议加这判断
            let callbackList = this.Events[eventName] || [];
            callback && callbackList.push({ callback, target })
            this.Events[eventName] = callbackList
            return;

        }
        /**
         * 只订阅一次/监听一次：
         * 思路：
         * 1. 重新包装一个回调函数(有名的)，进行注册订阅/监听,
         * 2. 包装函数里面直接调用 once方法的第二个参数回调函数，然后调用off方法 卸载该包装函数
         * @param eventName
         * @param callback
         */
        once(eventName: string, callback?: Function) {
            // if(!eventName||typeof eventName !=="string") return ；
            let decor = (...args: any[]) => {
                callback && callback.apply(this, args)
                this.off(eventName, decor)
            }
            this.on(eventName, decor)
            return this;

        }
        /**
         * 卸载/取消 某一个回调监听(不是取消eventName的所有回调监听),主要配合once一起,实例单独调用,无意义
         * @param eventName
         * @param callback
         */
        remove(eventName: string, callback: Function) {
            let callbackList = this.Events[eventName] || [];
            let resCallbacks = callbackList.filter((e) => e.callback !== callback)
            this.Events[eventName] = resCallbacks
            return this;

        }
        /**
         * 卸载/取消 指定eventName 的所有订阅/监听
         * @param eventName
         * @param callback
         */
        off(eventName: string, callback?: Function) {
            this.Events[eventName] = [];
            callback && callback()
            return this;

        }

    }

}