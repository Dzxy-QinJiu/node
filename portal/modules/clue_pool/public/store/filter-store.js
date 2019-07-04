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
        //筛选存在的字段
        this.exist_fields = [];
        //筛选不存在的字段
        this.unexist_fields = [];
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

    //获取线索来源
    setCondition(list) {
        this.provinceList = list;
    }

    // 设置筛选线索的来源
    setFilterClueSoure(updateSource) {
        let selectedSource = [];
        _.forEach(updateSource, (item) => {
            selectedSource.push(item.value);
        });
        this.filterClueSource = selectedSource;
    }

    // 设置筛选线索的接入渠道
    setFilterClueAccess(updateAccess) {
        let selectedAccess = [];
        _.forEach(updateAccess, (item) => {
            selectedAccess.push(item.value);
        });
        this.filterClueAccess = selectedAccess;
    }

    // 设置筛选线索的分类
    setFilterClueClassify(updateClassify) {
        let selectedClassify = [];
        _.forEach(updateClassify, (item) => {
            selectedClassify.push(item.value);
        });
        this.filterClueClassify = selectedClassify;
    }

    // 设置筛选负责人
    setFilterClueUsername(updateUsers) {
        let filterClueUsers = [];
        _.forEach(updateUsers, (item) => {
            if (item.selected){
                filterClueUsers.push(item.value);
            }
        });
        this.filterClueUsers = filterClueUsers;
    }
    // 设置筛选地域
    setFilterClueProvince(updateProvince) {
        let selectedProvince = [];
        _.forEach(updateProvince, (item) => {
            if (item.value === ''){
                this.unexist_fields.push('province');
            }else{
                selectedProvince.push(item.value);
            }
        });
        this.filterClueProvince = selectedProvince;
    }
}

export default alt.createStore(FilterStore, 'FilterStore');