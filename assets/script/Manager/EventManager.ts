export default class EventManager {

    /**
    * 记录所有事件类型与对应回调函数
    * key:事件枚举值
    * value: callback
    */
    private static events: { [type: number]: Handler[] } = {};

    /**
     * 触发一次
     * key:事件枚举
     * value:callback
     */

    private static onceEvents: { [type: number]: Handler[] } = {};

    //事件注册
    public static on(type: number, cb: Function, target: Object): Handler {
        if (!this.events.hasOwnProperty(type)) {
            this.events[type] = [];
        }
        //检测是否重复注册
        for (let i = this.events[type].length; i >= 0; --i) {
            if (this.events[type][i].equal(cb, target)) return null;
        }

        let _h = new Handler(cb, target);
        this.events[type].push(_h);
        return _h;
    }

    //单次触发事件注册
    public static once(type: number, cb: Function, target: Object): Handler {
        if (!this.onceEvents.hasOwnProperty(type)) {
            this.onceEvents[type] = [];
        }
        //检测是否重复注册
        for (let i = this.onceEvents[type].length; i >= 0; --i) {
            if (this.onceEvents[type][i].equal(cb, target)) return null;
        }

        let handler = new Handler(cb, target);
        this.onceEvents[type].push(handler);
        return handler;
    }

    //注销事件
    public static off(type: number | string, h?: Handler | Function, target?: Object) {
        if (!h) {
            this.events[type] = [];
            this.onceEvents[type] = [];
            return;
        }

        if (this.events.hasOwnProperty(type)) {
            for (let i = this.events[type].length - 1; i >= 0; --i) {
                if (this.events[type][i].equal(h, target)) {
                    this.events[type].splice(i, 1);
                    break;
                }
            }
        }

        if (this.onceEvents.hasOwnProperty(type)) {
            for (let i = this.onceEvents[type].length - 1; i >= 0; --i) {
                if (this.onceEvents[type][i].equal(h, target)) {
                    this.onceEvents[type].splice(i, 1);
                    break;
                }
            }
        }
    }

    //注销组内全部
    public static offGroup(type: number | string, h: Handler[]) {
        if (this.events.hasOwnProperty(type)) {
            for (let i = h.length - 1; i >= 0; --i) {
                for (let j = this.events[type].length - 1; j >= 0; --j) {
                    if (this.events[type][j].id == h[i].id) {
                        this.events[type].splice(j, 1);
                        break;
                    }
                }
            }
        }
        if (this.onceEvents.hasOwnProperty(type)) {
            for (let i = h.length - 1; i >= 0; --i) {
                for (let j = this.onceEvents[type].length - 1; j >= 0; --j) {
                    if (this.onceEvents[type][j].id == h[i].id) {
                        this.onceEvents[type].splice(j, 1);
                        break;
                    }
                }
            }
        }
    }

    //发事件
    public static emit(type: number, d1?: any, d2?: any, d3?: any, d4?: any, d5?: any) {
        if (this.events.hasOwnProperty(type)) {
            let handlers = this.events[type];
            for (let i = 0; i < handlers.length; ++i) {
                if (undefined === d1) {
                    handlers[i].cb.call(handlers[i].target)
                } else if (undefined === d2) {
                    handlers[i].cb.call(handlers[i].target, d1);
                } else if (undefined === d3) {
                    handlers[i].cb.call(handlers[i].target, d1, d2);
                } else if (undefined === d4) {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3);
                } else if (undefined === d5) {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3, d4);
                } else {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3, d4, d5);
                }
            }
        }

        if (this.onceEvents.hasOwnProperty(type)) {
            let handlers = this.onceEvents[type];
            for (let i = 0, count = handlers.length; i < count; ++i) {
                if (undefined === d1) {
                    handlers[i].cb.call(handlers[i].target);
                } else if (undefined === d2) {
                    handlers[i].cb.call(handlers[i].target, d1);
                } else if (undefined === d3) {
                    handlers[i].cb.call(handlers[i].target, d1, d2);
                } else if (undefined === d4) {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3);
                } else if (undefined === d5) {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3, d4);
                } else {
                    handlers[i].cb.call(handlers[i].target, d1, d2, d3, d4, d5);
                }
            }
            delete this.onceEvents[type];
        }
    }
}

/**
 * 回调函数，包含函数和函数所属的对象
 */
export class Handler {
    private static idCount = 0;//自增id
    private _id: number;
    public cb: Function;       //回调函数
    public target: Object;     //回调函数所属对象

    /**
     * @param {Function} cb 回调函数
     * @param {Object} target 回调函数所属的对象
     */
    constructor(cb: Function, target: Object) {
        this._id = Handler.idCount++;
        this.target = target;
        this.cb = cb;
    }

    /**
     * 比较两个回调是否一样
     * @param {Function} cb
     * @param {Object} target
     */
    equal(cb: Function, target: Object): boolean {
        return this.target === target && this.cb == cb;
    }

    public get id() {
        return this._id;
    }
}