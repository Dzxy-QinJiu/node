const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
import ajax from 'ant-ajax';
import commonAjax from 'MOD_DIR/common/ajax';
var FilterAction = require('../../action/filter-action');
var clueFilterStore = require('../../store/clue-filter-store');
var clueCustomerAction = require('../../action/clue-customer-action');
import { FilterList } from 'CMP_DIR/filter';
import {clueStartTime, SELECT_TYPE, getClueStatusValue, COMMON_OTHER_ITEM, SIMILAR_CUSTOMER, SIMILAR_CLUE,NOT_CONNECTED, sourceClassifyArray } from '../../utils/clue-customer-utils';
import {getClueUnhandledPrivilege, isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
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
    },{
        name: Intl.get('clue.customer.not.connect.phone', '未打通电话的线索'),
        value: NOT_CONNECTED
    }
];
class ClueFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clueSourceArray: this.props.clueSourceArray,
            accessChannelArray: this.props.accessChannelArray,
            clueClassifyArray: this.props.clueClassifyArray,
            //自定义常用筛选
            customCommonFilter: [],
            ...clueFilterStore.getState(),
        };
    }

    onStoreChange = () => {
        this.setState(clueFilterStore.getState());
    };
    componentDidMount = () => {
        clueFilterStore.listen(this.onStoreChange);
        this.getClueProvinceList();
        this.getCustomCommonFilter();
        //获取所有销售列表
        FilterAction.getTeamMemberList();
        //获取团队列表
        FilterAction.getTeamList();
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

    //获取自定义常用筛选
    getCustomCommonFilter() {
        ajax.send({
            url: '/rest/condition/v1/condition/range/user/1000/operate_time/descend',
            type: 'post',
            data: {
                query: {
                    tag: 'clue_customer'
                }
            }
        })
            .done(result => {
                const conditionList = _.get(result, 'list');

                const customCommonFilter = _.map(conditionList, condition => this.getFilterItemFromConditionItem(condition));

                this.setState({customCommonFilter});
            });
    }
    
    //将自定义常用筛选查询条件转换为前端展示用的格式
    getFilterItemFromConditionItem(item) {
        let filters = [];
        let plainFilters = [];
    
        //将处理好的筛选项组装成FilterList所需的格式
        const handleAddItem = nameObj => {
            let filterItem = null;
            plainFilters.push(nameObj);
            filterItem = {
                ...nameObj,
                data: [{
                    ...nameObj,
                    selected: true
                }]
            };
            const sameGroupItem = filters.find(x => x.groupId === filterItem.groupId);
            //将已存在的高级筛选合并成commonData的结构
            if (sameGroupItem) {
                sameGroupItem.data.push({
                    ...nameObj,
                    selected: true
                });
            }
            else {
                filters.push(filterItem);
            }
        };
    
        //处理筛选项的value，处理成前端的格式
        const handleValue = (value, key) => {
            let item = null;
            const nameObj = {
                groupId: key,
                groupName: key,
                value: value,
                name: value
            };

            //处理name（展示的筛选项文字）
            switch (key) {
                case 'sales_team_id':
                    item = this.state.teamList.find(x => x.group_id === value);
                    if (item) {
                        nameObj.name = item.group_name;
                    }
                    break;
                case 'source_classify':
                    item = sourceClassifyArray.find(x => x.value === value);
                    if (item) {
                        nameObj.name = item.name;
                    }
                    break;
            }
            handleAddItem(nameObj);
        };
    
        if (_.get(item, 'query_condition')) {
            if (_.get(item.query_condition, 'query')) {
                _.each(item.query_condition.query, (value, key) => {
                    if (value) {
                        let valueList = [];
                        if (value.length) {
                            valueList = value;
                        }
                        if (typeof value === 'string') {
                            //拼接字符串（数组value）
                            if (value.includes(',')) {
                                valueList = value.split(',');
                            }
                            //单个字符串
                            else {
                                handleValue(value, key);
                            }
                        }
                        //数组value
                        if (Array.isArray(valueList) && valueList.length > 0) {
                            valueList.forEach(x => {
                                handleValue(x, key);
                            });
                        }
                    }
                });
            }
            //日期范围通过interval判断
            if (_.get(item.query_condition, 'rang_params.length')) {
                item.query_condition.rang_params.forEach(rangeItem => {
                    const nameObj = {
                        groupId: COMMON_OTHER_ITEM,
                        groupName: Intl.get('crm.186', '其他'),
                        value: '',
                        name: rangeItem.name
                    };
                    handleAddItem(nameObj);
                });
            }
        }
    
        return {
            name: item.name,
            value: item.name,
            data: filters,
            plainFilterList: plainFilters,
            id: item.id
        };
    }

    //删除自定义常用筛选
    deleteCustomCommonFilter(item) {
        return commonAjax({
            url: '/rest/condition/v1/condition/' + item.id,
            type: 'delete',
            usePromise: true
        });
    }

    handleFilterChange = (data) => {
        clueCustomerAction.setClueInitialData();
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            FilterAction.setExistedFiled();
            FilterAction.setUnexistedFiled();
            FilterAction.setFilterClueAllotNoTrace();
            FilterAction.setSimilarFiled();
            FilterAction.setNotConnectedClues();
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
                }else if (item.groupId === 'sales_team_id'){
                    //线索接入渠道
                    FilterAction.setFilterTeamList( _.get(item,'data'));
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
                } else if(item.groupId === 'source_classify') {
                    FilterAction.setFilterSourceClassify( _.get(item,'data'));
                } else if (item.groupId === COMMON_OTHER_ITEM){
                    if(item.value === SIMILAR_CUSTOMER){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CUSTOMER);
                        FilterAction.setNotConnectedClues();
                    }else if(item.value === SIMILAR_CLUE){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CLUE);
                        FilterAction.setNotConnectedClues();
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
                        FilterAction.setNotConnectedClues();
                    }else if (item.value === NOT_CONNECTED){
                        FilterAction.setNotConnectedClues(true);
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled();
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
            FilterAction.setTimeRange({start_time: moment(_.get(date, '[0]')).startOf('day').valueOf(), end_time: moment(_.get(date, '[1]')).endOf('day').valueOf(), range: ''});
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
        let commonData = otherFilterArray.map(x => {
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

        //将自定义常用筛选加到常用筛选数据中
        commonData = commonData.concat(this.state.customCommonFilter);

        const advancedData = [{
            groupName: Intl.get('crm.96', '地域'),
            groupId: 'province',
            data: clueProvinceList.map(x => ({
                name: x,
                value: x
            }))
        }];
        //非销售角色才有来源、渠道、分类筛选项
        if(!isSalesRole()) {
            advancedData.unshift(
                {
                    groupName: Intl.get('clue.analysis.source', '来源'),
                    groupId: 'clue_source',
                    data: clueSourceArray.map(x => ({
                        name: x,
                        value: x
                    }))
                },{
                    groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                    groupId: 'access_channel',
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
                }
            );
        }
        advancedData.unshift({
            groupName: Intl.get('crm.clue.client.source', '集客方式'),
            groupId: 'source_classify',
            data: sourceClassifyArray.map(x => ({
                name: x.name,
                value: x.value
            }))
        });
        //非普通销售才有销团队和负责人
        if (!userData.getUserData().isCommonSales) {
            let ownerList = _.uniqBy(this.state.teamMemberList, 'nickname');
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
            advancedData.unshift(
                {
                    groupName: Intl.get('user.sales.team', '销售团队'),
                    groupId: 'sales_team_id',
                    data: _.drop(this.state.teamList).map(x => ({
                        name: x.group_name,
                        value: x.group_id,
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
                        toggleList={this.props.toggleList}
                        onDelete={this.deleteCustomCommonFilter.bind(this)}
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
    showSelectTip: false,
    toggleList: function() {

    }
};
ClueFilterPanel.propTypes = {
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    getClueList: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool,
    toggleList: PropTypes.func,
};

export default ClueFilterPanel;
