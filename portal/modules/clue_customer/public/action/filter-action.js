/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
import {getTeamTreeMemberLists} from 'PUB_DIR/sources/utils/common-data-util';
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
        'setFilterSourceClassify',
        'setFilterClueProvince',
        'setFilterClueAllotNoTrace',
        'setExistedFiled',
        'setUnexistedFiled',
        'setFilterClueUsername',
        'setSimilarFiled',
        //获取负责人列表
        this.getTeamMemberList = function() {
            getTeamTreeMemberLists((result) => {
                this.dispatch(result);
            });
        }
    );
}
module.exports = alt.createActions(FilterAction);
