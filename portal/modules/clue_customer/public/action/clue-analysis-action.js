/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
import {hasPrivilege} from "CMP_DIR/privilege/checker";
var clueAnalysisAjax = require("../ajax/clue-analysis-ajax");
const AUTHS = {
    "GETALL": "CUSTOMER_ALL"
};
function ClueAnalysisActions() {
    this.generateActions(
        'changeSearchTime',
        'setInitState',
        'changeAccess',
        'changeSource'
    );
    //标记线索是否有效
    this.getClueAnalysis = function (data) {
        this.dispatch({error: false, loading: true});
        clueAnalysisAjax.getClueAnalysis(data).then((result)=>{
            this.dispatch({error: false, loading: false, data:result});
        },(errorMsg)=>{
            this.dispatch({error: true, loading: false,errorMsg:errorMsg});
        });
    };
    this.getCustomerById = function (customerId,label) {
        var rangParams = [{//时间范围参数
            from: "",
            to: "",
            type: "time",
            name: "start_time"
        }];
        var queryObj = {"total_size":1,"cursor":true,"id":""};
        var data = {
            data: JSON.stringify({"id":customerId}),
            rangParams: JSON.stringify(rangParams),
            queryObj: JSON.stringify(queryObj)
        };
        if (hasPrivilege(AUTHS.GETALL)) {
            data.hasManageAuth = true;
        }
        this.dispatch({loading:true,error:false});
        clueAnalysisAjax.getCustomerById(data).then((data) => {
            this.dispatch({loading:false,error:false,data:data,label:label});
        }, (errorMsg)=>{
            this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    };
}
module.exports = alt.createActions(ClueAnalysisActions);