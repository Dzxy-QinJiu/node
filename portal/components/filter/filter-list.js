import StatusWrapper from 'CMP_DIR/status-wrapper';
import { Alert, Icon, Popover, message } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
var classNames = require('classnames');
import PropTypes from 'prop-types';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import filterEmitter from './emitter';
import Trace from 'LIB_DIR/trace';
import { FILTER_COMMON_RATE_KEY } from './consts';
import { storageUtil } from 'ant-utils';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';
const local = storageUtil.local;
const CLOSE_COMMENT_HEIGHT = 32;//收起筛选tab的高度
class FilterList extends React.Component {
    constructor(props) {
        super();

        this.state = {
            rawCommonData: props.commonData,
            commonData: this.sortByClickNum(props.commonData) || [],//todo 在外部维护
            stopListenCommonData: false,//是否从外部接收新的commonData
            rawAdvancedData: props.advancedData || [],
            advancedData: $.extend(true, [], props.advancedData) || [],
            collapsedCommon: true,
            selectedAdvancedMap: {},
            selectedCommonIndex: '',
            showClickPop: false,//用于在点击pop时隐藏hover的popover
            showHoverPop: false,
        };
        this.handleClearAll = this.handleClearAll.bind(this);
    }
    componentDidMount() {
        filterEmitter.on(filterEmitter.CLEAR_FILTERS + this.props.key, this.handleClearAll);
        filterEmitter.on(filterEmitter.ADD_COMMON + this.props.key, this.handleAddCommon);
        filterEmitter.on(filterEmitter.CHANGE_PERMITTED + this.props.key, this.handleChangePermitted);
        filterEmitter.on(filterEmitter.CLEAR_COMMON_SELECT + this.props.key, this.handleClearCommonSelected);
        // hasSettedDefaultCommonSelect 是否设置了展示默认搜索项待我处理
        if (this.props.hasSettedDefaultCommonSelect){
            this.setDefaultFilterSetting();
        }else{
            this.handleChangePermitted = this.handleChangePermitted.bind(this);
        }

    }
    setDefaultFilterSetting = (notSelfHandle) => {
        //notSelfHandle 为true 默认不展示待我处理选项，因为销售角色进来默认展示待我处理，但是待我处理如果没有数据的话就需要取消这个筛选条件，展示全部的数据 为false，自动展示待我处理选项
        //把高级筛选的所有选中项都设置为false
        let advancedData = this.getClearSelectedAdvancedData();
        this.setState({
            advancedData
        },() => {
            this.props.setDefaultSelectCommonFilter(this.state.commonData,notSelfHandle,(targetIndex) => {
                if (targetIndex !== ''){
                    this.handleCommonItemClick(this.state.commonData[targetIndex],targetIndex, true);
                    //选择的常用筛选中不包含高级筛选项, 对外和search提供两者的union
                    const allSelectedFilterData = this.unionFilterList(this.state.commonData[targetIndex].data, this.state.advancedData);
                    //发送选择筛选项事件
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, allSelectedFilterData);
                }else{
                    filterEmitter.emit(filterEmitter.CLEAR_FILTERS);
                }
            });
        });
    }
    componentWillReceiveProps(newProps) {
        const { commonData, advancedData } = newProps;
        if (!this.state.stopListenCommonData && commonData && commonData.length && (JSON.stringify(commonData) !== JSON.stringify(this.state.rawCommonData))) {
            this.setState({
                rawCommonData: commonData,
                commonData: this.sortByClickNum(commonData)
            });
        }
        const pickNameValue = (advancedData, selectedFlag) => {
            advancedData = _.cloneDeep(advancedData);
            if (selectedFlag) {
                advancedData.forEach(group => {
                    group.data = group.data.map(x => ({ name: x.name, value: x.value, selected: x.selected }));
                });
            } else {
                advancedData.forEach(group => {
                    group.data = group.data.map(x => ({ name: x.name, value: x.value }));
                });
            }
            return advancedData;
        };
        if (advancedData && advancedData.length) {
            if (JSON.stringify(pickNameValue(advancedData, true)) !== JSON.stringify(pickNameValue(this.state.rawAdvancedData, true))) {
                this.setState({
                    advancedData
                });
            }
            if (JSON.stringify(pickNameValue(advancedData)) !== JSON.stringify(pickNameValue(this.state.rawAdvancedData))) {
                this.setState({
                    rawAdvancedData: advancedData,
                });
            }
        }
        //hasSettedDefaultCommonSelect 是否设置了展示默认搜索项待我处理
        if (newProps.hasSettedDefaultCommonSelect !== this.props.hasSettedDefaultCommonSelect){
            this.setDefaultFilterSetting();
        }

    }
    componentWillUnmount() {
        filterEmitter.removeListener(filterEmitter.CLEAR_FILTERS + this.props.key, this.handleClearAll);
        filterEmitter.removeListener(filterEmitter.ADD_COMMON + this.props.key, this.handleAddCommon);
        filterEmitter.removeListener(filterEmitter.CHANGE_PERMITTED + this.props.key, this.handleChangePermitted);
        filterEmitter.removeListener(filterEmitter.CLEAR_COMMON_SELECT + this.props.key, this.handleClearCommonSelected);
    }
    toggleCollapse(type) {
        switch (type) {
            case 'common':
                this.setState({
                    collapsedCommon: !this.state.collapsedCommon
                });
                break;
        }
    }
    handleAddCommon = (item) => {
        const { data, filterName, plainFilterList, range, id } = item;
        const commonData = this.state.commonData;
        commonData.push({
            name: filterName,
            value: filterName,
            data,
            plainFilterList,
            range,
            id
        });
        this.setState({
            stopListenCommonData: true,//修改过常用筛选后，不在从外部接收新的数据todo
            commonData,
            collapsedCommon: false
        });
    }
    //获取清空所有选中项后的高级选项的数据
    getClearSelectedAdvancedData(){
        return _.map(this.state.rawAdvancedData, item => {
            let data = _.map(item.data, x => {
                return {...x, selected: false};
            });
            return {...item, data};
        });
    }
    handleClearAll() {
        let advancedData = this.getClearSelectedAdvancedData();
        this.setState({
            advancedData,
            selectedCommonIndex: ''
        }, () => {
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, []);
            this.props.onFilterChange(this.processSelectedFilters(advancedData));
        });
    }
    // 清空选中的常用筛选项, param中没有field时,params为event对象，params.field：指定的要清空的选中的常用筛选项
    handleClearCommonSelected = (param) => {
        let field = _.get(param, 'field');
        //如果有传入的指定清空的常用筛选项
        if (field) {
            // 判断该选项是否被选中，选中了清空，未选中不做处理
            let fieldIndex = _.findIndex(this.state.commonData, (item) => item.value === field);
            if (fieldIndex === this.state.selectedCommonIndex) {
                this.setState({
                    selectedCommonIndex: ''
                }); 
                const filterList = this.processSelectedFilters(this.state.advancedData);
                //发送选择筛选项事件
                filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
                this.props.onFilterChange(filterList);
            }
        } else {
            // 清空选中的常用筛选项
            this.setState({
                selectedCommonIndex: ''
            });
            const filterList = this.processSelectedFilters(this.state.advancedData);
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
            this.props.onFilterChange(filterList);
        }
    }
    clearSelect(groupName) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.clear-btn'), `清空"${groupName}"筛选条件`);
        const advancedData = $.extend(true, [], this.state.advancedData);
        let clearGroupItem = advancedData.find(x => x.groupName === groupName);
        let { selectedCommonIndex } = this.state;
        if (_.get(clearGroupItem, 'data.length')) {
            clearGroupItem.data.forEach(x => {
                x.selected = false;
            });
        }

        if ((this.state.selectedCommonIndex || this.state.selectedCommonIndex === 0) &&
            _.get(this.state, ['commonData', this.state.selectedCommonIndex, 'data', 'length'])
        ) {
            //已选中的常用筛选中包含高级筛选时，直接清空常用筛选
            if (this.isContainAdvanced(this.state.commonData[this.state.selectedCommonIndex].data)) {
                selectedCommonIndex = '';
                this.setState({
                    selectedCommonIndex,
                    advancedData
                }, () => {
                    const filterList = this.processSelectedFilters(this.state.advancedData);
                    //发送选择筛选项事件
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
                    this.props.onFilterChange(filterList);
                });
            }
            //否则对外、对search提供两者union 
            else {
                this.setState({
                    advancedData
                }, () => {
                    //选择的常用筛选中不包含高级筛选项, 对外和search提供两者的union        
                    const allSelectedFilterData = this.unionFilterList(this.state.commonData[this.state.selectedCommonIndex].data, this.state.advancedData);
                    //发送选择筛选项事件
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, allSelectedFilterData);
                    this.props.onFilterChange(allSelectedFilterData);
                });
            }
        } else {
            this.setState({
                advancedData
            }, () => {
                const filterList = this.processSelectedFilters(this.state.advancedData);
                //发送选择筛选项事件
                filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
                this.props.onFilterChange(filterList);
            });
        }

    }
    shareCommonItem(item) {

    }
    delCommonItem(item, index) {
        let commonData = this.state.commonData;
        this.handleShowPop('click', false);
        if (item.id) {
            if (this.props.onDelete) {
                this.props.onDelete(item).then((result) => {
                    //若返回结果中有data属性，则取data属性的值作为数据源，否则将返回结果作为数据源
                    const data = _.get(result, 'data', result);

                    if (!data || data.errorMsg) {
                        message.error(Intl.get('crm.139', '删除失败'));
                    } else {
                        commonData = commonData.filter(x => x.id !== item.id);
                        this.setState({
                            commonData,
                            //当删除选中的筛选项时，去除选中状态
                            selectedCommonIndex: this.state.selectedCommonIndex === index ? '' : this.state.selectedCommonIndex
                        });                        
                    }
                }).catch(err => {
                    message.error((err && err.message) || Intl.get('crm.139', '删除失败'));
                });
            }
        } else {
            commonData = commonData.filter(x => x.name !== item.name);
            this.setState({
                commonData,
                selectedCommonIndex: this.state.selectedCommonIndex === index ? '' : this.state.selectedCommonIndex
            });            
        }

    }
    showCommonItemModal(commonItem) {

    }
    //根据点击次数对commonData进行排序
    sortByClickNum(commonData) {
        const clickNumList = local.get(FILTER_COMMON_RATE_KEY) || Array.from({ length: commonData.length }, x => 0);
        const sortedCommonData = commonData.map((item, index) => {
            return {
                clickNum: clickNumList[index],
                ...item
            };
        });
        return _.sortBy(sortedCommonData, item => -item.clickNum);
    }
    //记录当前索引项的点击次数 key是localstorage中存贮所需的key
    handleClickRecord(key, item) {
        //点击项在原始数据中的索引
        let rawIndex = '';
        this.state.rawCommonData.forEach((x, index) => {
            if (x.name === item.name) {
                rawIndex = index;
            }
        });
        const clickNumList = local.get(key) || Array.from({ length: this.state.rawCommonData.length }, x => 0);
        ++clickNumList[rawIndex];
        local.set(key, clickNumList);
    }
    //将已选中的高级筛选项合并到原筛选项中
    mergeAdvancedData(filterList) {
        const advancedData = $.extend(true, [], this.state.rawAdvancedData);
        advancedData.forEach(oldGroup => {
            if (oldGroup.data && oldGroup.data.length) {
                oldGroup.data = oldGroup.data.map(x => {
                    x.selected = false;
                    let changedItem = null;
                    const changedGroup = filterList.find(item => item.groupId === oldGroup.groupId);
                    if (_.get(changedGroup, 'data.length')) {
                        changedItem = changedGroup.data.find(filter => filter.value === x.value);
                        if (changedItem) {
                            x.selected = changedItem.selected;
                        }
                    }
                    return x;
                });
            }
        });
        return advancedData;
    }
    // 过滤出选中状态的筛选项,对外提供的结构
    processSelectedFilters(rawfilterList) {
        let filterList = $.extend(true, [], rawfilterList);
        // filterList = this.filterSelectedGroup(filterList);
        filterList.forEach(group => {
            if (_.get(group, 'data.length') > 0) {
                group.data = group.data.filter(x => x.selected);
            }
        });
        return filterList;
    }
    //整合常用筛选和高级筛选的筛选项, isMix为true时，将commonData中的高级筛选项从advancedData中剔除
    unionFilterList(commonData, advancedData, isMix) {
        //将原筛选项与常用筛选项中包含的高级筛选项合并
        const newCommonData = commonData.map(x => ({
            ...advancedData.find(oldItem => oldItem.groupId === x.groupId),
            ...x
        }));
        if (isMix) {
            const commonGroupIds = _.uniq(commonData.map(x => x.groupId));
            const filterList = advancedData.filter(group => !_.includes(commonGroupIds, group.groupId));
            return newCommonData.concat(this.processSelectedFilters(filterList));
        } else {
            return newCommonData.concat(this.processSelectedFilters(advancedData));
        }
    }
    //过滤出选中状态的组
    filterSelectedGroup(filterList) {
        let data = $.extend([], filterList);
        data = data.filter(groupItem => {
            return _.get(groupItem, 'data.length');
        });
        return data;
    }
    //判断Filterlist中是否包含高级筛选项组
    isContainAdvanced(data) {
        const filterList = this.processSelectedFilters(data);
        return _.difference(this.state.advancedData.map(x => x.groupId), filterList.map(x => x.groupId)).length < this.state.advancedData.length;
    }
    //向search发送修改筛选条件的请求
    handleChangePermitted = ({ type, data, index }) => {
        let filterList = [];
        let allSelectedFilterData = [];//所有选中的筛选项，包含高级筛选项和常用筛选项
        const selectedCommonItem = this.state.commonData[this.state.selectedCommonIndex];
        let hasAdvanceGroup = false;
        let handleCommon = null;
        switch (type) {
            case 'common':
                filterList = this.processSelectedFilters(data.data);
                handleCommon = () => {
                    //选择的常用筛选中包含高级筛选项
                    if (this.isContainAdvanced(data.data)) {
                        allSelectedFilterData = this.unionFilterList(data.data, this.state.advancedData, true);
                        this.setState({
                            selectedCommonIndex: index,
                            advancedData: this.mergeAdvancedData(filterList)
                        }, () => {
                            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, allSelectedFilterData);
                            this.props.onFilterChange(allSelectedFilterData);
                        });
                    } else {
                        //选择的常用筛选中不包含高级筛选项, 对外和search提供两者的union        
                        allSelectedFilterData = this.unionFilterList(data.data, this.state.advancedData);
                        this.setState({
                            selectedCommonIndex: index,//todo此处不清空advancedData，可以和高级筛选项同时选中
                            // advancedData: this.state.rawAdvancedData
                        }, () => {
                            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, allSelectedFilterData);
                        });
                        this.props.onFilterChange(allSelectedFilterData);
                    }
                };
                //已有选择的常用筛选，清空之前选择的常用筛选中的高级筛选
                if (this.state.selectedCommonIndex) {
                    this.setState({
                        advancedData: this.getClearSelectedAdvancedData()
                    }, () => {
                        handleCommon();
                    });
                } else {
                    handleCommon();
                }
                //todo 没有filterList 的场景处理
                break;
            case 'advanced':
                filterList = this.processSelectedFilters(data);
                if (selectedCommonItem && _.get(selectedCommonItem, 'data.length')) {
                    hasAdvanceGroup = this.isContainAdvanced(selectedCommonItem.data);
                }
                //已选择的常用筛选中不包含高级筛选项，保留已选择的常用筛选，对外提供两者的union,对search提供两者的union
                if (!hasAdvanceGroup) {
                    this.setState({
                        advancedData: data
                    });
                    let list = [];
                    if (selectedCommonItem) {
                        list = this.unionFilterList(selectedCommonItem.data, filterList);
                    }
                    else {
                        list = filterList;
                    }
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, list);
                    this.props.onFilterChange(list);
                }
                //已选择的常用筛选包含高级筛选项, 清空已选择的常用筛选,去除常用筛选中选中的高级筛选,对外提供advancedData,对search提供advancedData
                else {
                    this.setState({
                        selectedCommonIndex: '',
                        advancedData: data
                    });
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
                    this.props.onFilterChange(filterList);
                }
                break;
        }
    }

    handleCommonItemClick(item, index, flag) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.common-item-content'), `选择"${item.name}"筛选条件`);
        //存在选中的客户时，切换筛选条件需要先提示，确认后再修改筛选条件
        let selectedIndex = this.state.selectedCommonIndex;
        let newSelectIndex = index;
        let dataItem = $.extend(true, {}, item);
        //已经选中该项，不进行处理,
        if (selectedIndex === index && !flag) {
            return;
        }
        //记录当前索引项的点击次数
        this.handleClickRecord(FILTER_COMMON_RATE_KEY, item);
        if (this.props.showSelectTip) {
            filterEmitter.emit(filterEmitter.ASK_FOR_CHANGE, {
                type: 'common',
                data: dataItem,
                index: newSelectIndex
            });
            return;
        } else {
            this.handleChangePermitted({
                type: 'common',
                data: dataItem,
                index: newSelectIndex
            });
        }
    }

    handleAdvanedItemClick(groupItem, item) {
        const { groupName, singleSelect = false } = groupItem;
        if (_.get(item, 'selected')){
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.titlecut'), `去掉"${groupName}"的一个筛选条件`);
        }else{
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.titlecut'), `增加"${groupName}"的一个筛选条件`);
        }
        const advancedData = $.extend(true, [], this.state.advancedData);
        const selectedCommonItem = this.state.commonData[this.state.selectedCommonIndex];
        const selectedGroupItem = advancedData.find(group => group.groupId === groupItem.groupId);
        let selectedItem = null;
        let hasAdvanceGroup = false;
        if (selectedCommonItem && _.get(selectedCommonItem, 'data.length')) {
            hasAdvanceGroup = this.isContainAdvanced(selectedCommonItem.data);
        }
        //已选中的常用选项包含高级筛选项，去除之前选中的常用筛选和高级筛选
        if (hasAdvanceGroup) {
            selectedCommonItem.data.forEach(item => {
                let group = advancedData.find(x => x.groupName === item.groupName);
                if (group) {
                    group.data = group.data.map(oldGroup => {
                        oldGroup.selected = false;
                        return oldGroup;
                    });
                }
            });
        }

        if (selectedGroupItem.data && selectedGroupItem.data.length) {
            let selectOnlyItem = selectedGroupItem.data.find(x => x.selectOnly);
            selectedItem = selectedGroupItem.data.find(x => x.value === item.value);
            //单选或不能与其它选项同时选中时，清空本组其他选中状态
            if (singleSelect || item.selectOnly) {
                selectedGroupItem.data = selectedGroupItem.data.map(x => {
                    if (x.value !== selectedItem.value) {
                        x.selected = false;
                    }
                    return x;
                });
            }
            //已选中的选项是singleSelect,则取消选中 
            else if (_.get(selectOnlyItem, 'selected')) {
                selectOnlyItem.selected = false;
            }
            if (selectedItem) {
                selectedItem.selected = !selectedItem.selected;
            }

            this.setState({
                advancedData
            });
        }

        //存在选中的客户时，切换筛选条件需要先提示，确认后再修改筛选条件
        if (this.props.showSelectTip) {
            filterEmitter.emit(filterEmitter.ASK_FOR_CHANGE, {
                type: 'advanced',
                data: advancedData,
            });
            return;
        } else {
            this.handleChangePermitted({
                type: 'advanced',
                data: advancedData
            });
        }
    }
    handleShowPop(type, visible) {
        let showHoverPop = this.state.showHoverPop;
        let showClickPop = this.state.showClickPop;
        switch (type) {
            case 'hover':
                showHoverPop = visible;
                break;
            case 'click':
                showClickPop = visible;
                break;
        }
        this.setState({
            showHoverPop,
            showClickPop
        });
    }
    handleSelectChange(groupItem, values) {
        //找到此次选择的筛选项
        let curSelectedItem = _.find(groupItem.data, item => !item.selected && values.indexOf(item.value) !== -1);
        if (curSelectedItem) {
            this.handleAdvanedItemClick(groupItem, curSelectedItem);
        } else {
            // 找到此次取消选择的筛选项
            let curDeSelectedItem = _.find(groupItem.data, item => item.selected && values.indexOf(item.value) === -1);
            this.handleAdvanedItemClick(groupItem, curDeSelectedItem);
        }
    }
    //筛选项超8条后，用可搜索的下拉框展示
    renderGroupItemSelect(groupItem) {
        let selectItems = _.filter(groupItem.data, item => item.selected);
        let selectValues = _.map(selectItems, 'value');
        return (
            <div className="filter-select-container" id={`${groupItem.groupId}_select_container`}>
                <AntcSelect
                    className="filter-select"
                    mode="multiple"
                    placeholder={Intl.get('crm.filter.select.placeholder', '请选择要筛选的{groupName}', { groupName: groupItem.groupName })}
                    value={selectValues}
                    onChange={this.handleSelectChange.bind(this, groupItem)}
                    optionFilterProp="children"
                    getPopupContainer={() => document.getElementById(`${groupItem.groupId}_select_container`)}
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    {_.map(groupItem.data, (item, index) => {
                        return (<Option key={index} value={item.value}>{item.name}</Option>);
                    })}
                </AntcSelect>
            </div>
        );
    }
    closeFilterPanel = () => {
        this.props.toggleList();
    }

    render() {
        const { commonLoading, advancedLoading, commonData, advancedData } = this.props;
        const isGroupSelected = groupItem => {
            let flag = false;
            if (!_.get(groupItem, 'data.length')) {
                return flag;
            }
            groupItem.data.forEach(x => {
                if (x.selected) {
                    flag = true;
                    return;
                }
            });
            return flag;
        };
        var noCommonStatus = !this.state.commonData || this.state.commonData.length === 0;
        var commonStatusCls = noCommonStatus ? ' no-content' : '';
        let styleList = this.props.style;
        let {isWebMin} = isResponsiveDisplay();
        //减掉‘收起筛选’的高度
        if(_.get(styleList,'height')){
            styleList.height = styleList.height - (isWebMin ? oplateConsts.LAYOUT.BOTTOM_NAV : CLOSE_COMMENT_HEIGHT);
        }

        return (
            <div>
                {isWebMin ? null : (
                    <div className="close-filter-panel" onClick={this.closeFilterPanel}>
                        <span className="filter-panel-arrow">
                                &lt;
                        </span>
                        {Intl.get('clue.customer.close.filter.panel', '收起筛选')}
                    </div>
                )}
                <GeminiScrollbar style={styleList} className={this.props.className}>
                    <div className="filter-wrapper filter-list-wrapper">
                        {_.isFunction(this.props.renderOtherDataContent) ? this.props.renderOtherDataContent() : null}
                        <StatusWrapper
                            loading={commonLoading}
                            errorMsg={this.props.commonErrorMsg}
                            size="small"
                            className={commonStatusCls}
                        >
                            {noCommonStatus ?
                                null :
                                <div className="common-container">
                                    {/* icon-common-filter */}
                                    <h4 className="title">
                                        {Intl.get('common.filter.common', '常用筛选')}
                                        {this.state.selectedCommonIndex || this.state.selectedCommonIndex === 0 ? (
                                            <span className="clear-btn" onClick={this.handleClearCommonSelected}>{Intl.get('lead.filter.clear.time.range', '清空')}</span>
                                        ) : null }
                                    </h4>
                                    {/* todo 用props.commonData */}
                                    <ul>
                                        {
                                            this.state.commonData.map((x, index) => {
                                                //当前索引小于预设展示数量，或面板为展开时，显示item
                                                const showItem = (index < this.props.showCommonListLength) || !this.state.collapsedCommon;
                                                const getHoverContent = filterList => (
                                                    <ul className="filter-list-container">
                                                        {
                                                            filterList.map((filter, idx) => {
                                                                return (
                                                                    <li key={idx}>
                                                                        {filter.name}
                                                                    </li>
                                                                );
                                                            })
                                                        }
                                                    </ul>
                                                );
                                                const getClickContent = (item, index) => (
                                                    <ul className="btn-container">
                                                        <li onClick={this.delCommonItem.bind(this, item, index)}>{Intl.get('common.delete', '删除')}</li>
                                                    </ul>
                                                );
                                                const commonItemClass = classNames('titlecut', {
                                                    'hide': !showItem,
                                                    'active': index === this.state.selectedCommonIndex
                                                });
                                                //todo 没有多个高级筛选的常用筛选不展示popover
                                                if (x.plainFilterList && !x.readOnly) {
                                                    return (
                                                        //todo plainFilterList 根据接口数据统一结构
                                                        <Popover key={index} placement="bottom" content={getHoverContent(x.plainFilterList)} trigger="hover"
                                                            onVisibleChange={this.handleShowPop.bind(this, 'hover')}
                                                            // visible={this.state.showHoverPop && !this.state.showClickPop}
                                                        >
                                                            <li
                                                                className={commonItemClass}
                                                                key={index}
                                                            >
                                                                {/* //todo 鼠标经过左右滚动标题 */}
                                                                <span className="common-item-content" onClick={this.handleCommonItemClick.bind(this, x, index)}>{x.name}</span>
                                                                {
                                                                    x.readOnly ?
                                                                        null :
                                                                        <Popover placement="bottom" content={getClickContent(x, index)} trigger="click" onVisibleChange={this.handleShowPop.bind(this, 'click')}>
                                                                            <span className="btn" onClick={this.showCommonItemModal.bind(this, x)}>...</span>
                                                                        </Popover>
                                                                }
                                                            </li>
                                                        </Popover>);
                                                } else {
                                                    return (
                                                        <li
                                                            className={commonItemClass}
                                                            key={index}
                                                        >
                                                            <span title={x.name} className="common-item-content" onClick={this.handleCommonItemClick.bind(this, x, index)}>{x.name}</span>
                                                            {
                                                                x.readOnly ?
                                                                    null :
                                                                    <Popover placement="bottom" content={getClickContent(x)} trigger="click" onVisibleChange={this.handleShowPop.bind(this, 'click')}>
                                                                        <span className="btn" onClick={this.showCommonItemModal.bind(this, x)}>...</span>
                                                                    </Popover>
                                                            }
                                                        </li>
                                                    );
                                                }
                                            })
                                        }
                                        {
                                            commonData.length > this.props.showCommonListLength ?
                                                <li className="collapse-btn" onClick={this.toggleCollapse.bind(this, 'common')}>
                                                    {
                                                        this.state.collapsedCommon ?
                                                            <span>{Intl.get('crm.basic.more', '更多')}<i className="iconfont icon-tree-down-arrow"/></span> : 
                                                            <span>{Intl.get('crm.contact.way.hide', '收起')}<i className="iconfont icon-tree-up-arrow"/></span>
                                                    }
                                                </li> : null
                                        }
                                    </ul>
                                </div>
                            }
                        </StatusWrapper>
                        {
                            this.state.advancedData.length > 0 ?
                                <StatusWrapper
                                    loading={advancedLoading}
                                    errorMsg={this.props.advancedErrorMsg}
                                    size="small"
                                >
                                    <div className="advanced-container">
                                        {
                                            <div className="advanced-items-wrapper" data-tracename="高级筛选">
                                                {
                                                    this.state.advancedData.map((groupItem, index) => {
                                                        if (!groupItem.data || groupItem.data.length === 0) {
                                                            return null;
                                                        } else {
                                                            return (
                                                                <div key={index} className="group-container">
                                                                    <h4 className="title">
                                                                        {groupItem.groupName}
                                                                        {
                                                                            isGroupSelected(groupItem) ?
                                                                                <span
                                                                                    className="clear-btn"
                                                                                    onClick={this.clearSelect.bind(this, groupItem.groupName)}
                                                                                >
                                                                                    {Intl.get('lead.filter.clear.time.range', '清空')}
                                                                                </span> : null
                                                                        }
                                                                    </h4>
                                                                    {_.get(groupItem, 'data.length') > 8 ? this.renderGroupItemSelect(groupItem) : (
                                                                        <ul className="item-container">
                                                                            {_.map(groupItem.data, (x, idx) => {
                                                                                return (
                                                                                    <li
                                                                                        className={x.selected ? 'active titlecut' : 'titlecut'}
                                                                                        key={idx}
                                                                                        title={x.name}
                                                                                        onClick={this.handleAdvanedItemClick.bind(this, groupItem, x)}
                                                                                    >
                                                                                        {x.name}
                                                                                    </li>);
                                                                            })
                                                                            }
                                                                        </ul>)
                                                                    }
                                                                </div>
                                                            );
                                                        }
                                                    })
                                                }
                                            </div>
                                        }
                                    </div>
                                </StatusWrapper> : null
                        }
                    </div>
                </GeminiScrollbar>
                {isWebMin ? (
                    <div className="close-filter-panel mobile-close-filter-btn" onClick={this.closeFilterPanel}>
                        <span>{Intl.get('common.confirm', '确认')}</span>
                    </div>
                ) : null}
            </div>

        );
    }
}
FilterList.defaultProps = {
    commonData: [],
    advancedData: [],
    commonLoading: false,
    advancedLoading: false,
    showCommonListLength: 7,
    key: '',
    onFilterChange: function() { },
    renderOtherDataContent: function() {

    },
    hideAdvancedTitle: false,
    setDefaultSelectCommonFilter: function() {

    },
    hasSettedDefaultCommonSelect: false,
    toggleList: function() { },
};
/**
 * advancedData=[
 * {
 *      groupName: "",
 *      groupId: "",//可选
 *      singleSelect: [boolean]//可选，标识是否单选。默认多选
 *      data: [
 *          {
 *              name,
 *              value,
 *              selec
 *          }
 *      ]
 * }]
 * 
 * 
 * 
 * commonData = [
    {
        name: '',
        value: "",
        readOnly: [boolean],//标识是否能删除
        data: [//结构与advancedData.data相同

        ],
        plainFilterList: [
            //压平的advancedData
        ]
    }
] 
 */

FilterList.propTypes = {
    commonData: PropTypes.array,
    advancedData: PropTypes.array,
    commonLoading: PropTypes.bool,
    commonErrorMsg: PropTypes.string,
    advancedLoading: PropTypes.bool,
    advancedErrorMsg: PropTypes.string,
    showCommonListLength: PropTypes.bumber,
    key: PropTypes.string,
    onFilterChange: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    showSelectTip: PropTypes.bool,
    renderOtherDataContent: PropTypes.func,
    onDelete: PropTypes.func,
    hideAdvancedTitle: PropTypes.bool,
    setDefaultSelectCommonFilter: PropTypes.func,
    hasSettedDefaultCommonSelect: PropTypes.bool,
    toggleList: PropTypes.func,

};
export default FilterList;
