import { Asset, assetManager, error, warn } from "cc";
import EventManager from "./EventManager";
import { EventConst } from "../Const/EventConst";

export default class LoadManager {
    //文件夹路径对应资源
    protected static dirAsset: { [key: string]: Asset[] };
    //远程服务器下载的资源
    protected static serverAsset: { [key: string]: Asset[] };
    //已加载完成的资源
    protected static singleAsset: { [key: string]: Asset };

    public static init() {
        this.dirAsset = {};
        this.singleAsset = {};
        this.serverAsset = {};
    }

    //加载资源 mask：是否遮罩不让点击
    public static loadRes(url: string, cb: (asset: any) => void, mask: boolean = false) {
        if (!!this.singleAsset[url]) {
            cb(this.singleAsset[url])
        } else {
            // if (mask) {

            // }
            assetManager.resources.load(url, (err, res) => {
                if (err) {
                    warn(err.message || err)
                    cb(null);
                    return;
                }

                this.singleAsset[url] = res;
                cb(res);
            })
        }
    }

    //加载文件夹资源
    public static loadResDir(dir: string, cb: (assets: any[]) => void, type?: typeof Asset, mask?: boolean) {
        if (this.dirAsset[dir]) {
            cb(this.dirAsset[dir]);
            return;
        }
        if (type) {
            assetManager.resources.loadDir(dir, type, this.updateProgress.bind(this), (err, data) => {
                if (err) {
                    warn(err.message || err)
                    cb(null);
                    return;
                }

                this.dirAsset[dir] = data;
                for (let i = data.length; i >= 0; --i) {
                    this.singleAsset[data[i].nativeUrl] = data[i];
                }
                cb(data)
            })
        } else {
            assetManager.resources.loadDir(dir, this.updateProgress.bind(this), (err, data) => {
                if (err) {
                    error(err.message || err)
                    cb(null);
                    return;
                }

                this.dirAsset[dir] = data;
                for (let i = data.length; i >= 0; --i) {
                    this.singleAsset[data[i].nativeUrl] = data[i];
                }
                cb(data)
            })
        }
    }

    //加载远程资源
    public static load(serverUrl: string, url: string, cb: (asset) => void, mask?: boolean) {
        if (!!this.serverAsset[serverUrl] && !!this.serverAsset[serverUrl][url]) {
            cb(this.serverAsset[serverUrl][url]);
        } else {
            if (!this.serverAsset[serverUrl]) this.serverAsset[serverUrl] = {} as any;

            if (mask) {
                //显示
            }

            assetManager.resources.load(serverUrl + url, (err, res) => {
                if (mask) {
                    //隐藏
                }
                if (err) {
                    console.warn(`远程资源下载失败 serverUrl = ${serverUrl}, url = ${url}`);
                    console.warn(err.message || err);
                    cb(null);
                    return;
                }

                this.serverAsset[serverUrl][url] = res;
                cb(res);
            });
        }
    }

    //获取加载过的资源
    public static getAsset(url: string, serverUrl?: string): Asset {
        if (undefined === serverUrl) {
            if (!this.singleAsset[url]) {
                console.warn(`尚未加载资源：${url}`, url);
                return null;
            }
            return this.singleAsset[url];
        } else {
            if (!this.serverAsset[serverUrl] || !this.serverAsset[serverUrl][url]) {
                console.warn(`尚未加载资源：${serverUrl}   ${url}`);

                return null;
            }
            return this.serverAsset[serverUrl][url];
        }
    }

    //获取文件夹下加载完成的资源
    public static getAssets(url: string, serverUrl?: string): any[] {
        let assets: Asset[] = [];
        if (undefined === serverUrl) {
            //从本地获取的资源
            for (let key in this.singleAsset) {
                key.indexOf(url) >= 0 && assets.push(this.singleAsset[key]);
            }
            return assets;
        } else {
            //从服务器获取的资源
            if (this.serverAsset[serverUrl]) {
                for (let key in this.serverAsset[serverUrl]) {
                    key.indexOf(url) >= 0 && assets.push(this.serverAsset[serverUrl][key]);
                }
            }
            return assets;
        }
    }

    private static updateProgress(completedCount: number, totalCount: number, item: any) {
        let rate = Math.min(completedCount / totalCount, 1);
        EventManager.emit(EventConst.LoadEvent.updateProgress, rate);
    }
}