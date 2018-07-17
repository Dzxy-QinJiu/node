import ajax from 'MOD_DIR/common/ajax';

const routeList = require('MOD_DIR/common/route');
/**
 * 
 * @param ajax {promise} :异步请求的promise(jqXhr)
 * 默认dispatch请求的errorMsg, loading, data(请求数据), paramObj(请求参数)
 * 可以返回promise，方便前端获取请求状态
 */
export const asyncDispatcher = function(ajax, usePromise) {
    return function(paramObj) {
        var _this = this;
        _this.dispatch({ errorMsg: '', loading: true });
        if (usePromise) {
            return new Promise((resolve, reject) => {
                ajax(paramObj).then(function(data) {
                    _this.dispatch({ loading: false, data, paramObj, errorMsg: '' });
                    resolve({ data });
                }, function(error) {
                    const errorObj = JSON.parse(error);
                    _this.dispatch({ loading: false, data: null, errorMsg: errorObj && errorObj.message || errorObj, paramObj });
                    reject(error);
                });
            });
        }
        ajax(paramObj).then(function(data) {
            _this.dispatch({ loading: false, data, paramObj, errorMsg: '' });
        }, function(error) {
            const errorObj = JSON.parse(error);
            _this.dispatch({ loading: false, data: null, errorMsg: errorObj && errorObj.message || errorObj, paramObj });
        });
        
    };
};

/** 
* @param resultString[string]: 用于存放loading和errorMsg的对象名(函数外取不到state执行环境，所以传字符串)
* @param fn: 请求成功触发的回调，会传入响应结果result，包含{ errorMsg, loading, data, paramObj }
*/
export const resultHandler = function(resultString, fn) {
    return function(result) {
        if (!this[resultString]) {
            throw new Error(`property "${resultString}" doesn't exsists`);
        }
        const { loading, errorMsg } = result;
        if (loading) {
            this[resultString].loading = true;
            this[resultString].errorMsg = '';
        }
        else if (errorMsg) {
            this[resultString].loading = false;
            this[resultString].errorMsg = errorMsg;
            this[resultString].data = [];
        } else {
            this[resultString].loading = false;
            this[resultString].errorMsg = '';
            if (fn) {
                fn.call(this, result);
            }
        }
    };
};

export const ajaxPro = (handler, paramsObj) => {
    const route = routeList.find(x => x.handler === handler);
    if (!route) {
        throw new Error('cannot find route by handler\'' + handler + '\'');
    } else {
        const config = {
            url: route.path,
            type: route.method
        };
        if (paramsObj) {
            if (paramsObj.params) {
                config.params = paramsObj.params;
            }
            if (paramsObj.data) {
                config.data = paramsObj.data;
            }
            if (paramsObj.query) {
                config.query = paramsObj.query;
            }
        }

        return ajax($.extend({}, config, { usePromise: true }));
    }
};
