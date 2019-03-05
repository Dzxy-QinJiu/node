import routeList from '../../modules/common/route';
import ajax from '../../modules/common/ajax';
import CONSTS from 'LIB_DIR/consts';
import { storageUtil } from 'ant-utils';

//设置网站个性化配置
var websiteConfig = {
    setWebsiteConfig: function(data, onSuccess, onError) {        
        const route = _.find(routeList, route => route.handler === 'setWebsiteConfig');
        const arg = {
            url: route.path,
            type: route.method,
            data
        };
        ajax(arg).then(result => {
            const preStorage = JSON.parse(storageUtil.local.get(CONSTS.STORE_PERSONNAL_SETTING.WEBSITE_CONFIG));
            const curStorage = $.extend({}, preStorage, data);
            storageUtil.local.set(CONSTS.STORE_PERSONNAL_SETTING.WEBSITE_CONFIG, JSON.stringify(curStorage));
            _.isFunction(onSuccess) && onSuccess(result);
        }, err => {
            _.isFunction(onError) && onError(err);
        });
    },
    //设置某个模块是否被点击过
    setWebsiteConfigModuleRecord: function(data, onSuccess, onError) {
        const route = _.find(routeList, route => route.handler === 'setWebsiteConfigModuleRecord');
        const arg = {
            url: route.path,
            type: route.method,
            data
        };
        ajax(arg).then(result => {
            if (_.isFunction(onSuccess)){
                onSuccess(result);
            }
        }, err => {
            if (_.isFunction(onError)){
                onError(err);
            }
        });
    },
    //获取网站个性化配置
    getWebsiteConfig: function(callback,totalData) {
        const route = _.find(routeList, route => route.handler === 'getWebsiteConfig');
        const arg = {
            url: route.path,
            type: route.method
        };
        ajax(arg).then(result => {
            if (result && result.personnel_setting) {
                storageUtil.local.set('websiteConfig', JSON.stringify(result.personnel_setting));
            }else if (result && !result.personnel_setting){
                storageUtil.local.set('websiteConfig', JSON.stringify({}));
            }
            //是否需要全部的数据
            if (totalData){
                callback(result);
            }else{
                //存储是否点击了某个模块
                if (result && result.module_record){
                    if (_.isFunction(callback)){
                        callback(result.module_record);
                    }
                }else if (result && !result.module_record){
                    if (_.isFunction(callback)){
                        callback([]);
                    }
                }
            }
        });
    },

    //获取本地存储的自定义表格配置
    getLocalWebsiteConfig: () => {
        return JSON.parse(storageUtil.local.get('websiteConfig'));
    }
};
module.exports = websiteConfig;