var insertStyle = require('../../insert-style');
var UserData = require('../../../public/sources/user-data');
var notificationEmitter = require('../../../public/sources/utils/emitters').notificationEmitter;
import {getClueUnhandledPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
var UnreadMixin = {
    dynamicStyle: null,
    clueUnhandledStyle: null,
    //菜单切换时，重新获取未处理申请数
    componentWillReceiveProps: function(nextProps) {
        this.showUnhandledApplyCount();
        if (getClueUnhandledPrivilege()){
            this.showUnhandledClueCount();
        }
    },
    /*
     *  待审批数的展示
     * @param type  :approve
     */
    showUnhandledApplyCount: function() {
        //从全局数据中获取
        if (Oplate && Oplate.unread) {
            var count = Oplate.unread.approve || 0;
            if (this.dynamicStyle) {
                this.dynamicStyle.destroy();
                this.dynamicStyle = null;
            }
            count = parseInt(count);
            if (window.isNaN(count)) {
                count = 0;
            }
            var styleText = '';
            //设置数字
            if (count > 0) {
                var len = (count + '').length;
                if (len >= 3) {
                    styleText = '.sidebar-applyentry:before{content:\'99+\';display:block;padding:0 2px 0 2px;}';
                } else {
                    styleText = `.sidebar-applyentry:before{content:'${count}';display:block}`;
                }

            } else {
                styleText = '.sidebar-applyentry:before{content:\'\';display:none}';
            }
            //展示数字
            this.dynamicStyle = insertStyle(styleText);
        }
    },
    /*
     *  待处理线索数的展示
     * @param type  :unhandleClue
     */
    showUnhandledClueCount: function() {
        //从全局数据中获取
        if (Oplate && Oplate.unread) {
            var count = Oplate.unread.unhandleClue || 0;
            if (this.clueUnhandledStyle) {
                this.clueUnhandledStyle.destroy();
                this.clueUnhandledStyle = null;
            }
            count = parseInt(count);
            if (window.isNaN(count)) {
                count = 0;
            }
            var styleText = '';
            //设置数字
            if (count > 0) {               
                var len = (count + '').length;
                if (len >= 3) {
                    styleText = '.clue-icon-container:before{content:\'99+\';display:block;padding:0 2px 0 2px;}';
                } else {
                    styleText = `.clue-icon-container:before{content:'${count}';display:block}`;
                }

            } else {
                styleText = '.clue-icon-container:before{content:\'\';display:none}';
            }
            //展示数字
            this.clueUnhandledStyle = insertStyle(styleText);
        }
    },
    showUnhandledApplyApproveCount: function() {
        //从全局数据中获取
        if (Oplate && Oplate.unread) {
            var customerVisitCount = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT] || 0;
            var personalLeaveCount = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE] || 0;
            var businessOpportunitiesCount = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES] || 0;
            var count = customerVisitCount + personalLeaveCount + businessOpportunitiesCount;

            if (this.applyApproveUnhandledStyle) {
                this.applyApproveUnhandledStyle.destroy();
                this.applyApproveUnhandledStyle = null;
            }
            count = parseInt(count);
            if (window.isNaN(count)) {
                count = 0;
            }
            var styleText = '';
            //设置数字
            if (count > 0) {
                styleText = '.apply-approve-icon-container:before{content:\'\';display:block;padding:0 2px 0 2px;}';
            } else {
                styleText = '.apply-approve-icon-container:before{content:\'\';display:none}';
            }
            //展示数字
            this.applyApproveUnhandledStyle = insertStyle(styleText);
        }
    },
    registerEventEmitter: function() {
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledApplyCount);
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledClueCount);
        notificationEmitter.on(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledApplyApproveCount);
    },
    unregisterEventEmitter: function() {
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT, this.showUnhandledApplyCount);
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT, this.showUnhandledClueCount);
        notificationEmitter.removeListener(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT, this.showUnhandledApplyApproveCount);
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
        this.showUnhandledApplyCount();
        this.showUnhandledClueCount();
        this.showUnhandledApplyApproveCount();
        this.registerEventEmitter();
    },
    componentWillUnmount: function() {
        if (!this.shouldGetUnreadData()) {
            return;
        }
        if (this.dynamicStyle) {
            this.dynamicStyle.destroy();
            this.dynamicStyle = null;
        }
        this.unregisterEventEmitter();
    }
};

module.exports = UnreadMixin;