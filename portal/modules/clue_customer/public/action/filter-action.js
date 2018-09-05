/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
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
        'setUnexistedFiled'
    );
}
module.exports = alt.createActions(FilterAction);
