import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";

//设置网站个性化配置
var websiteConfig = {
    setWebsiteConfig: function (data, onSuccess, onError) {        
        const route = _.find(routeList, route => route.handler === "setWebsiteConfig");
        const arg = {
            url: route.path,
            type: route.method,
            data
        };
        ajax(arg).then(result => {
            const preStorage = JSON.parse(localStorage.getItem("websiteConfig"));
            const curStorage = $.extend({}, preStorage, data);
            localStorage.setItem("websiteConfig", JSON.stringify(curStorage));
            onSuccess(result);
        }, err => {
            onError(err);
        });
    },

    //获取网站个性化配置
    getWebsiteConfig: function () {
        const route = _.find(routeList, route => route.handler === "getWebsiteConfig");
        const arg = {
            url: route.path,
            type: route.method
        };
        ajax(arg).then(result => {
            if (result && result.personnel_setting) {
                localStorage.websiteConfig = JSON.stringify(result.personnel_setting);
            }
        });
    },

    //获取本地存储的自定义表格配置
    getLocalWebsiteConfig: () => {
        return JSON.parse(localStorage.getItem("websiteConfig"));
    }
}
module.exports = websiteConfig;