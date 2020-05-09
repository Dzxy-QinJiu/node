/**
 * Created by hzl on 2019/7/3.
 */

import FilterAction from '../action/filter-action';
const datePickerUtils = require('antc/lib/components/datepicker/utils');
import {clueStartTime} from '../utils/clue-pool-utils';
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import {AVALIBILITYSTATUS, CLUE_DIFF_TYPE, SELECT_TYPE} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
class FilterStore {
    constructor() {
        this.setInitialData();
        this.bindActions(FilterAction);
    }

    setInitialData() {
        let filterClueStatus = _.cloneDeep(CLUE_DIFF_TYPE);
        //如果是销售角色，默认展示待跟进
        let targetObj = _.find(filterClueStatus, (item) => item.value === SELECT_TYPE.WILL_TRACE);
        if (targetObj){
            targetObj.selected = true;
        }

        //默认展示全部时间
        this.timeType = 'all';
        this.rangeParams = [{//时间范围参数
            from: clueStartTime,
            to: moment().endOf('day').valueOf(),
            type: 'time',
            name: 'source_time'
        }];
        this.filterClueStatus = filterClueStatus;//当前选择的线索类型
        this.filterClueSource = [];//筛选的线索来源
        this.filterClueAvailability = AVALIBILITYSTATUS.AVALIBILITY;
        //筛选的线索接入渠道
        this.filterClueAccess = [];
        //筛选的线索分类
        this.filterClueClassify = [];
        //筛选线索的地域
        this.filterClueProvince = [];
        //筛选获客方式
        this.filterSourceClassify = [];
        //按销售进行筛选
        this.filterClueUsers = [];
        //按照销售团队进行筛选
        this.salesTeamId = [];
        //按照相思线索相似客户筛选
        this.filterLabels = '';
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

    getTeamList(result) {
        this.teamTreeList = result.teamTreeList;
        this.teamList = result.teamList;
    }
    setFilterClueAvailability() {
        //点击线索无效，把线索状态选为全部
        this.filterClueAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
        _.forEach(this.filterClueStatus, (item) => {
            item.selected = false;
            if (item.value === SELECT_TYPE.ALL){
                item.selected = true;
            }
        });

    }

    //设置筛选线索的类型
    setFilterType(updateType) {
        this.filterClueAvailability = AVALIBILITYSTATUS.AVALIBILITY;
        _.forEach(this.filterClueStatus, (item) => {
            item.selected = false;
            if(updateType === item.value) {
                item.selected = true;
            }
        });
    }

    // 设置筛选线索的来源
    setFilterClueSoure(updateSource) {
        this.filterClueSource = _.map(updateSource, 'value');
    }

    // 设置筛选线索的接入渠道
    setFilterClueAccess(updateAccess) {
        this.filterClueAccess = _.map(updateAccess, 'value');
    }
    //设置筛选获客方式
    setFilterSourceClassify(updateSourceClassify) {
        let selectedSourceClassify = [];
        _.forEach(updateSourceClassify, (item) => {
            if (item.selected) {
                selectedSourceClassify.push(item.value);
            }
        });
        this.filterSourceClassify = selectedSourceClassify;
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
    // 设置筛选销售给团队
    setFilterClueTeam(updateTeam) {
        this.salesTeamId = _.map(updateTeam, 'value');
    }
    //筛选相似（labels）的字段
    setSimilarFiled(similarItem){
        if (similarItem){
            this.filterLabels = similarItem;
        }else{
            this.filterLabels = '';
        }
    }

}

export default alt.createStore(FilterStore, 'FilterStore');