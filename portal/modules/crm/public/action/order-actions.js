import ajax from '../../common/ajax';
import crmAjax from '../ajax/index';
const routes = require('../../common/route');
var appAjaxTrans = require('../../../common/public/ajax/app');
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
function OrderActions() {
    this.generateActions(
        'getMergeOrderList',
        'showForm',
        'hideForm',
        'onChangeUserCheckBox',
        'onChangeAppCheckBox',
        'onChangeApplyType',
        'setCrmUsersLoading',
        'setPageNum',
        'afterDelOrder',
        'afterEditOrder',
        'afterAddOrder',
        'setOrderListLoading'
    );

    routes.forEach(route => {
        this[route.handler] = function(reqData, params, cb) {
            const arg = {
                url: route.path,
                type: route.method,
                params: params,
                data: reqData,
            };

            ajax(arg).then(result => {
                this.dispatch(result);
                if (cb) cb(result);
            }, (errorMsg) => {
                this.dispatch(errorMsg);
                if (cb) cb(errorMsg);
            });
        };
    });

    this.getAppList = function() {
        commonDataUtil.getAllProductList(appList => {
            this.dispatch(appList);
        });
    };
    //获取客户下的用户列表
    this.getCrmUserList = function(reqData) {
        crmAjax.getCrmUserList(reqData).then((userData) => {
            this.dispatch({errorMsg: '', result: userData});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(OrderActions);
