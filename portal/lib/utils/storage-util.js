var userData = require("../../public/sources/user-data").getUserData();
const config = require("../../../conf/config.js");
const storageKey = config.storageKey || "storage-key"
//没有userId时，key为config中的storageKey
var userId = (userData && userData.user_id)?(userData.user_id + "-" + storageKey): storageKey;
/**
 * localstorage工具 * 
 * 对localStorage存取方法的封装
 * 使用方法: *      
 *   pageId {string} 页面标识(仅在需要区分页面时传入，比如table自定义列配置)
 *   key {string} 变量名(变量标识，必传) 
 *   
 *   var storageUtil = require("LIB_DIR/utils/storage-util.js"); 
 *   存储 storageUtil.local.set(key, object, pageId);
 *   读取 storageUtil.local.get(key, pageId);
 *   删除 storageUtil.local.removeItem(key, pageId);   
 *  
 * 存储的数据放到key是[userId]的json对象中， 
 * get返回JSON.parse结果
 * set自动转化为字符串
 */

const localStorage = window.localStorage;

const getUtils = storage => {
    return {
        get: (key, pageId) => {
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const obj = JSON.parse(storage.getItem(userId));
            if (obj) {
                if (hasPageId) {
                    if (obj[pageId]) {
                        return obj[pageId][key] || null;
                    } else {
                        return null;
                    }
                } else {
                    return obj[key] || null;
                }
            } else {
                return null
            }
        },
        set: (key, data, pageId) => {
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const preStorage = JSON.parse(storage.getItem(userId));
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
            return storage.setItem(userId, JSON.stringify(curStorage));
        },
        removeItem: (key, pageId) => {
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const curStorage = JSON.parse(storage.getItem(userId));
            if (hasPageId) {
                delete curStorage[pageId][key];
            } else {
                delete curStorage[key];
            }
            return storage.setItem(userId, JSON.stringify(curStorage));
        },
        clear: (pageId) => {
            const hasPageId = pageId && typeof pageId == "string";
            if (hasPageId) {
                const curStorage = {
                    [pageId]: {}
                }
                return storage.setItem(userId, JSON.stringify(curStorage));
            } else {
                return storage.removeItem(userId);
            }
        }
    }
};

let storageUtil = {
    local:  getUtils(localStorage),
    session: getUtils(sessionStorage)
};

module.exports = storageUtil;