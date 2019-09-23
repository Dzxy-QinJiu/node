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
import {clueStartTime, SELECT_TYPE, getClueStatusValue, COMMON_OTHER_ITEM, SIMILAR_CUSTOMER, SIMILAR_CLUE } from '../../utils/clue-customer-utils';
import {getClueUnhandledPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
var ClueAnalysisStore = require('../../store/clue-analysis-store');
var ClueAnalysisAction = require('../../action/clue-analysis-action');
import userData from 'PUB_DIR/sources/user-data';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
let otherFilterArray = [
    {
        name: Intl.get('clue.filter.wait.me.handle', '待我处理'),
        value: SELECT_TYPE.WAIT_ME_HANDLE
    },{
        name: Intl.get( 'clue.has.similar.customer','有相似客户'),
        value: SIMILAR_CUSTOMER
    },{
        name: Intl.get( 'clue.has.similar.clue','有相似线索'),
        value: SIMILAR_CLUE
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
        //获取所有销售列表
        FilterAction.getTeamMemberList();
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
        const rangeParams = _.cloneDeep(ClueAnalysisStore.getState().rangeParams);
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
            FilterAction.setFilterClueAllotNoTrace();
            FilterAction.setSimilarFiled();
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
                    if(item.value === SIMILAR_CUSTOMER){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CUSTOMER);
                    }else if(item.value === SIMILAR_CLUE){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CLUE);
                    }else if (item.value === SELECT_TYPE.WAIT_ME_HANDLE){
                        //如果筛选的是待我处理的线索
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        //如果上次选中的状态是已转化，需要把已转化改成待跟进
                        FilterAction.setFilterClueAllotNoTrace('0');
                        FilterAction.setSimilarFiled();
                        if(this.getFilterStatus().status === SELECT_TYPE.HAS_TRANSFER){
                            FilterAction.setFilterType(SELECT_TYPE.WILL_TRACE);
                        }
                    }
                }else if (item.groupId === 'user_name'){
                    FilterAction.setFilterClueUsername( _.get(item,'data'));
                }
            }
        });

        setTimeout(() => {
            this.props.getClueList();
        });
    };
    getFilterStatus = () => {
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        return getClueStatusValue(filterClueStatus);
    };
    changeRangePicker = (date, dateString) => {
        if (!_.get(date,'[0]')){
            FilterAction.setTimeRange({start_time: clueStartTime, end_time: moment().endOf('day').valueOf(), range: 'all'});
        }else{
            FilterAction.setTimeRange({start_time: moment(_.get(date, '[0]')).valueOf(), end_time: moment(_.get(date, '[1]')).valueOf(), range: ''});
        }
        clueCustomerAction.setClueInitialData();
        setTimeout(() => {
            this.props.getClueList();
        });
    };
    //今天之后的日期不可以选
    disabledDate = (current) => {
        return current > moment().endOf('day');
    };
    renderTimeRangeSelect = () => {
        return(
            <div className="time-range-wrap">
                <span className="consult-time">{Intl.get('common.login.time', '时间')}</span>
                <RangePicker
                    disabledDate={this.disabledDate}
                    onChange={this.changeRangePicker}/>

                {/*<DatePicker*/}
                {/*disableDateAfterToday={true}*/}
                {/*range={this.state.timeType}*/}
                {/*onSelect={this.onSelectDate}>*/}
                {/*<DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>*/}
                {/*<DatePicker.Option*/}
                {/*value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>*/}
                {/*</DatePicker>*/}
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
    setDefaultSelectCommonFilter = (commonData,notSelfHandle,callback) => {
        var targetIndex = '';
        if (getClueUnhandledPrivilege() && !notSelfHandle){
            targetIndex = _.findIndex(commonData, item => item.value === SELECT_TYPE.WAIT_ME_HANDLE);
        }
        _.isFunction(callback) && callback(targetIndex);
    };
    render(){
        //线索来源
        const clueSourceArray = this.state.clueSourceArray;
        //接入渠道
        const accessChannelArray = this.state.accessChannelArray;
        //线索分类
        const clueClassifyArray = this.state.clueClassifyArray;
        const clueProvinceList = this.handleClueProvinceList();
        //如果是销售或者运营，增加待我处理筛选项
        if (!getClueUnhandledPrivilege()) {
            otherFilterArray = _.filter(otherFilterArray, item => item.value !== SELECT_TYPE.WAIT_ME_HANDLE);
        }
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
                groupName: Intl.get('clue.analysis.source', '来源'),
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
        //非普通销售才有销售角色和团队
        if (!userData.getUserData().isCommonSales) {
            var ownerList = _.uniqBy(this.state.teamMemberList, 'nickname');
            advancedData.unshift(
                {
                    groupName: Intl.get('crm.6', '负责人'),
                    groupId: 'user_name',
                    singleSelect: true,
                    data: _.map(ownerList, x => ({
                        name: x.nickname,
                        value: x.nickname
                    }))
                }
            );
        }

        return (
            <div data-tracename="线索筛选">
                <div className="clue-filter-panel">
                    <FilterList
                        ref={filterList => this.filterList = filterList}
                        commonData={commonData}
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        renderOtherDataContent={this.renderTimeRangeSelect}
                        setDefaultSelectCommonFilter={this.setDefaultSelectCommonFilter}
                        hasSettedDefaultCommonSelect={true}
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
                        showAdvancedPanel={true}
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
    style: {},
    showSelectTip: false
};
ClueFilterPanel.propTypes = {
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    getClueList: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool
};

export default ClueFilterPanel;
