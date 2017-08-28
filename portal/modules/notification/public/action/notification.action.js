/**
 * 系统通知的action
 */
//联系人的ajax
var NotificationAjax = require("../ajax/notification-ajax");
var notificationEmitter = require("../../../../public/sources/utils/emitters").notificationEmitter;
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
//更新全局未读数
function updateUnread(type, unread) {
    if (Oplate && Oplate.unread) {
        Oplate.unread[type] = unread;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function () {
            //触发展示的组件未读数的刷新
            notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
        }, timeout);
    }
}

function NotificationAction() {

    this.generateActions(
        //获取申请消息列表
        'getApplyForMessageList',
        // 申请消息类型的选择
        'handleSelectChange',
        // 申请消息搜索
        'searchEvent',
        //获取客户消息列表
        'getCustomerMessageList',
        //重置最后一个消息的id
        'resetLastNotificationId'
    );

    //获取申请消息列表
    this.getApplyForMessageList = function (queryObj, callback) {
        var _this = this;
        _this.dispatch({loading: true, error: false, currentPage: queryObj.current_page});
        NotificationAjax.getApplyForMessageList(queryObj).then(function (data) {
            /*
             {
             "date": 1479190960971,
             "message_id": "e07bb0b5-cae6-47eb-9ddd-d2a158b4e184",
             "message_type": "apply",
             "message": {
             "sales_team_name": "团队1",
             "sales_name": "销售1",
             "user_ids": "[\"36v91l0mrP36f2rpbha351ES78Du4ZAbqZ0NW2eiPYm\",\"36v91l0mrP36f2rj7j404xbXf01o5gdcsu0eUYka4rh\",\"36v91l0mrP36f2r9m4q2mL9mt0jJ4OMa3E0Jod2f0PI\"]",
             "user_names": "[\"union\",\"nick\",\"pick\"]",
             "remark": "",
             "tag": "试用用户",
             "customer_name": "xiaoshou1_test1",
             "customer_id": "36v91l0mrP_85224106-de3e-4df8-8d61-2f4573a9bf30",
             "type": "apply_app_trial",
             "products": "[{\"begin_date\":1479139200000,\"client_id\":\"36v91l0mrP36kd6cgsp1hMZ5Gav24JybD00xZUZtOtH\",\"end_date\":1480435200000,\"is_two_factor\":0,\"login_count\":0,\"over_draft\":1,\"permissions\":[],\"roles\":[],\"status\":0},{\"begin_date\":1479139200000,\"client_id\":\"36v91l0mrP36l17p0291eRXGK7Bc4mqcF706Y1Iv5ns\",\"end_date\":1480435200000,\"is_two_factor\":0,\"login_count\":0,\"over_draft\":0,\"permissions\":[],\"roles\":[],\"status\":0},{\"begin_date\":1479139200000,\"client_id\":\"36v91l0mrP36na0fp101cyWqHdKG4wQapK1czjHf6xk\",\"end_date\":1510675200000,\"is_two_factor\":0,\"login_count\":0,\"over_draft\":0,\"permissions\":[],\"roles\":[],\"status\":0}]"
             },
             "approval_person": "周连毅",
             "produce_date": 1479190960971,
             "user_id": "3722pgujaa36v8uo6ci1iXeiv32c51k9bn0EECHRcpJ",
             "producer_name": "销售1",
             "comment": "aaaaaaaa22222",
             "id": "f92ea2cf-ec8d-400d-9eb7-ecf998babfcc",
             "approval_state": "pass",
             "approval_comment": "aaaaaaaa22222",
             "message_topic": "用户申请",
             "relate_type": "reply",
             "status": "true"
             }
             */
            if (data) {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                if (callback) {
                    callback();
                }
                _this.dispatch({loading: false, error: false, data: data});
                updateUnread("apply", data.unread || 0);
            } else {
                _this.dispatch({loading: false, error: false});
            }
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //清除未读数
    this.clearUnreadNum = function (type, callback) {
        let clearTip = Intl.get("notification.clear.unread.failed", "全部标为已读失败！"), error = true;
        NotificationAjax.clearUnreadNum(type).then(data=> {
            if (data) {
                //清除未读数后，更新申请消息/客户提醒的未读数
                updateUnread(type, 0);
                error = false;
                clearTip = Intl.get("notification.clear.unread.success", "全部标为已读成功！");
            }
            if (callback) {
                callback({error: error, clearTip: clearTip});
            }
            this.dispatch(data);
        }, errorMsg=> {
            this.dispatch();
            //重新获取未读数
            if (callback) {
                callback({error: error, clearTip: errorMsg || clearTip});
            }
        });
    };
    //获取客户提醒列表
    this.getCustomerMessageList = function (queryObj) {
        var _this = this;
        _this.dispatch({loading: true, error: false, currentPage: queryObj.current_page});
        NotificationAjax.getCustomerMessageList(queryObj).then(function (data) {
            /**
             *
             *
             *  {
                    "message": "xx的账号xx在xx将到期，请及时联系客户",
                    "date": 1466135390196,
                 }
             {
                 "message": "客户xxx在xxx添加提醒，xxxxxxx",
                 "date": 1466135390196,
             }
             */
            if (data) {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                _this.dispatch({loading: false, error: false, data: data});
                updateUnread("customer", data.unread || 0);

            } else {
                _this.dispatch({loading: false, error: false, data: {total: 0, list: []}});
            }
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

}

module.exports = alt.createActions(NotificationAction);