const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAction = require('../../action/filter-action');
var clueFilterStore = require('../../store/clue-filter-store');
var clueCustomerAction = require('../../action/clue-customer-action');
import { FilterList } from 'CMP_DIR/filter';
import { AntcDatePicker as DatePicker } from 'antc';
import {clueStartTime } from '../../utils/clue-customer-utils';
var ClueAnalysisStore = require('../../store/clue-analysis-store');
var ClueAnalysisAction = require('../../action/clue-analysis-action');
const COMMON_OTHER_ITEM = 'otherSelectedItem';
const otherFilterArray = [{
    name: Intl.get('clue.repeat.clue.list', '重复线索'),
    value: 'repeat_id'
}, {
    name: Intl.get('clue.has.no.relative.customer', '没有关联客户的线索'),
    value: 'customer_id'
}
];
class ClueFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clueSourceArray: this.props.clueSourceArray,
            accessChannelArray: this.props.accessChannelArray,
            clueClassifyArray: this.props.clueClassifyArray,
            ...clueFilterStore.getState(),
        };
    }

    onStoreChange = () => {
        this.setState(clueFilterStore.getState());
    };
    componentDidMount = () => {
        clueFilterStore.listen(this.onStoreChange);
        this.getClueProvinceList();
    };
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            clueSourceArray: nextProps.clueSourceArray,
            accessChannelArray: nextProps.accessChannelArray,
            clueClassifyArray: nextProps.clueClassifyArray,
        });
    };
    componentWillUnmount = () => {
        clueFilterStore.unlisten(this.onStoreChange);
    };
    //获取地域统计数据
    getClueProvinceList = () => {
        const staticsPageSize = ClueAnalysisStore.getState().staticsPageSize;
        const staticsNum = ClueAnalysisStore.getState().staticsNum;
        const rangeParams = ClueAnalysisStore.getState().rangeParams;
        rangeParams[0].from = clueStartTime;
        rangeParams[0].to = moment().valueOf();
        let pathParams = {
            field: 'province',
            page_size: staticsPageSize,
            num: staticsNum,
        };
        ClueAnalysisAction.getClueStatics(pathParams, rangeParams);
    };

    handleFilterChange = (data) => {
        clueCustomerAction.setClueInitialData();
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            FilterAction.setExistedFiled();
            FilterAction.setUnexistedFiled();
        }
        data.forEach(item => {
            if (item.groupId) {
                //线索状态
                if (item.groupId === 'clue_status'){
                    //如果选中的是无效状态
                    if (_.get(item,'data[0]') && _.get(item,'data[0].value') === 'avaibility'){
                        FilterAction.setFilterClueAvailbility();
                    }else{
                        FilterAction.setFilterType( _.get(item,'data'));
                    }
                }else if (item.groupId === 'clue_source' && _.get(item,'data')){
                    //线索来源
                    FilterAction.setFilterClueSoure( _.get(item,'data'));
                }else if (item.groupId === 'clue_access'){
                    //线索接入渠道
                    FilterAction.setFilterClueAccess( _.get(item,'data'));
                }else if (item.groupId === 'clue_classify'){
                    //线索分类
                    FilterAction.setFilterClueClassify( _.get(item,'data'));
                }else if (item.groupId === 'clue_province'){
                    //线索地域
                    var provinceList = _.get(item,'data');
                    _.forEach(provinceList,(item) => {
                        if (item.value === Intl.get('common.unknown', '未知')){
                            item.value = '';
                        }
                    });
                    FilterAction.setFilterClueProvince(provinceList);
                }else if (item.groupId === COMMON_OTHER_ITEM){
                    //如果是筛选没有关联客户的线索
                    //如果是筛选重复线索
                    if (item.value === 'repeat_id'){
                        FilterAction.setExistedFiled('repeat_id');
                        FilterAction.setUnexistedFiled();
                    }else if (item.value === 'customer_id'){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled('customer_id');
                    }

                }
            }
        });

        setTimeout(() => {
            this.props.getClueList();
        });
    };
    onSelectDate = (start_time, end_time) => {
        if (!start_time) {
            //为了防止开始时间不传，后端默认时间是从1970年开始的问题
            start_time = clueStartTime;
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        FilterAction.setTimeRange({start_time: start_time, end_time: end_time});
        clueCustomerAction.setClueInitialData();
        setTimeout(() => {
            this.props.getClueList();
        });
    };
    renderTimeRangeSelect = () => {
        return(
            <div className="time-range-wrap">
                <span className="consult-time">{Intl.get('clue.analysis.consult.time', '咨询时间')}</span>
                <DatePicker
                    disableDateAfterToday={true}
                    range={this.state.timeType}
                    onSelect={this.onSelectDate}>
                    <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                    <DatePicker.Option
                        value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                    <DatePicker.Option
                        value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                    <DatePicker.Option
                        value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                    <DatePicker.Option
                        value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                    <DatePicker.Option
                        value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                    <DatePicker.Option
                        value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                </DatePicker>
            </div>
        );
    };
    handleClueProvinceList = () => {
        //线索的省份
        var clueProvince = _.get(ClueAnalysisStore.getState(), 'clueProvinceList.list');
        var provinceList = [];
        _.forEach(clueProvince, (item) => {
            if (_.keys(item) && _.keys(item)[0] === ''){
                provinceList.push(Intl.get('common.unknown', '未知'));
            }else{
                provinceList.push(_.keys(item));
            }

        });
        return _.flattenDeep(provinceList);
    };
    render(){
        //线索来源
        const clueSourceArray = this.state.clueSourceArray;
        //接入渠道
        const accessChannelArray = this.state.accessChannelArray;
        //线索分类
        const clueClassifyArray = this.state.clueClassifyArray;
        var filterClueStatus = this.state.filterClueStatus;
        filterClueStatus = _.filter(filterClueStatus, item => {
            return item.value;
        });
        //加上无效线索的筛选
        filterClueStatus.push({
            name: Intl.get('sales.clue.is.enable', '无效'),
            value: 'avaibility',
        });
        const clueProvinceList = this.handleClueProvinceList();
        const commonData = otherFilterArray.map(x => {
            x.readOnly = true;
            x.groupId = COMMON_OTHER_ITEM;
            x.groupName = Intl.get('crm.186', '其他');
            x.data = [{
                name: x.name,
                value: x.value,
                groupId: COMMON_OTHER_ITEM,
                groupName: Intl.get('crm.186', '其他'),
                data: [{
                    name: x.name,
                    value: x.value,
                    groupId: COMMON_OTHER_ITEM,
                    groupName: Intl.get('crm.186', '其他'),
                }]
            }];
            x.plainFilterList = [{
                name: x.name,
                value: x.value
            }];
            return x;
        });
        const advancedData = [
            {
                groupName: Intl.get('clue.filter.clue.status','线索状态'),
                groupId: 'clue_status',
                singleSelect: true,
                data: filterClueStatus,
            },{
                groupName: Intl.get('crm.sales.clue.source', '线索来源'),
                groupId: 'clue_source',
                data: clueSourceArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                groupId: 'clue_access',
                data: accessChannelArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('clue.customer.classify', '线索分类'),
                groupId: 'clue_classify',
                data: clueClassifyArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('crm.96', '地域'),
                groupId: 'clue_province',
                data: clueProvinceList.map(x => ({
                    name: x,
                    value: x
                }))
            }];

        return (
            <div data-tracename="筛选">
                <div className="clue-filter-panel">
                    <FilterList
                        commonData={commonData}
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        renderOtherDataContent={this.renderTimeRangeSelect}
                        style={this.props.style}
                    />
                </div>
            </div>
        );
    }
}
ClueFilterPanel.defaultProps = {
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    getClueList: function() {

    },
    style: {}
};
ClueFilterPanel.propTypes = {
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    getClueList: PropTypes.func,
    style: PropTypes.object,
};

export default ClueFilterPanel;
