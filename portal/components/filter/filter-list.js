import StatusWrapper from 'CMP_DIR/status-wrapper';
import { Alert, Icon, Popover } from 'antd';
var classNames = require('classnames');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import filterEmitter from './emitter';
class FilterList extends React.Component {
    constructor(props) {
        super();
        this.state = {
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
    handleClearAll() {
        this.setState({
            selectedAdvancedMap: {},
            selectedCommonIndex: ''
        }, () => {
            //发送选择筛选项事件
            filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, []);
            this.props.onFilterChange([]);
        });
    }
    clearSelect(groupName) {
        this.setState({
            selectedAdvancedMap: $.extend({}, this.state.selectedAdvancedMap, {
                [groupName]: {}
            })
        });
        const filterList = this.processSelectedFilters(this.state.selectedAdvancedMap);
        //发送选择筛选项事件
        filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, this.processSelectedFilters(this.state.selectedAdvancedMap, true));
        this.props.onFilterChange(filterList);
    }
    shareCommonItem(item) {

    }
    delCommonItem(item) {

    }
    showCommonItemModal(commonItem) {

    }
    handleCommonItemClick(item, index) {
        this.setState({
            selectedCommonIndex: index,
            selectedAdvancedMap: {}
        });
        filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, item.filterList);
        this.props.onFilterChange(item.filterList);
    }
    processSelectedFilters(selectedAdvancedMap, isSub) {
        const filterList = [];
        _.forEach(selectedAdvancedMap, (groupData, groupName) => {
            if (groupData) {
                const data = [];
                _.forEach(groupData, (groupItem, key) => {
                    data.push(groupItem);
                });
                const oldItem = this.props.advancedData.find(x => x.groupName === groupName) || {};
                const groupItem = $.extend({}, oldItem, {
                    groupName,
                    data: data.filter(x => x)
                });                
                filterList.push(groupItem);
            }
        });
        if (isSub) {
            const list = [];
            filterList.forEach(x => {
                if (x.data) {
                    x.data.forEach(item => {
                        if (item) {
                            list.push(item);
                        }
                    });
                }
            });
            return list;
        }
        return filterList;
    }   
    handleAdvanedItemClick(groupItem, item, idx) {
        const {groupName, singleSelect = false} = groupItem;
        const map = this.state.selectedAdvancedMap;
        if (!map[groupName]) {
            map[groupName] = {};
        }       
        if (!map[groupName][idx]) {
            if (singleSelect) {
                map[groupName] = {};
            }
            map[groupName][idx] = item;
        } else {
            map[groupName][idx] = false;
        }
        this.setState({
            selectedCommonIndex: '',
            selectedAdvancedMap: map
        });
        const filterList = this.processSelectedFilters(map);
        filterEmitter.emit(filterEmitter.SELECT_FILTERS + this.props.key, this.processSelectedFilters(map, true));
        this.props.onFilterChange(filterList);
    }
    handleShowPop(type, visible) {
        let showHoverPop = this.state.showHoverPop;
        switch (type) {
            case 'hover':
                showHoverPop = visible;
                break;
            case 'click':
                showClickPop = visible;
                break;
        }
        this.setState({
            showHoverPop
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
                            {!commonData || commonData.length === 0 ?
                                <div className="alert-container">
                                    <Alert type="info" message="暂无常用筛选" showIcon/>
                                </div> :
                                <ul>
                                    {
                                        commonData.map((x, index) => {
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
                                                <Popover key={index} placement="bottom" content={getHoverContent(x.filterList)} trigger="hover"
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
                        this.props.advancedData.length > 0 ?
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
                                                    advancedData.map((groupItem, index) => {
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
                                                                                        className={_.get(this.state.selectedAdvancedMap, [groupItem.groupName, idx]) ? 'active titlecut' : 'titlecut'}
                                                                                        key={idx}
                                                                                        onClick={this.handleAdvanedItemClick.bind(this, groupItem, x, idx)}
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
    onFilterChange: function() {}
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