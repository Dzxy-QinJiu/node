/**
 * Created by hzl on 2019/7/3.
 */

import FilterAction from '../action/filter-action';
const datePickerUtils = require('CMP_DIR/datepicker/utils');
import {clueStartTime} from '../utils/clue-pool-utils';
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
class FilterStore {
    constructor() {
        this.setInitialData();
        this.bindActions(FilterAction);
    }

    setInitialData() {
        //默认展示全部时间
        this.timeType = 'all';
        this.rangeParams = [{//时间范围参数
            from: clueStartTime,
            to: moment().endOf('day').valueOf(),
            type: 'time',
            name: 'source_time'
        }];
        this.filterClueSource = [];//筛选的线索来源
        //筛选的线索接入渠道
        this.filterClueAccess = [];
        //筛选的线索分类
        this.filterClueClassify = [];
        //筛选线索的地域
        this.filterClueProvince = [];
        //按销售进行筛选
        this.filterClueUsers = [];
    }

    // 设置开始和结束时间
    setTimeRange(timeRange) {
        this.rangeParams[0].from = timeRange.start_time;
        this.rangeParams[0].to = timeRange.end_time;
    }

    //设置时间的类型
    setTimeType(timeType) {
        this.timeType = timeType;
        if (timeType === 'all'){
            this.setTimeRange({start_time: clueStartTime, end_time: moment().valueOf()});
        } else{
            let timeObj = getStartEndTimeOfDiffRange(this.timeType, true);
            let start_time = datePickerUtils.getMilliseconds(timeObj.start_time);
            let end_time = datePickerUtils.getMilliseconds(timeObj.end_time, true);
            this.setTimeRange({start_time: start_time, end_time: end_time});
        }
    }

    // 设置筛选线索的来源
    setFilterClueSoure(updateSource) {
        this.filterClueSource = _.map(updateSource, 'value');;
    }

    // 设置筛选线索的接入渠道
    setFilterClueAccess(updateAccess) {
        this.filterClueAccess = _.map(updateAccess, 'value');
    }

    // 设置筛选线索的分类
    setFilterClueClassify(updateClassify) {
        this.filterClueClassify = _.map(updateClassify, 'value');
    }

    // 设置筛选负责人
    setFilterClueUsername(updateUsers) {
        this.filterClueUsers = _.map(updateUsers, 'value');
    }
    // 设置筛选地域
    setFilterClueProvince(updateProvince) {
        this.filterClueProvince = _.map(updateProvince, 'value');
    }
}

export default alt.createStore(FilterStore, 'FilterStore');