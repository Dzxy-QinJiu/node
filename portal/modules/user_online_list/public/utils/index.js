//事件类
var EventEmitter = require("events");
//事件常量
var EMITTER_CONSTANTS = {
    //应用列表加载完成
    APP_LIST_LOADED: 'app_list_loaded'
};
//布局的常量定义
var LAYOUT_CONSTANTS = {
    //顶部导航
    TOP_NAV_HEIGHT: 65,
    //表格距离顶部导航的距离
    TABLE_MARGIN_TOP: 24,
    //表头的高度
    THEAD_HEIGHT: 52,
    //表格距离底部的距离
    TABLE_MARGIN_BOTTOM: 24,
    //分页的高度
    PAGINATION_HEIGHT: 60
};
//暴露emitter进行事件通信
exports.emitter = new EventEmitter();
//暴露emitter常量
exports.EMITTER_CONSTANTS = EMITTER_CONSTANTS;
//页面布局的常量
exports.LAYOUT_CONSTANTS = LAYOUT_CONSTANTS;