/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAction = require('../action/filter-action');
const datePickerUtils = require('CMP_DIR/datepicker/utils');
var userData = require('PUB_DIR/sources/user-data');
import {SELECT_TYPE, CLUE_DIFF_TYPE, AVALIBILITYSTATUS} from '../utils/clue-customer-utils';
function FilterStore() {
    this.setInitialData();
    //绑定action方法
    this.bindActions(FilterAction);
}

FilterStore.prototype.setInitialData = function() {
    var timeObj = datePickerUtils.getThisWeekTime(); // 本周
    var defaultValue = '';
    if (userData.getUserData().isCommonSales) {
        defaultValue = SELECT_TYPE.WILL_TRACE;
    }
    var filterClueStatus = _.cloneDeep(CLUE_DIFF_TYPE);
    _.forEach(filterClueStatus, (item) => {
        if (item.value === defaultValue) {
            item.selected = true;
        }
    });
    this.rangParams = [{//时间范围参数
        from: datePickerUtils.getMilliseconds(timeObj.start_time),
        to: datePickerUtils.getMilliseconds(timeObj.end_time, true),
        type: 'time',
        name: 'source_time'
    }];
    // this.clueCustomerTypeFilter = {status: defaultValue};//线索客户的类型  0 待分配 1 已分配 2 已跟进
    this.filterClueStatus = filterClueStatus;
    this.filterClueSource = [];//筛选的线索来源
    //筛选的线索接入渠道
    this.filterClueAccess = [];
    //筛选的线索分类
    this.filterClueClassify = [];
    //筛选线索是否有效
    this.filterClueAvailability = '';
};
//获取线索来源
FilterStore.prototype.setCondition = function(list) {
    this.provinceList = list;
};
//设置开始和结束时间
FilterStore.prototype.setTimeRange = function(timeRange) {
    this.rangParams[0].from = timeRange.start_time;
    this.rangParams[0].to = timeRange.end_time;
};
//设置筛选线索的类型
FilterStore.prototype.setFilterType = function(updateType) {
    this.filterClueAvailability = '';
    _.forEach(this.filterClueStatus, (item) => {
        item.selected = false;
        if (_.isArray(updateType) && updateType.length) {
            if (updateType[0].value === item.value) {
                item.selected = true;
            }
        } else if (item.value === SELECT_TYPE.ALL) {
            item.selected = true;
        }
    });
};
//设置筛选线索的来源
FilterStore.prototype.setFilterClueSoure = function(updateSource) {
    var selectedSource = [];
    _.forEach(updateSource, (item) => {
        selectedSource.push(item.value);
    });
    this.filterClueSource = selectedSource;
};
FilterStore.prototype.setFilterClueAccess = function(updateAccess) {
    var selectedAccess = [];
    _.forEach(updateAccess, (item) => {
        selectedAccess.push(item.value);
    });
    this.filterClueAccess = selectedAccess;
};
FilterStore.prototype.setFilterClueClassify = function(updateClassify) {
    var selectedClassify = [];
    _.forEach(updateClassify, (item) => {
        selectedClassify.push(item.value);
    });
    this.filterClueClassify = selectedClassify;
};
FilterStore.prototype.setFilterClueAvailbility = function() {
    this.filterClueAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
};
module.exports = alt.createStore(FilterStore, 'FilterStore');