/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAction = require('../action/filter-action');
const datePickerUtils = require('CMP_DIR/datepicker/utils');
import userData from 'PUB_DIR/sources/user-data';
import {SELECT_TYPE, CLUE_DIFF_TYPE, AVALIBILITYSTATUS, clueStartTime} from '../utils/clue-customer-utils';
import {getStartEndTimeOfDiffRange, isSalesRole, getClueUnhandledPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
function ClueFilterStore() {
    this.setInitialData();
    //绑定action方法
    this.bindActions(FilterAction);
}

ClueFilterStore.prototype.setInitialData = function() {
    var filterClueStatus = _.cloneDeep(CLUE_DIFF_TYPE);
    //如果不是销售角色，就展示待分配
    if(!isSalesRole()){
        filterClueStatus.push({
            name: Intl.get('clue.customer.will.distribution', '待分配'),
            value: SELECT_TYPE.WILL_DISTRIBUTE,
            selected: true
        });
    }else{
        //如果是销售角色，默认展示待跟进
        var targetObj = _.find(filterClueStatus, (item) => item.value === SELECT_TYPE.WILL_TRACE);
        if (targetObj){
            targetObj.selected = true;
        }
    }

    //默认展示全部时间
    this.timeType = 'all';
    this.rangeParams = [{//时间范围参数
        from: clueStartTime,
        to: moment().endOf('day').valueOf(),
        type: 'time',
        name: 'source_time'
    }];
    this.filterClueStatus = filterClueStatus;
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
    //筛选存在的字段
    this.exist_fields = [];
    //筛选不存在的字段
    this.unexist_fields = [];
    //按销售进行筛选
    this.filterClueUsers = [];
    //按负责人进行筛选
    this.teamMemberList = [];
    //筛选相似线索
    this.filterLabels = [];
    //如果是销售领导或者销售角色或者运营 默认选中 待我处理 进行筛选
    this.filterAllotNoTraced = getClueUnhandledPrivilege() ? '0' : '';
};
//获取线索来源
ClueFilterStore.prototype.setCondition = function(list) {
    this.provinceList = list;
};
//设置开始和结束时间
ClueFilterStore.prototype.setTimeRange = function(timeRange) {
    this.rangeParams[0].from = timeRange.start_time;
    this.rangeParams[0].to = timeRange.end_time;
};
//设置时间的类型
ClueFilterStore.prototype.setTimeType = function(timeType) {
    this.timeType = timeType;
    if (timeType === 'all'){
        this.setTimeRange({start_time: clueStartTime, end_time: moment().endOf('day').valueOf()});
    }else{
        var timeObj = getStartEndTimeOfDiffRange(this.timeType, true);
        var start_time = datePickerUtils.getMilliseconds(timeObj.start_time);
        var end_time = datePickerUtils.getMilliseconds(timeObj.end_time, true);
        this.setTimeRange({start_time: start_time, end_time: end_time});
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
        this.filterLabels = [similarItem];
    }else{
        this.filterLabels = [];
    }
};

module.exports = alt.createStore(ClueFilterStore, 'ClueFilterStore');