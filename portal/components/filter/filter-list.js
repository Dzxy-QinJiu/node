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
    }
    componentWillReceiveProps(newProps) {
        const { commonData, advancedData } = newProps;
        if (commonData && commonData.length && (JSON.stringify(commonData) !== JSON.stringify(this.state.commonData))) {
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
            commonData
        });
    }
    handleClearAll() {
        this.setState({
            advancedData: this.state.rawAdvancedData,
            selectedCommonIndex: ''
        }, () => {
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, []);
            this.props.onFilterChange([]);
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
    processSelectedFilters(rawfilterList) {
        const filterList = $.extend(true, [], rawfilterList);
        filterList.forEach(group => {
            if (_.get(group, 'data.length') > 0) {
                group.data = group.data.filter(x => x.selected);
            }
        });
        return filterList;
    }
    handleChangePermitted = ({ type, data, index }) => {
        const filterList = this.processSelectedFilters(data);
        switch (type) {
            case 'common':
                //当常用筛选项所属组在高级筛选项中能找到，就修改已选中的高级筛选项组
                if (this.state.advancedData.find(item => item.groupName === data.groupName)) {
                    this.setState({
                        selectedCommonIndex: index,
                        advancedData: this.mergeAdvancedData(data.filterList)
                    }, () => {
                        filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, this.processSelectedFilters(this.state.advancedData));                        
                    });
                    this.props.onFilterChange(this.processSelectedFilters(this.state.advancedData));
                } else {//否则直接发送常用筛选项的选中值
                    this.setState({
                        selectedCommonIndex: index,
                    });
                    this.props.onFilterChange([data]);
                }                
                //todo 没有filterList 的场景处理          
                break;
            case 'advanced':
                this.setState({
                    selectedCommonIndex: '',
                    advancedData: data
                });
                filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
                this.props.onFilterChange(filterList);
                break;
        }
    }
    handleCommonItemClick(item, index) {
        //存在选中的客户时，切换筛选条件需要先提示，确认后再修改筛选条件
        let selectedIndex = this.state.selectedCommonIndex;
        let newSelectIndex = index;
        let dataItem = item;
        if (selectedIndex === index) {
            newSelectIndex = '';
            dataItem.data = [];
        }
        if (this.props.showSelectTip) {
            filterEmitter.emit(filterEmitter.ASK_FOR_CHANGE, {
                type: 'common',
                data: dataItem,
                index: newSelectIndex
            });
            return;
        }
        this.handleChangePermitted({
            type: 'common',
            data: dataItem,
            index: newSelectIndex
        });
    }
    handleAdvanedItemClick(groupItem, item, outIndex, innerIdx) {
        const { groupName, singleSelect = false } = groupItem;
        const advancedData = $.extend(true, [], this.state.advancedData);
        const selectedGroupItem = advancedData.find((group, index) => index === outIndex);
        let selectedItem = null;
        if (selectedGroupItem.data && selectedGroupItem.data.length) {
            selectedItem = selectedGroupItem.data.find((x, idx) => idx === innerIdx);
            //单选或不能与其它选项同时选中时，清空本组其他选中状态
            if (singleSelect || item.selectOnly) {
                selectedGroupItem.data = selectedGroupItem.data.map(x => {
                    x.selected = false;
                    return x;
                });
            }
            if (selectedItem) {
                selectedItem.selected = !selectedItem.selected;

            }
        }

        //存在选中的客户时，切换筛选条件需要先提示，确认后再修改筛选条件
        if (this.props.showSelectTip) {
            filterEmitter.emit(filterEmitter.ASK_FOR_CHANGE, {
                type: 'advanced',
                data: advancedData,
            });
            return;
        }
        this.handleChangePermitted({
            type: 'advanced',
            data: advancedData
        });
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
                                            if (x.plainFilterList) {
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
                                                                    <span className="btn">...</span> :
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
                                                                <span className="btn">...</span> :
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