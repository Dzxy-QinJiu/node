import StatusWrapper from 'CMP_DIR/status-wrapper';
import { Alert, Icon, Popover, message } from 'antd';
var classNames = require('classnames');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import filterEmitter from './emitter';
class FilterList extends React.Component {
    constructor(props) {
        super();
        let collapsedAdvanced = true;
        if (!props.commonData.length) {
            collapsedAdvanced = false;
        }
        this.state = {
            commonData: props.commonData || [],//todo 在外部维护
            stopListenCommonData: false,//是否从外部接收新的commonData
            rawAdvancedData: props.advancedData || [],
            advancedData: $.extend(true, [], props.advancedData) || [],
            collapsedCommon: true,
            collapsedAdvanced,
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
        this.handleChangePermitted = this.handleChangePermitted.bind(this);
    }
    componentWillReceiveProps(newProps) {
        const { commonData, advancedData } = newProps;
        if (!this.state.stopListenCommonData && commonData && commonData.length && (JSON.stringify(commonData) !== JSON.stringify(this.state.commonData))) {
            this.setState({
                commonData
            });
        }
        if (advancedData && advancedData.length && (JSON.stringify(advancedData) !== JSON.stringify(this.state.rawAdvancedData))) {
            this.setState({
                rawAdvancedData: advancedData,
                advancedData
            });
        }
        //没有常用筛选时，展开高级筛选
        if (!newProps.commonData.length && !this.props.commonData.length) {
            this.setState({
                collapsedAdvanced: false
            });
        }

    }
    componentWillUnmount() {
        filterEmitter.removeListener(filterEmitter.CLEAR_FILTERS + this.props.key, this.handleClearAll);
        filterEmitter.removeListener(filterEmitter.ADD_COMMON + this.props.key, this.handleAddCommon);
        filterEmitter.removeListener(filterEmitter.CHANGE_PERMITTED + this.props.key, this.handleChangePermitted);
    }
    toggleCollapse(type) {
        switch (type) {
            case 'common':
                this.setState({
                    collapsedCommon: !this.state.collapsedCommon
                });
                break;
            case 'advanced':
                this.setState({
                    collapsedAdvanced: !this.state.collapsedAdvanced
                });
                break;
        }
    }
    handleAddCommon = (item) => {
        const { data, filterName, plainFilterList } = item;
        const commonData = this.state.commonData;
        if (commonData.find(x => x.name === filterName)) {
            message.error('常用筛选已存在');
            return;
        }
        commonData.push({
            name: filterName,
            value: filterName,
            data,
            plainFilterList
        });
        this.setState({
            stopListenCommonData: true,//修改过常用筛选后，不在从外部接收新的数据todo
            commonData,
            collapsedCommon: false
        });
    }
    handleClearAll() {
        this.setState({
            advancedData: this.state.rawAdvancedData,
            selectedCommonIndex: ''
        }, () => {
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, []);
            this.props.onFilterChange(this.processSelectedFilters(this.state.advancedData));
        });
    }
    clearSelect(groupName) {
        const advancedData = $.extend(true, [], this.state.advancedData);
        let clearGroupItem = advancedData.find(x => x.groupName === groupName);
        if (_.get(clearGroupItem, 'data.length')) {
            clearGroupItem.data.forEach(x => {
                x.selected = false;
            });
        }
        this.setState({
            advancedData
        }, () => {
            const filterList = this.processSelectedFilters(this.state.advancedData);
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
            this.props.onFilterChange(filterList);
        });
    }
    shareCommonItem(item) {

    }
    delCommonItem(item) {
        let commonData = this.state.commonData;
        commonData = commonData.filter(x => x.name !== item.name);
        this.setState({
            commonData
        });
    }
    showCommonItemModal(commonItem) {

    }
    //将已选中的高级筛选项合并到原筛选项中
    mergeAdvancedData(filterList) {
        const advancedData = $.extend(true, [], this.state.rawAdvancedData);
        advancedData.forEach(oldGroup => {
            if (oldGroup.data && oldGroup.data.length) {
                oldGroup.data = oldGroup.data.map(x => {
                    x.selected = false;
                    let changedItem = null;
                    const changedGroup = filterList.find(item => item.groupName === oldGroup.groupName);
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
        if (isMix) {
            const commonGroupNames = commonData.map(x => x.groupName);
            const filterList = advancedData.filter(group => !commonGroupNames.includes(group.groupName));
            return commonData.concat(this.processSelectedFilters(filterList));
        } else {
            return commonData.concat(this.processSelectedFilters(advancedData));
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
    //判断Filterlist中是否包含高级筛选项组 todo只包含高级筛选项
    isContainAdvanced(data) {
        const filterList = this.processSelectedFilters(data);
        return _.difference(this.state.advancedData.map(x => x.groupName), filterList.map(x => x.groupName)).length < this.state.advancedData.length;
    }
    //向search发送修改筛选条件的请求
    handleChangePermitted = ({ type, data, index }) => {
        let filterList = [];
        let allSelectedFilterData = [];//所有选中的筛选项，包含高级筛选项和常用筛选项
        const selectedCommonItem = this.state.commonData[this.state.selectedCommonIndex];
        let hasAdvanceGroup = false;
        switch (type) {
            case 'common':
                filterList = this.processSelectedFilters(data.data);
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
                        //todo why convert to array?
                        list = this.unionFilterList(selectedCommonItem.data, filterList);
                    }
                    else {
                        list = filterList;
                    }
                    filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, list);
                    this.props.onFilterChange(list);
                }
                //已选择的常用筛选包含高级筛选项, 清空已选择的常用筛选,对外提供advancedData,对search提供advancedData
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
    handleCommonItemClick(item, index) {
        //存在选中的客户时，切换筛选条件需要先提示，确认后再修改筛选条件
        let selectedIndex = this.state.selectedCommonIndex;
        let newSelectIndex = index;
        let dataItem = $.extend(true, {}, item);
        if (selectedIndex === index) {
            newSelectIndex = '';
            dataItem.data = [];
        }
        // if (item.data) {
        //     if (!Array.isArray(item.data)) {                
        //         //将原‘其它’中的选项伪装成高级筛选项的结构；方便出现在顶部筛选框中           
        //         dataItem.data = [item];
        //     }
        //     else {
        //         // dataItem = dataItem.data;
        //     }
        // }
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

    handleAdvanedItemClick(groupItem, item, outIndex, innerIdx) {
        const { groupName, singleSelect = false } = groupItem;
        const advancedData = $.extend(true, [], this.state.advancedData);
        const selectedGroupItem = advancedData.find((group, index) => index === outIndex);
        let selectedItem = null;
        if (selectedGroupItem.data && selectedGroupItem.data.length) {
            let selectOnlyItem = selectedGroupItem.data.find(x => x.selectOnly);
            selectedItem = selectedGroupItem.data.find((x, idx) => idx === innerIdx);
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
        return (
            <GeminiScrollbar style={this.props.style} className={this.props.className}>
                <div className="filter-wrapper filter-list-wrapper">
                    <StatusWrapper
                        loading={commonLoading}
                        errorMsg={this.props.commonErrorMsg}
                        size="small"
                    >
                        {!this.state.commonData || this.state.commonData.length === 0 ?
                            null :
                            <div className="common-container">
                                {/* icon-common-filter */}
                                <h4 className="title">常用筛选</h4>
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
                                            const getClickContent = item => (
                                                <ul className="btn-container">
                                                    <li onClick={this.delCommonItem.bind(this, item)}>删除</li>
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
                                                                    <Popover placement="bottom" content={getClickContent(x)} trigger="click" onVisibleChange={this.handleShowPop.bind(this, 'click')}>
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
                                                        '更多' : '收起'
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
                                    <h4 className="title">
                                        {/* todo icon-advanced-filter */}
                                        <p className="">高级筛选</p>
                                        <Icon
                                            type={this.state.collapsedAdvanced ? 'down' : 'up'}
                                            onClick={this.toggleCollapse.bind(this, 'advanced')}
                                        />
                                    </h4>
                                    {
                                        !this.state.collapsedAdvanced ?
                                            <div className="advanced-items-wrapper">
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
                                                                                    清空
                                                                                </span> : null
                                                                        }
                                                                    </h4>
                                                                    <ul className="item-container">
                                                                        {
                                                                            groupItem.data.map((x, idx) => {
                                                                                return (
                                                                                    <li
                                                                                        className={x.selected ? 'active titlecut' : 'titlecut'}
                                                                                        key={idx}
                                                                                        onClick={this.handleAdvanedItemClick.bind(this, groupItem, x, index, idx)}
                                                                                    >
                                                                                        {x.name}
                                                                                    </li>
                                                                                );
                                                                            })
                                                                        }
                                                                    </ul>
                                                                </div>
                                                            );
                                                        }
                                                    })
                                                }
                                            </div> : null
                                    }
                                </div>
                            </StatusWrapper> : null
                    }
                </div>
            </GeminiScrollbar>
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
    onFilterChange: function() { }
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
    commonData: 'array',
    advancedData: 'array',
    commonLoading: 'boolean',
    commonErrorMsg: 'string',
    advancedLoading: 'boolean',
    advancedErrorMsg: 'string',
    showCommonListLength: 'bumber',
    key: 'string',
    onFilterChange: 'function',
    style: 'object',
    className: 'string',
    showSelectTip: 'boolean'
};
export default FilterList;