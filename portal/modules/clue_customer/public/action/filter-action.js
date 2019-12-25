/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
import {getTeamTreeMemberLists} from 'PUB_DIR/sources/utils/common-data-util';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
function FilterAction() {
    this.generateActions(
        'setInitialData',
        'setTimeType',
        'setTimeRange',
        'setFilterType',
        'setFilterClueSoure',
        'setFilterClueAccess',
        'setFilterClueClassify',
        'setFilterTeamList',
        'setFilterClueAvailbility',
        'setFilterSourceClassify',
        'setFilterClueProvince',
        'setFilterClueAllotNoTrace',
        'setExistedFiled',
        'setUnexistedFiled',
        'setFilterClueUsername',
        'setSimilarFiled',
        'setNotConnectedClues',
        'setLeadFromLeadPool'
    );
    //获取负责人列表
    this.getTeamMemberList = function() {
        getTeamTreeMemberLists((result) => {
            this.dispatch(result);
        });
    };

    //获取销售团队列表
    this.getTeamList = function(cb) {
        getMyTeamTreeAndFlattenList(data => {
            let list = data.teamList || [];
            list.unshift({group_id: '', group_name: Intl.get('common.all', '全部')});
            this.dispatch(list);
            if (_.isFunction(cb)) cb(list);
        });
    };
}
module.exports = alt.createActions(FilterAction);
