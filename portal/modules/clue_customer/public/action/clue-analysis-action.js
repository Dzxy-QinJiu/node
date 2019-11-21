/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var clueAnalysisAjax = require('../ajax/clue-analysis-ajax');
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
const AUTHS = {
    'GETALL': crmPrivilegeConst.CUSTOMER_ALL
};
function ClueAnalysisActions() {
    this.generateActions(
        'changeSearchTime',
        'setInitState',
        'changeAccess',
        'changeSource'
    );
    //获取线索统计列表
    this.getClueStatics = function(pathParams, rangeParams, queryParams) {
        var type = pathParams.field;
        this.dispatch({error: false, loading: true, type: type});
        clueAnalysisAjax.getClueStatics(pathParams, rangeParams, queryParams).then((result) => {
            this.dispatch({error: false, loading: false, data: result,type: type});
        },(errorMsg) => {
            this.dispatch({error: true, loading: false,errorMsg: errorMsg, type: type});
        });
    };
    //获取线索趋势统计列表
    this.getClueTrendStatics = function(queryObj) {
        var type = queryObj.field;
        this.dispatch({error: false, loading: true, type: type});
        clueAnalysisAjax.getClueTrendStatics(queryObj).then((result) => {
            this.dispatch({error: false, loading: false, data: result,type: type});
        },(errorMsg) => {
            this.dispatch({error: true, loading: false,errorMsg: errorMsg, type: type});
        });
    };
    this.getCustomerById = function(customerId,label) {
        var rangeParams = [{//时间范围参数
            from: '',
            to: '',
            type: 'time',
            name: 'start_time'
        }];
        var data = {
            data: JSON.stringify({'id': customerId}),
            rangeParams: JSON.stringify(rangeParams)
        };
        if (hasPrivilege(AUTHS.GETALL)) {
            data.hasManageAuth = true;
        }
        this.dispatch({loading: true,error: false});
        clueAnalysisAjax.getCustomerById(data).then((data) => {
            this.dispatch({loading: false,error: false,data: data,label: label});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(ClueAnalysisActions);