var insertStyle = require('../../insert-style');
var UserData = require('../../../public/sources/user-data');
var notificationEmitter = require('../../../public/sources/utils/emitters').notificationEmitter;
import {getClueUnhandledPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
const UNREADCOUNT = [{
    name: 'approve',//待审批数的展示
    cls: 'sidebar-applyentry',
    style: 'dynamicStyle',
    showNum: true
}, {
    name: 'unhandleClue',//待处理线索数的展示
    cls: 'clue_customer_icon_container',
    style: 'clueUnhandledStyle',
    showNum: true
}, {
    name: [//待处理申请审批数的展示
        APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT, APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE, APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES
    ],
    cls: 'application_icon_container',
    style: 'applyApproveUnhandledStyle',
    showNum: false
}];

var UnreadMixin = {
    dynamicStyle: null,
    clueUnhandledStyle: null,
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
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[0]));
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[2]));
    },
    unregisterEventEmitter: function() {
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[0]));
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[1]));
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledCount.bind(this,UNREADCOUNT[2]));
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
        this.unregisterEventEmitter();
    }
};

module.exports = UnreadMixin;