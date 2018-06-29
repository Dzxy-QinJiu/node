import filterEmitter from './emitter';
import { Icon, Input, Button, Radio, Popover, Alert } from 'antd';


const RANGE_OPTIONS = [
    {
        name: '自己可见',
        value: '1'
    },
    {
        name: '团队可见',
        value: '2'
    }, {
        name: '全部可见',
        value: '3'
    },
];
class FilterSearch extends React.Component {
    constructor(props) {
        super();
        this.state = {
            selectedFilterList: [],
            filterName: '',
            showAddZone: false,
            selectedRange: RANGE_OPTIONS[0].value,
            showConfirmPop: false
        };
    }
    componentDidMount() {
        filterEmitter.on(filterEmitter.SELECT_FILTERS + this.props.key, this.onSelectFilters);
    }
    componentWillUnmount() {
        filterEmitter.removeListener(filterEmitter.SELECT_FILTERS + this.props.key, this.onSelectFilters);
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
    handleClear() {
        this.showAddZone(false);
        this.showConfirmPop(false);
        filterEmitter.emit(filterEmitter.CLEAR_FILTERS + this.props.key);
    }
    handleNameChange(e) {
        const value = $.trim(e.target.value);
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
    handleSubmit() {
        if (this.props.submitting) {
            return;
        }
        filterEmitter.emit(filterEmitter.ADD_COMMON + this.props.key, {
            filterName: this.state.filterName,
            range: this.state.selectedRange,
            plainFilterList: this.state.plainFilterList,//压平的数组，每项包含groupId、groupName、name、value
            filterList: this.state.selectedFilterList//原始数组，每项包含groupId、groupName、data[filterList]
        });
        //todo remove add emitter
        this.setState({
            showAddZone: false
        });
        this.props.onSubmit({
            filterName: this.state.filterName,
            range: this.state.selectedRange,
            filterList: this.state.selectedFilterList//原始数组，每项包含groupId、groupName、data[filterList]
        });
    }
    render() {
        const showInput = _.get(this.state.plainFilterList, 'length') > 0;
        const clearPopContent = (
            <div className="clear-confirm-pop-container">
                <h5><Icon type="info-circle" />修改筛选范围，已勾选的客户将被清空</h5>
                <div className="btn-bar">
                    <Button onClick={this.handleClear.bind(this)}>确认修改</Button>
                    <Button onClick={this.showConfirmPop.bind(this, false)}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
        return (
            <div className={showInput ? 'search-wrapper' : 'collapsed search-wrapper'} style={this.props.style}>
                {
                    showInput ?
                        <div className={this.state.showAddZone ? 'add-zone-wrapper filter-contianer clearfix' : 'filter-contianer clearfix'}>
                            <div className="show-zone">
                                <Icon type="filter" onClick={this.props.toggleList}/>
                                <ul className={this.state.showAddZone ? '' : 'collapse'}>
                                    {
                                        this.state.plainFilterList.map((x, idx) => (
                                            <li className="active" key={idx}>
                                                {x.name}
                                            </li>
                                        ))
                                    }
                                </ul>
                                <div className="btn-bar">
                                    <i className="icon-common-filter" onClick={this.showAddZone.bind(this, true)}></i>
                                </div>
                                <Popover className="filter-search-confirm-clear-pop" placement="bottom" content={clearPopContent} trigger="click" visible={this.state.showConfirmPop}>
                                    <Icon title="保存为常用筛选" type="close-circle" onClick={this.showConfirmPop.bind(this, true)} />
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
                                        <div className="item-container">
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
                                        </div>
                                        <div className="search-btn-bar">
                                            {
                                                this.props.errorMsg ?
                                                    <div className="alert-container">
                                                        <Alert type="error" showIcon message={this.props.errorMsg} />
                                                    </div> : null
                                            }
                                            <Button type="primary"
                                                loading={this.props.submitting}
                                                disabled={!$.trim(this.state.filterName) || this.props.submitting}
                                                onClick={this.handleSubmit.bind(this)}>{Intl.get('common.sure', '确定')}</Button>
                                            <Button
                                                onClick={this.showAddZone.bind(this, false)}
                                            >{Intl.get('common.cancel', '取消')}</Button>
                                        </div>
                                    </div> : null
                            }
                        </div> : 
                        <div className="icon-container">                        
                            <Icon type="filter" onClick={this.props.toggleList}/>
                        </div>

                }
            </div>
        );
    }
}

FilterSearch.defaultProps = {
    onSubmit: function() { },
    style: {
        maxWidth: 320
    },
    key: ''
};

FilterSearch.propTypes = {
    onSubmit: 'function',
    style: 'object',
    key: 'string',
    submitting: 'boolean',
    errorMsg: 'string',
    toggleList: 'function'
};

export default FilterSearch;