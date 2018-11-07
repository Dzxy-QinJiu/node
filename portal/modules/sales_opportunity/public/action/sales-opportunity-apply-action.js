/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var SalesOpportunityApplyAjax = require('../ajax/sales-opportunity-apply-ajax');
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
function SalesOpportunityApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType',
        'changeApplyAgreeStatus',//审批完后改变出差申请的状态
        'afterAddApplySuccess'
    );
    this.getAllSalesOpportunityApplyList = function(queryObj) {
        //需要先获取待审批列表，成功后获取全部列表
        this.dispatch({loading: true, error: false});
        SalesOpportunityApplyAjax.getWorklistSalesOpportunityApplyList({type: APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES}).then((workList) => {
            this.dispatch({workList: workList});
            //如果是待我审批的列表，不需要在发获取全部列表的请求了
            if (queryObj.status && queryObj.status === 'ongoing'){
                //需要对全部列表都加一个可以审批的属性
                _.forEach(workList.list,(workItem) => {
                    workItem.showApproveBtn = true;
                });
                this.dispatch({error: false, loading: false, data: workList});
                return;
            }
            SalesOpportunityApplyAjax.getAllSalesOpportunityApplyList(queryObj).then((data) => {
                //需要对全部列表进行一下处理，知道哪些是可以审批的
                var workListArr = workList.list;
                _.forEach(workListArr,(item) => {
                    var targetObj = _.find(data.list,(dataItem) => {
                        return item.id === dataItem.id;
                    });
                    if (targetObj){
                        targetObj.showApproveBtn = true;
                    }
                });
                this.dispatch({error: false, loading: false, data: data});},(errorMsg) => {
                this.dispatch({
                    error: true,
                    loading: false,
                    errMsg: errorMsg || Intl.get('failed.get.all.sales.oppotunity','获取全部销售机会申请失败')
                });});

        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                worklistErrMsg: errorMsg || Intl.get('failed.get.worklist.leave.apply', '获取由我审批的销售机会申请失败')
            });
        });
    };
}
module.exports = alt.createActions(SalesOpportunityApplyActions);