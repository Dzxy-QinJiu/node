import filterEmitter from './emitter';
import { Icon, Input, Button, Radio, Popover, Alert, message } from 'antd';
import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import{FILTER_RANGE_OPTIONS as RANGE_OPTIONS, FILTER_RANGE} from 'PUB_DIR/sources/utils/consts';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';

class FilterSearch extends React.Component {
    constructor(props) {
        super();
        this.state = {
            selectedFilterList: [],
            filterName: '',
            showAddZone: false,
            selectedRange: FILTER_RANGE.USER.value,
            showConfirmPop: false,
            changeRequestData: null,
        };
    }
    componentDidMount() {
        filterEmitter.on(filterEmitter.SELECT_FILTERS + this.props.key, this.onSelectFilters);
        filterEmitter.on(filterEmitter.ASK_FOR_CHANGE + this.props.key, this.handleChangeRequest);
    }
    changeCollapseClass() { //当筛选框内元素变化时，class的变化
        const collapse = $('.show-zone .collapse').get(0);
        let targetClass = 'collapse';
        if(collapse && collapse.childNodes && collapse.childNodes.length > 0){
            let collapseChildrenLen = 0;
            _.each(collapse.childNodes, ele => {
                if(ele.tagName === 'LI'){
                    collapseChildrenLen += ele.offsetWidth + 6;
                }
            });
            if(collapseChildrenLen >= 205){
                targetClass += ' collapse-ul';
            }
        }
        return targetClass;
    }
    componentWillUnmount() {
        filterEmitter.removeListener(filterEmitter.SELECT_FILTERS + this.props.key, this.onSelectFilters);
        filterEmitter.removeListener(filterEmitter.ASK_FOR_CHANGE + this.props.key, this.handleChangeRequest);
    }
    //将请求修改筛选的数据保存,方便确认修改后再发送回去
    handleChangeRequest = (data) => {
        this.setState({
            changeRequestData: data,
            showConfirmPop: true
        });
    }
    onSelectFilters = data => {
        const list = [];
        data.forEach(item => {
            item.data.forEach(x => {
                if (x) {
                    if (item.groupId) {
                        x.groupId = item.groupId;
                    }
                    x.groupName = item.groupName;
                    list.push(x);
                }
            });
        });
        this.setState({
            selectedFilterList: data,
            plainFilterList: list,
            filterName: list.map(x => x.name).join('+')
        });
    }
    showAddZone(isShow) {
        this.setState({
            showAddZone: isShow
        });
    }
    handleConfirmEdit() {
        this.showAddZone(false);
        this.showConfirmPop(false);
        if (this.props.showSelectChangeTip) {
            if (this.state.changeRequestData) {
                filterEmitter.emit(filterEmitter.CHANGE_PERMITTED, this.state.changeRequestData);
                //确认修改后，清空之前请求修改的数据，防止点击全部清空时发送事件
                this.setState({
                    changeRequestData: null
                });
            } else {
                filterEmitter.emit(filterEmitter.CLEAR_FILTERS);
            }

        }
        // filterEmitter.emit(filterEmitter.CLEAR_FILTERS + this.props.key);
    }
    handleNameChange(e) {
        const value = _.trim(e.target.value);
        this.setState({
            filterName: value
        });
    }
    handleRangeChange(e) {
        const value = e.target.value;
        this.setState({
            selectedRange: value
        });
    }
    showConfirmPop(isShow) {
        this.setState({
            showConfirmPop: isShow
        });
    }
    handleClearAll(e) {
        if (this.props.showSelectChangeTip) {
            this.showConfirmPop(true);
        } else {
            Trace.traceEvent(e, '清空筛选条件');
            filterEmitter.emit(filterEmitter.CLEAR_FILTERS);
        }
    }
    handleToggle() {
        this.props.toggleList();
    }
    handleSubmit(e) {
        if (this.props.submitting) {
            return;
        }
        Trace.traceEvent(e, '保存为常用筛选');        
        //todo remove add emitter
        this.setState({
            showAddZone: false
        });
        if (this.props.onSubmit) {
            this.props.onSubmit({
                filterName: this.state.filterName,
                range: this.state.selectedRange,
                filterList: this.state.selectedFilterList//原始数组，每项包含groupId、groupName、data[filterList]
            }).then((result) => {
                //若返回结果中有data属性，则取data属性的值作为数据源，否则将返回结果作为数据源
                const data = _.get(result, 'data', result);

                if (!data && data.errorMsg) {                    
                    message.error(data.errorMsg || Intl.get('common.save.failed', '保存失败'));
                }
                else {
                    filterEmitter.emit(filterEmitter.ADD_COMMON + this.props.key, {
                        id: data.result.id,
                        filterName: this.state.filterName,
                        range: this.state.selectedRange,
                        plainFilterList: this.state.plainFilterList,//压平的数组，每项包含groupId、groupName、name、value
                        data: this.state.selectedFilterList//原始数组，每项包含groupId、groupName、data[filterList]
                    });
                }
            }).catch(err => {
                message.error(err.message || Intl.get('common.save.failed', '保存失败'));
            });
        }
        else {
            filterEmitter.emit(filterEmitter.ADD_COMMON + this.props.key, {               
                filterName: this.state.filterName,
                range: this.state.selectedRange,
                plainFilterList: this.state.plainFilterList,//压平的数组，每项包含groupId、groupName、name、value
                data: this.state.selectedFilterList//原始数组，每项包含groupId、groupName、data[filterList]
            });
        }
    }
    render() {
        //是否展示输入框形式的已选择的筛选项
        const showInput = _.get(this.state.plainFilterList, 'length') > 0 && !this.props.isFirstLoading;
        const clearPopContent = (
            <div className="clear-confirm-pop-container">
                <h5><Icon type="info-circle" />
                    {Intl.get('apply.select.search.clear.value','修改筛选范围，已勾选的{type}将被清空',{type: this.props.filterType})}</h5>
                <div className="btn-bar">
                    <Button onClick={this.handleConfirmEdit.bind(this)}>确认修改</Button>
                    <Button onClick={this.showConfirmPop.bind(this, false)}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
        let {isWebMin} = isResponsiveDisplay();
        let minFilterButtonCls = classNames('collapsed search-wrapper', {
            'min-search-icon': isWebMin
        });
        return (
            <div className={showInput ? 'search-wrapper' : minFilterButtonCls} style={this.props.style}>
                {
                    showInput ?
                        <div className={this.state.showAddZone ? 'add-zone-wrapper filter-contianer clearfix' : 'filter-contianer clearfix'}>
                            <div className="show-zone">
                                <span className={this.props.showList ? 'icon-wrapper active' : 'icon-wrapper'}>
                                    <Icon type="filter" onClick={this.handleToggle.bind(this)} />
                                </span>
                                <ul className={this.state.showAddZone ? 'conserve' : (this.changeCollapseClass())}>
                                    {
                                        this.state.plainFilterList.map((x, idx) => (
                                            <li className="active" key={idx}>
                                                {x.name}
                                            </li>
                                        ))
                                    }
                                </ul>
                                <div className="btn-bar">
                                    <span className="handle-btn-item save-screen" onClick={this.showAddZone.bind(this, true)} >{Intl.get('common.save', '保存')}</span>
                                </div>
                                <Popover
                                    overlayClassName="filter-search-confirm-clear-pop"
                                    placement="bottom"
                                    content={clearPopContent}
                                    trigger="click"
                                    visible={this.state.showConfirmPop && this.props.showSelectChangeTip}
                                >
                                    <Icon type="close-circle" onClick={this.handleClearAll.bind(this)} />
                                </Popover>
                            </div>
                            {
                                this.state.showAddZone ?
                                    <div className="add-container clearfix">
                                        <h4>添加为常用筛选</h4>
                                        <div className="item-container">
                                            <span className="label">
                                                名称
                                            </span>
                                            <div className="item-content">
                                                <Input placeholder={Intl.get('filters.tip.name', '请输入常用筛选名称')} value={this.state.filterName} onChange={this.handleNameChange.bind(this)} />
                                            </div>
                                        </div>
                                        {/* <div className="item-container">
                                            <span className="label">
                                                类型
                                            </span>
                                            <div className="item-content">
                                                <Radio.Group value={this.state.selectedRange} onChange={this.handleRangeChange.bind(this)}>
                                                    {
                                                        RANGE_OPTIONS.map((x, idx) => (
                                                            <Radio.Button key={idx} value={x.value}>{x.name}</Radio.Button>
                                                        ))
                                                    }
                                                </Radio.Group>
                                            </div>
                                        </div> */}
                                        <div className="search-btn-bar">
                                            {
                                                this.props.errorMsg ?
                                                    <div className="alert-container">
                                                        <Alert type="error" showIcon message={this.props.errorMsg} />
                                                    </div> : null
                                            }
                                            <Button type="primary"
                                                loading={this.props.submitting}
                                                disabled={!_.trim(this.state.filterName) || this.props.submitting}
                                                onClick={this.handleSubmit.bind(this)}>{Intl.get('common.sure', '确定')}</Button>
                                            <Button
                                                onClick={this.showAddZone.bind(this, false)}
                                            >{Intl.get('common.cancel', '取消')}</Button>
                                        </div>
                                    </div> : null
                            }
                        </div> :
                        <div
                            onClick={this.handleToggle.bind(this)}
                            className={this.props.showList ? 'icon-container active' : 'icon-container'}
                        >
                            
                            <Popover
                                overlayClassName="filter-search-confirm-clear-pop"
                                placement="bottom"
                                content={clearPopContent}
                                trigger="click"
                                visible={this.state.showConfirmPop && this.props.showSelectChangeTip}
                            >
                                {
                                    isWebMin ? (
                                        <Button
                                            type={this.props.showList ? 'primary' : ''}
                                            title={Intl.get('common.filter', '筛选')}
                                            className="btn-item"
                                        >
                                            <i className='iconfont icon-filter1'></i>
                                        </Button>
                                    ) : (
                                        <Button
                                            title={Intl.get('common.filter', '筛选')}
                                            type={this.props.showList ? 'primary' : ''}
                                            className="btn-item"
                                        >
                                            <i className='iconfont icon-filter1'></i>
                                            {Intl.get('common.filter', '筛选')}
                                        </Button>
                                    )}
                            </Popover>
                        </div>

                }
            </div>
        );
    }
}

FilterSearch.defaultProps = {
    onSubmit: null,
    style: {
        maxWidth: 320
    },
    key: '',
    showSelectChangeTip: false,
    filterType: '',
    isFirstLoading: false,
    showList: false,
};

FilterSearch.propTypes = {
    onSubmit: PropTypes.func,
    style: PropTypes.object,
    key: PropTypes.string,
    submitting: PropTypes.bool,
    errorMsg: PropTypes.string,
    toggleList: PropTypes.func,
    showSelectChangeTip: PropTypes.bool,
    filterType: PropTypes.string,
    isFirstLoading: PropTypes.bool,
    showList: PropTypes.bool,
};

export default FilterSearch;