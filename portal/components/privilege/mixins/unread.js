var insertStyle = require('../../insert-style');
var UserData = require('../../../public/sources/user-data');
var notificationEmitter = require('../../../public/sources/utils/emitters').notificationEmitter;
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';

/**
 * 待处理的数据列表
 * name:待处理数在Oplate.unread对象中的key或key数组
 * cls: 左侧导航中，显示线索、申请审批图标的类
 * style: 显示待处理数的样式
 * showNum: 是否展示待处理数字
 */
const UNREADCOUNT = [{//待分配或待跟进线索数的数据
    name: 'unhandleClue',
    cls: 'clue_customer_icon_container',
    style: 'clueUnhandledStyle',
    showNum: true
}, {//待处理申请审批数的数据
    name: [
        APPLY_APPROVE_TYPES.UNHANDLE_USER_APPLY,//用户申请待审批数
        APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT,//出差申请待我审批数
        APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE,//请假申请的待我审批数
        APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES,//销售机会的待我审批数
        APPLY_APPROVE_TYPES.UNHANDLEREPORTSEND,//舆情报送的待我审批数
        APPLY_APPROVE_TYPES.UNHANDLEDOCUMENTWRITE//文件撰写的待我审批数
    ],
    cls: 'application_icon_container',
    style: 'applyApproveUnhandledStyle',
    showNum: false
}];

var UnreadMixin = {
    //未处理数的提示样式初始化
    clueUnhandledStyle: null,
    applyApproveUnhandledStyle: null,
    //菜单切换时，重新获取未处理申请数
    componentWillReceiveProps: function(nextProps) {
        _.forEach(UNREADCOUNT,(item) => {
            this.showUnhandledCount(item);
        });
    },

    showUnhandledCount: function(item) {
        //从全局数据中获取
        if (Oplate && Oplate.unread){
            var count = 0;
            this.setState({
                messages: Oplate.unread
            });
            if (_.isArray(item.name)){
                _.forEach(item.name,(itemType) => {
                    count += Oplate.unread[itemType] || 0;
                });
            }else{
                count = Oplate.unread[item.name] || 0;
            }
            if (this[item.style]) {
                this[item.style].destroy();
                this[item.style] = null;
            }
            count = parseInt(count);
            if (window.isNaN(count)) {
                count = 0;
            }
            var styleText = '';

            if (count > 0) {
                //是显示数字还是显示红点
                if (item.showNum){
                    var len = (count + '').length;
                    if (len >= 3) {
                        styleText = `.${item.cls}:before{content:\'99+\';display:block;padding:0 2px 0 2px;}`;
                    } else {
                        styleText = `.${item.cls}:before{content:'${count}';display:block}`;
                    }
                }else{
                    styleText = `.${item.cls}:before{content:\'\';display:block;padding:0 2px 0 2px;}`;
                }
            } else {
                styleText = `.${item.cls}:before{content:\'\';display:none}`;
            }
            //展示数字
            this[item.style] = insertStyle(styleText);
        }
    },
    registerEventEmitter: function() {
        //线索待分配（待跟进）数的监听
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[0]));
        //用户申请的待审批数的监听
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
        //出差申请、请假申请、销售机会申请待我审批数的监听
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
    },
    unregisterEventEmitter: function() {
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[0]));
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
    },
    //能够获取未读数
    shouldGetUnreadData: function() {
        var userData = UserData.getUserData();
        var privileges = userData.privileges || [];
        if (privileges.indexOf('APP_USER_APPLY_LIST') >= 0) {
            return true;
        }
        return false;
    },

    componentDidMount: function() {
        if (!this.shouldGetUnreadData()) {
            return;
        }
        _.forEach(UNREADCOUNT,(item) => {
            this.showUnhandledCount(item);
        });
        this.registerEventEmitter();
    },
    componentWillUnmount: function() {
        if (!this.shouldGetUnreadData()) {
            return;
        }
        _.forEach(UNREADCOUNT,(item) => {
            if (this[item.style]) {
                this[item.style].destroy();
                this[item.style] = null;
            }
        });
        this.unregisterEventEmitter();
    }
};

module.exports = UnreadMixin;