const config = require("../../../conf/config.js");
const storageKey = config.storageKey || "storage-key";

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

const getUserId = () => {
    const userData = require("../../public/sources/user-data").getUserData(); 
    return userData && userData.user_id;
}

const getUtils = storage => {
    let userId = "";
    //没有userId时，key为config中的storageKey
    let userKey = storageKey;    
    const setUserKey = () => {
        userKey = userId? (userId + "-" + storageKey): storageKey;       
    };
    const handleUserId = () => {
        if (!userId) {
            userId = getUserId();
            setUserKey();
        }
    };
    return {
        get: (key, pageId) => {
            handleUserId();
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const obj = JSON.parse(storage.getItem(userKey));
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
            handleUserId();
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const preStorage = JSON.parse(storage.getItem(userKey));
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
            return storage.setItem(userKey, JSON.stringify(curStorage));
        },
        removeItem: (key, pageId) => {
            handleUserId();
            const hasPageId = pageId && typeof pageId == "string";
            if (typeof key != 'string') {
                return null
            }
            const curStorage = JSON.parse(storage.getItem(userKey));
            if (hasPageId) {
                delete curStorage[pageId][key];
            } else {
                delete curStorage[key];
            }
            return storage.setItem(userKey, JSON.stringify(curStorage));
        },
        clear: (pageId) => {
            handleUserId();
            const hasPageId = pageId && typeof pageId == "string";
            if (hasPageId) {
                const curStorage = {
                    [pageId]: {}
                }
                return storage.setItem(userKey, JSON.stringify(curStorage));
            } else {
                return storage.removeItem(userKey);
            }
        }
    }
};

const local = getUtils(localStorage);

const session = getUtils(sessionStorage);

const storageUtil = {
    local,
    session
};

module.exports = storageUtil;