/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAjax = require('MOD_DIR/crm/public/ajax/filter-ajax');
function FilterAction() {
    this.generateActions(
        'setInitialData',
        'setTimeType',
        'setTimeRange',
        'setFilterType',
        'setFilterClueSoure',
        'setFilterClueAccess',
        'setFilterClueClassify',
        'setFilterClueAvailbility',
        'setFilterClueProvince',
        'setExistedFiled',
        'setUnexistedFiled',
        'setFilterClueUsername'
    );
    //获取负责人名称列表
    this.getOwnerNameList = function() {
        FilterAjax.getOwnerNameList().then(list => {
            this.dispatch(list);
        }, function(errorMsg) {
            console.log(errorMsg);
        });
    };
}
module.exports = alt.createActions(FilterAction);
