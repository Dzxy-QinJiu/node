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
import {clueStartTime, SELECT_TYPE, getClueStatusValue, COMMON_OTHER_ITEM, SIMILAR_CUSTOMER, SIMILAR_CLUE,SIMILAR_IP,NOT_CONNECTED,EXTRACT_TIME, sourceClassifyArray, isCommonSalesOrPersonnalVersion, APPLY_TRY_LEAD ,otherFilterArray} from '../../utils/clue-customer-utils';
import {getClueUnhandledPrivilege, getTimeWithSecondZero, isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
var ClueAnalysisStore = require('../../store/clue-analysis-store');
var ClueAnalysisAction = require('../../action/clue-analysis-action');
import userData from 'PUB_DIR/sources/user-data';
import {isKetaoOrganizaion} from 'PUB_DIR/sources/utils/common-method-util';
import RangePicker from 'CMP_DIR/range-picker/index';
import { selectType } from 'PUB_DIR/sources/utils/consts';
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
    getOtherFilterArray = () => {
        var otherFilterCloneArray = _.cloneDeep(otherFilterArray);
        if (isKetaoOrganizaion()) {//在客套组织下，才可以筛选申请试用的线索
            otherFilterCloneArray.push({
                name: Intl.get('crm.filter.lead.apply.try.enterprise', '申请企业试用的线索'),
                value: APPLY_TRY_LEAD
            });
        }
        return otherFilterCloneArray;
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
                //如果当前条件是“销售团队”，需要根据团队id找到其对应的团队名作为显示名称
                case 'sales_team_id':
                    item = this.state.teamList.find(x => x.group_id === value);
                    if (item) {
                        nameObj.name = item.group_name;
                    }
                    break;
                //如果当前条件是“获客方式”，需要找到其对应的中文名作为显示名称
                case 'source_classify':
                    item = sourceClassifyArray.find(x => x.value === value);
                    if (item) {
                        nameObj.name = item.name;
                    }
                    break;
                //如果当前条件是“有相似线索”或“有相似客户”等标签，需要将其对应到常用筛选组
                case 'labels':
                    nameObj.groupId = COMMON_OTHER_ITEM;
                    nameObj.groupName = Intl.get('crm.186', '其他');
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
                            if (_.includes(value, ',')) {
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

            if (_.get(item.query_condition, 'rang_params.length')) {
                item.query_condition.rang_params.forEach(rangeItem => {
                    //如果当前条件是“时间”
                    if (rangeItem.name === 'source_time') {
                        const nameObj = {
                            name: Intl.get('common.login.time', '时间') + '：' + moment(rangeItem.from).format(oplateConsts.DATE_FORMAT) + ' - ' + moment(rangeItem.to).format(oplateConsts.DATE_FORMAT),
                            groupId: 'time',
                            from: rangeItem.from,
                            to: rangeItem.to,
                        };
                        handleAddItem(nameObj);
                    }

                    //如果当前条件是“未打通电话的线索”
                    if (rangeItem.name === 'no_answer_times') {
                        const nameObj = {
                            name: Intl.get('clue.customer.not.connect.phone', '未打通电话的线索'),
                            groupId: COMMON_OTHER_ITEM,
                            groupName: Intl.get('crm.186', '其他'),
                        };
                        handleAddItem(nameObj);
                    }
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
        const timeCondition = _.find(data, item => item.groupId === 'time');

        //若当前选中的筛选项中包含时间条件
        if (timeCondition) {
            //则将该时间条件设置到state中，以在显示和查询时使用
            FilterAction.setTimeRange({start_time: timeCondition.from, end_time: timeCondition.to, range: ''});
        }

        clueCustomerAction.setClueInitialData();
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            FilterAction.setExistedFiled();
            FilterAction.setUnexistedFiled();
            FilterAction.setFilterClueAllotNoTrace();
            FilterAction.setSimilarFiled();
            FilterAction.setNotConnectedClues();
            FilterAction.setLeadFromLeadPool();
        }
        data.forEach(item => {
            if (item.groupId) {
                // 需要处理自定义字段的数据结构
                const customizedVariables = _.get(this.props.leadCustomFieldData, '[0].customized_variables');
                let customized_variables = {};
                // 自定义字段名称
                let customFieldName = _.map(customizedVariables, 'name');
                const itemData = _.get(item,'data', []);
                if (_.includes(customFieldName, item.groupId)) {
                    customized_variables[item.groupId] = _.map(itemData, x => x.value);
                    FilterAction.setFilterCustomField(customized_variables);
                } else if (item.groupId === 'clue_status'){ //线索状态
                    //如果选中的是无效状态
                    if (_.get(item,'data[0]') && _.get(item,'data[0].value') === 'avaibility'){
                        FilterAction.setFilterClueAvailbility();
                    }else{
                        FilterAction.setFilterType( itemData);
                    }
                }else if (item.groupId === 'clue_source' && itemData){
                    //线索来源
                    FilterAction.setFilterClueSoure( itemData);
                }else if (item.groupId === 'access_channel'){
                    //线索接入渠道
                    if(_.isEqual(_.get(item, 'data[0].name'), Intl.get('clue.customer.filter.classify.not.setting', '未设置'))) {
                        FilterAction.setUnexistedFiled('access_channel');
                        FilterAction.setFilterClueAccess();
                    }else {
                        FilterAction.setFilterClueAccess(itemData);
                    }
                }else if (item.groupId === 'sales_team_id'){
                    //销售团队列表
                    FilterAction.setFilterTeamList(itemData);
                }else if (item.groupId === 'clue_classify'){
                    //线索分类
                    //未设置与其他选项是互斥选项
                    if(_.isEqual(_.get(item, 'data[0].name'), Intl.get('clue.customer.filter.classify.not.setting', '未设置'))) {
                        FilterAction.setUnexistedFiled('clue_classify');
                        FilterAction.setFilterClueClassify();
                    } else {
                        FilterAction.setFilterClueClassify(itemData);
                    }
                }else if (item.groupId === 'province'){
                    //线索地域
                    var provinceList = _.get(item,'data');
                    _.forEach(provinceList,(item) => {
                        if (item.value === Intl.get('common.unknown', '未知')){
                            item.value = '';
                        }
                    });
                    FilterAction.setFilterClueProvince(provinceList);
                } else if(item.groupId === 'source_classify') {
                    FilterAction.setFilterSourceClassify(itemData);
                } else if (item.groupId === COMMON_OTHER_ITEM){
                    if(item.value === SIMILAR_CUSTOMER){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CUSTOMER);
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead();
                    }else if(item.value === SIMILAR_CLUE){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_CLUE);
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead();
                    }else if(item.value === SIMILAR_IP){
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled(SIMILAR_IP);
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead();
                    }else if (item.value === SELECT_TYPE.WAIT_ME_HANDLE){
                        //如果筛选的是待我处理的线索
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        //如果上次选中的状态是已转化，需要把已转化改成待跟进
                        FilterAction.setFilterClueAllotNoTrace(true);
                        FilterAction.setSimilarFiled();
                        if(this.getFilterStatus().status === SELECT_TYPE.HAS_TRANSFER){
                            FilterAction.setFilterType(SELECT_TYPE.WILL_TRACE);
                        }
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead();
                    }else if (item.value === NOT_CONNECTED){
                        FilterAction.setNotConnectedClues(true);
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead();
                    }else if(item.value === EXTRACT_TIME){//从线索池中提取的线索
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled();
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool(EXTRACT_TIME);
                        FilterAction.setAppliedTryLead();
                    }else if(item.value === APPLY_TRY_LEAD){ //申请试用企业版的线索
                        FilterAction.setExistedFiled();
                        FilterAction.setUnexistedFiled();
                        FilterAction.setFilterClueAllotNoTrace();
                        FilterAction.setSimilarFiled();
                        FilterAction.setNotConnectedClues();
                        FilterAction.setLeadFromLeadPool();
                        FilterAction.setAppliedTryLead(APPLY_TRY_LEAD);
                    }
                } else if (item.groupId === 'user_name'){
                    FilterAction.setFilterClueUsername( itemData);
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
    changeRangePicker = (rangeObj) => {
        if(rangeObj){
            FilterAction.setTimeRange({start_time: rangeObj.startTime, end_time: rangeObj.endTime,range: ''});
        }else{
            FilterAction.setTimeRange({start_time: clueStartTime, end_time: moment().endOf('day').valueOf(), range: 'all'});
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
        const startTime = this.state.rangeParams[0].from;
        const endTime = this.state.rangeParams[0].to;
        var rangeObj = startTime !== clueStartTime ? {startTime: moment(startTime),endTime: moment(endTime)} : {startTime: '',endTime: this.state.timeType !== 'all' ? moment(endTime) : ''};
        return(
            <div className="time-range-wrap">
                <RangePicker
                    disabledDate={this.disabledDate}
                    changeRangePicker={this.changeRangePicker}
                    timeRange={rangeObj}
                />
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
    //线索分类列表和接入渠道列表的处理
    processClueClassifyArray = (arrayData) => {
        let processedArray = [];
        processedArray.push({
            name: Intl.get('clue.customer.filter.classify.not.setting', '未设置'),
            value: Intl.get('clue.customer.filter.classify.not.setting', '未设置'),
            selectOnly: true
        });
        _.forEach(arrayData, x => {
            processedArray.push({
                name: x,
                value: x
            });
        });
        return processedArray;
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
        var otherFilterArray = this.getOtherFilterArray();
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
        //非销售角色或者个人版，企业版才展示来源
        if(!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            advancedData.unshift(
                {
                    groupName: Intl.get('clue.analysis.source', '来源'),
                    groupId: 'clue_source',
                    data: clueSourceArray.map(x => ({
                        name: x,
                        value: x
                    }))
                }
            );
        }
        advancedData.unshift({
            groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
            groupId: 'access_channel',
            data: this.processClueClassifyArray(accessChannelArray)
        },{
            groupName: Intl.get('clue.customer.classify', '线索分类'),
            groupId: 'clue_classify',
            data: this.processClueClassifyArray(clueClassifyArray)
        });
        //非普通销售 且 非个人版本才有销团队和负责人
        if (!isCommonSalesOrPersonnalVersion()) {
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
        advancedData.unshift({
            groupName: Intl.get('crm.clue.client.source', '获客方式'),
            groupId: 'source_classify',
            data: sourceClassifyArray.map(x => ({
                name: x.name,
                value: x.value
            }))
        });

        if (!_.isEmpty(this.props.leadCustomFieldData)) {
            const customizedVariables = _.get(this.props.leadCustomFieldData, '[0].customized_variables');
            _.each(customizedVariables, item => {
                const fieldType = _.get(item, 'field_type');
                const name = _.get(item, 'name');
                const selectValues = _.get(item, 'select_values');
                // 是否是选择类型（现在先做单选、多选类型的）
                if (_.includes(selectType, fieldType)) {
                    let customField = {
                        groupName: name,
                        groupId: name,
                        data: _.map(selectValues, x => ({
                            name: x,
                            value: x
                        }))
                    };
                    // 单选
                    if (_.includes(['select', 'radio'], fieldType)) {
                        customField.singleSelect = true;
                    }
                    advancedData.splice(advancedData.length - 1, 0, customField);
                }
            });
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
                        //普通销售或者运营人员一开始进来的时候展示待我处理面板 这个功能暂时隐藏
                        // hasSettedDefaultCommonSelect={true}
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
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
    leadCustomFieldData: PropTypes.object,
};

export default ClueFilterPanel;
