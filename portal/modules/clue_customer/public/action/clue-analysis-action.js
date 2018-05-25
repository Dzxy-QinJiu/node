/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
var clueAnalysisAjax = require("../ajax/clue-analysis-ajax");
function ClueAnalysisActions() {
    this.generateActions(
        'changeSearchTime'
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
}
module.exports = alt.createActions(ClueAnalysisActions);