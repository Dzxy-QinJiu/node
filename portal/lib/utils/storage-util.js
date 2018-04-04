var userData = require("../../public/sources/user-data").getUserData();
const config = require("../../../conf/config.js");
const storageKey = config.storageKey || "storage-key"
//没有userId时，key为config中的storageKey
var userId = (userData && userData.user_id)?(userData.user_id + "-" + storageKey): storageKey;
/**
 * localstorage工具 * 
 * 对localStorage存取方法的封装
 * 使用方法: *      
 *   pageId {string} 页面标识(公共数据可不传)
 *   key {string} 变量名(变量标识，必传) 
 *   
 *   var storageUtil = require("LIB_DIR/utils/storage-util.js"); 
 *   存储 storageUtil.set(key, object, pageId);
 *   读取 storageUtil.get(key, pageId);
 *   删除 storageUtil.removeItem(key, pageId);   
 *  
 * 存储的数据放到key是[userId]的json对象中， 
 * get返回JSON.parse结果
 * set自动转化为字符串
 */

const Storage = window.localStorage;

const storageUtil = {
    get: (key, pageId) => {
        const hasPageId = pageId && typeof pageId == "string";
        if (typeof key != 'string') {
            return undefined
        }
        const obj = JSON.parse(Storage.getItem(userId));
        if (obj) {
            if (hasPageId) {
                if (obj[pageId]) {
                    return obj[pageId][key];
                } else {
                    return null;
                }
            } else {
                return obj[key];
            }
        } else {
            return null
        }
    },
    set: (key, data, pageId) => {
        const hasPageId = pageId && typeof pageId == "string";
        if (typeof key != 'string') {
            return undefined
        }
        const preStorage = JSON.parse(Storage.getItem(userId));
        let newProps = null;
        if (hasPageId) {
            newProps = {
                [pageId]: {
                    [key]: data
                }
            }
        } else {
            newProps = {
                [key]: data
            }
        }
        const curStorage = $.extend(true, {}, preStorage, newProps);
        return Storage.setItem(userId, JSON.stringify(curStorage));
    },
    removeItem: (key, pageId) => {
        const hasPageId = pageId && typeof pageId == "string";
        if (typeof key != 'string') {
            return undefined
        }
        const curStorage = JSON.parse(Storage.getItem(userId));
        if (hasPageId) {
            delete curStorage[pageId][key];
        } else {
            delete curStorage[key];
        }
        return Storage.setItem(userId, JSON.stringify(curStorage));
    },
    clear: (pageId) => {
        const hasPageId = pageId && typeof pageId == "string";
        if (hasPageId) {
            const curStorage = {
                [pageId]: {}
            }
            return Storage.setItem(userId, JSON.stringify(curStorage));
        } else {
            return Storage.removeItem(userId);
        }
    }
};

module.exports = storageUtil;
