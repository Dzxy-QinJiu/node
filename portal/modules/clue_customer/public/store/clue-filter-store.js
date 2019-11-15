/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAction = require('../action/filter-action');
const datePickerUtils = require('CMP_DIR/datepicker/utils');
import {SELECT_TYPE, CLUE_DIFF_TYPE, AVALIBILITYSTATUS, clueStartTime, NEED_MY_HANDLE} from '../utils/clue-customer-utils';
import {isSalesRole, getClueUnhandledPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
function ClueFilterStore() {
    this.setInitialData();
    //绑定action方法
    this.bindActions(FilterAction);
}

ClueFilterStore.prototype.setInitialFilterClueStatus = function() {
    let filterClueStatus = _.cloneDeep(CLUE_DIFF_TYPE);
    //如果不是销售角色，就展示待分配
    if(!isSalesRole()){
        filterClueStatus.push({
            name: Intl.get('clue.customer.will.distribution', '待分配'),
            value: SELECT_TYPE.WILL_DISTRIBUTE,
            selected: true
        });
    }else{
        //如果是销售角色，默认展示待跟进
        _.forEach(filterClueStatus, item => {
            if(_.isEqual(item.value, SELECT_TYPE.WILL_TRACE)){
                item.selected = true;
            }
        });
    }
    return filterClueStatus;
};

ClueFilterStore.prototype.setInitialData = function() {
    this.filterClueStatus = this.setInitialFilterClueStatus();
    //默认展示全部时间
    this.timeType = 'all';
    this.rangeParams = [{//时间范围参数
        from: clueStartTime,
        to: moment().endOf('day').valueOf(),
        type: 'time',
        name: 'source_time'
    }];
    //筛选的线索来源
    this.filterClueSource = [];
    //筛选的线索接入渠道
    this.filterClueAccess = [];
    //筛选的线索分类
    this.filterClueClassify = [];
    //筛选线索是否有效
    this.filterClueAvailability = AVALIBILITYSTATUS.AVALIBILITY;
    //筛选线索的地域
    this.filterClueProvince = [];
    //筛选集客方式
    this.filterSourceClassify = [];
    //筛选线索的销售团队
    this.filterTeamList = [];
    //筛选存在的字段
    this.exist_fields = [];
    //筛选不存在的字段
    this.unexist_fields = [];
    //按销售进行筛选
    this.filterClueUsers = [];
    //按负责人进行筛选
    this.teamMemberList = [];
    //筛选相似线索
    this.filterLabels = '';
    //如果是销售领导或者销售角色或者运营 默认选中 待我处理 进行筛选
    this.filterAllotNoTraced = getClueUnhandledPrivilege() ? '0' : '';
    //未打通电话的线索
    this.notConnectedClues = '';
    //销售团队
    this.teamList = [];
};
//获取未打通电话的线索
ClueFilterStore.prototype.setNotConnectedClues = function(flag) {
    if (flag){
        this.notConnectedClues = true;
    }else{
        this.notConnectedClues = '';
    }
};

//获取线索来源
ClueFilterStore.prototype.setCondition = function(list) {
    this.provinceList = list;
};
//获取销售团队列表
ClueFilterStore.prototype.getTeamList = function(list) {
    this.teamList = list;
};

//设置开始和结束时间
ClueFilterStore.prototype.setTimeRange = function(timeRange) {
    this.rangeParams[0].from = timeRange.start_time;
    this.rangeParams[0].to = timeRange.end_time;
    this.timeType = timeRange.range;
};
//设置时间的类型
ClueFilterStore.prototype.setTimeType = function(timeType) {
    this.timeType = timeType;
    if (timeType === 'all'){
        this.setTimeRange({start_time: clueStartTime, end_time: moment().endOf('day').valueOf()});
    }

};
ClueFilterStore.prototype.getTeamMemberList = function(list) {
    this.teamMemberList = _.get(list, '[0]') ? list : [];
};
//设置筛选线索的类型
ClueFilterStore.prototype.setFilterType = function(updateType) {
    this.filterClueAvailability = AVALIBILITYSTATUS.AVALIBILITY;
    _.forEach(this.filterClueStatus, (item) => {
        item.selected = false;
        if (updateType === item.value) {
            item.selected = true;
        }
    });
};
//设置筛选线索的来源
ClueFilterStore.prototype.setFilterClueSoure = function(updateSource) {
    var selectedSource = [];
    _.forEach(updateSource, (item) => {
        selectedSource.push(item.value);
    });
    this.filterClueSource = selectedSource;
};
ClueFilterStore.prototype.setFilterClueAccess = function(updateAccess) {
    var selectedAccess = [];
    _.forEach(updateAccess, (item) => {
        selectedAccess.push(item.value);
    });
    this.filterClueAccess = selectedAccess;
};
ClueFilterStore.prototype.setFilterClueClassify = function(updateClassify) {
    var selectedClassify = [];
    _.forEach(updateClassify, (item) => {
        selectedClassify.push(item.value);
    });
    this.filterClueClassify = selectedClassify;
};
//设置筛选集客方式
ClueFilterStore.prototype.setFilterSourceClassify = function(updateSourceClassify) {
    let selectedSourceClassify = [];
    _.forEach(updateSourceClassify, (item) => {
        if (item.selected) {
            selectedSourceClassify.push(item.value);
        }
    });
    this.filterSourceClassify = selectedSourceClassify;
};
//设置销售团队列表
ClueFilterStore.prototype.setFilterTeamList = function(updateTeamList) {
    let selectedTeam = [];
    _.forEach(updateTeamList, (item) => {
        if (item.selected){
            selectedTeam.push(item.value);
        }
    });
    this.filterTeamList = selectedTeam;
};
ClueFilterStore.prototype.setFilterClueUsername = function(updateUsers) {
    var filterClueUsers = [];
    _.forEach(updateUsers, (item) => {
        if (item.selected){
            filterClueUsers.push(item.value);
        }
    });
    this.filterClueUsers = filterClueUsers;
};
ClueFilterStore.prototype.setFilterClueAvailbility = function() {
    //点击线索无效，把线索状态选为全部
    this.filterClueAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
    _.forEach(this.filterClueStatus, (item) => {
        item.selected = false;
        if (item.value === SELECT_TYPE.ALL){
            item.selected = true;
        }
    });

};
ClueFilterStore.prototype.setFilterClueAllotNoTrace = function(updateTrace) {
    this.filterAllotNoTraced = updateTrace || '';
    // 在当前筛选类型是“无效”的情况下点击“待我跟进”的筛选项时，因为“带我跟进”的筛选项下没有“无效”的tab
    // 此时将tab默认展示为“待跟进”，将无效的字段状态设置为有效
    if(_.isEqual(updateTrace, NEED_MY_HANDLE) && _.isEqual(this.filterClueAvailability, AVALIBILITYSTATUS.INAVALIBILITY)) {
        this.filterClueStatus = this.setInitialFilterClueStatus();
        this.filterClueAvailability = AVALIBILITYSTATUS.AVALIBILITY;
    }
};
ClueFilterStore.prototype.setFilterClueProvince = function(updateProvince) {
    var selectedProvince = [];
    _.forEach(updateProvince, (item) => {
        if (item.value === ''){
            this.unexist_fields.push('province');
        }else{
            selectedProvince.push(item.value);
        }
    });
    this.filterClueProvince = selectedProvince;
};
//筛选存在的字段
ClueFilterStore.prototype.setExistedFiled = function(existedItem) {
    if (existedItem){
        this.exist_fields = [existedItem];
    }else{
        this.exist_fields = [];
    }
};
//筛选不存在的字段
ClueFilterStore.prototype.setUnexistedFiled = function(unexistedItem) {
    if (unexistedItem){
        this.unexist_fields = [unexistedItem];
    }else{
        this.unexist_fields = [];
    }
};
//筛选相似（labels）的字段
ClueFilterStore.prototype.setSimilarFiled = function(similarItem){
    if (similarItem){
        this.filterLabels = similarItem;
    }else{
        this.filterLabels = '';
    }
};

module.exports = alt.createStore(ClueFilterStore, 'ClueFilterStore');