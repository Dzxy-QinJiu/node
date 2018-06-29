import StatusWrapper from 'CMP_DIR/status-wrapper';
import { Alert, Icon, Popover } from 'antd';
var classNames = require('classnames');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import filterEmitter from './emitter';
class FilterList extends React.Component {
    constructor(props) {
        super();
        this.state = {
            commonData: props.commonData || [],//todo 在外部维护
            rawAdvancedData: props.advancedData || [],
            advancedData: $.extend(true, [], props.advancedData) || [],
            collapsedCommon: true,
            collapsedAdvanced: true,
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
    }
    componentWillUnmount() {
        filterEmitter.removeListener(filterEmitter.CLEAR_FILTERS + this.props.key, this.handleClearAll);
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
        const { filterList, filterName, plainFilterList } = item;
        const commonData = this.state.commonData;
        commonData.push({
            name: filterName,
            value: filterName,
            filterList,
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
        const advancedData = this.state.advancedData;
        let clearGroupItem = advancedData.find(x => x.groupName === groupName);
        if (clearGroupItem) {
            clearGroupItem = this.state.rawAdvancedData.find(x => x.groupName === groupName);
        }
        this.setState({
            advancedData: advancedData
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
    handleCommonItemClick(item, index) {
        this.setState({
            selectedCommonIndex: index,
            advancedData: this.mergeAdvancedData(item.filterList)
        }, () => {
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, this.processSelectedFilters(this.state.advancedData));
            this.props.onFilterChange(this.processSelectedFilters(this.state.advancedData));
        });
        
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
    handleAdvanedItemClick(groupItem, item, outIndex, innerIdx) {
        const { groupName, singleSelect = false } = groupItem;
        const advancedData = $.extend(true, [], this.state.advancedData);
        const selectedGroupItem = advancedData.find((group, index) => index === outIndex);
        let selectedItem = null;
        if (selectedGroupItem.data && selectedGroupItem.data.length) {
            selectedItem = selectedGroupItem.data.find((x, idx) => idx === innerIdx);
        }
        if (selectedItem) {
            selectedItem.selected = !selectedItem.selected;
        }
        this.setState({
            selectedCommonIndex: '',
            advancedData
        });
        const filterList = this.processSelectedFilters(advancedData);
        filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, filterList);
        this.props.onFilterChange(filterList);
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
        const isGroupSelected = groupName => {
            if (!this.state.selectedAdvancedMap[groupName]) {
                return false;
            } else {
                let flag = false;
                _.forEach(this.state.selectedAdvancedMap[groupName], (value, key) => {
                    if (value) {
                        flag = true;
                    }
                });
                return flag;
            }
        };
        return (
            <GeminiScrollbar style={this.props.style} className={this.props.className}>
                <div className="filter-wrapper filter-list-wrapper">
                    <StatusWrapper
                        loading={commonLoading}
                        errorMsg={this.props.commonErrorMsg}
                        size="small"
                    >
                        <div className="common-container">
                            <h4 className="title icon-common-filter">常用筛选</h4>
                            {/* todo 用props.commonData */}
                            {!this.state.commonData || this.state.commonData.length === 0 ?
                                <div className="alert-container">
                                    <Alert type="info" message="暂无常用筛选" showIcon />
                                </div> :
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
                                                    <li onClick={this.shareCommonItem.bind(this, item)}>分享</li>
                                                    <li onClick={this.delCommonItem.bind(this, item)}>删除</li>
                                                </ul>
                                            );
                                            const commonItemClass = classNames('titlecut', {
                                                'hide': !showItem,
                                                'active': index === this.state.selectedCommonIndex
                                            });
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
                                                        <span title={x.name} className="common-item-content" onClick={this.handleCommonItemClick.bind(this, x, index)}>{x.name}</span>
                                                        <Popover placement="bottom" content={getClickContent(x)} trigger="click" onVisibleChange={this.handleShowPop.bind(this, 'click')}>
                                                            <span className="btn" onClick={this.showCommonItemModal.bind(this, x)}>...</span>
                                                        </Popover>
                                                    </li>
                                                </Popover>);
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
                            }
                        </div>
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
                                        <p className="icon-advanced-filter">高级筛选</p>
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
                                                                            isGroupSelected(groupItem.groupName) ?
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
    className: 'string'
};
export default FilterList;