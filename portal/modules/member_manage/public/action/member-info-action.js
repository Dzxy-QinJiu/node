/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/11.
 */
import MemberManageAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
function UserInfoActions() {
    this.generateActions(
        'setInitialData',
        'changeLogNum',
        'setLogLoading',
        'showModalDialog',
        'hideModalDialog',
        'setUserLoading',
    );
    //获取日志列表
    this.getLogList = function(condition) {
        MemberManageAjax.getLogList(condition).then((logListObj) => {
            if (_.isObject(logListObj)) {
                this.dispatch({logListObj: logListObj,condition: condition});
                scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            } else {
                this.dispatch( Intl.get('member.get.log.failed', '获取成员日志失败!'));
            }
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('member.get.log.failed', '获取成员日志失败!'));
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    };
    //获取销售目标和提成比例
    this.getSalesGoals = function(userId) {
        this.dispatch({loading: true, error: false});
        MemberManageAjax.getSalesGoals(userId).then((data) => {
            this.dispatch({loading: false,error: false, data: data});
        },(errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //设置销售目标或者提成比例
    this.setSalesGoals = function(user) {
        this.dispatch({loading: true, error: false});
        MemberManageAjax.setSalesGoals(user).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(UserInfoActions);