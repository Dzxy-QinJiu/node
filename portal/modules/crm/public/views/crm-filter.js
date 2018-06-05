import { Button, Icon } from 'antd';
import Trace from 'LIB_DIR/trace';
var SearchInput = require('../../../../components/searchInput');
var FilterAction = require('../action/filter-actions');
var FilterStore = require('../store/filter-store');

var CrmFilter = React.createClass({
    getInitialState: function() {
        return FilterStore.getState();
    },
    onStoreChange: function() {
        this.setState(FilterStore.getState());
    },
    componentDidMount: function() {
        FilterStore.listen(this.onStoreChange);
    },
    //如果是从客户分析点击团队成员跳转过来时，将搜索框中的关键字置为点击的成员名称
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.crmFilterValue){
            this.refs.searchInput.state.keyword = nextProps.crmFilterValue;
        }
    },
    componentWillUnmount: function() {
        FilterStore.unlisten(this.onStoreChange);
    },
    searchEvent: function() {
        FilterAction.setInputCondition(this.refs.searchInput.state.formData);
        setTimeout(() => this.props.search());
    },
    togglePanel: function() {
        if (this.state.isPanelShow) {
            Trace.traceEvent($(this.getDOMNode()).find('.ant-btn-ghost'),'关闭筛选面板');
            FilterAction.hidePanel();
            this.props.changeTableHeight();
        } else {
            Trace.traceEvent($(this.getDOMNode()).find('.ant-btn-ghost'),'打开筛选面板');
            FilterAction.showPanel();
            this.props.changeTableHeight(true);
        }
    },
    render: function() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'name'
            },
            {
                name: Intl.get('crm.6', '负责人'),
                field: 'user_name'
            },
            {
                name: Intl.get('common.phone', '电话'),
                field: 'phone'
            },
            {
                name: Intl.get('common.email', '邮箱'),
                field: 'email'
            }
        ];

        return (
            <div className="block search-input-select-block">
                <SearchInput
                    ref="searchInput"
                    type="select"
                    searchFields={searchFields}
                    searchEvent={this.searchEvent}
                />
                <Button type="ghost" onClick={this.togglePanel}>
                    {Intl.get('common.filter', '筛选')} { this.state.isPanelShow ? <Icon type="up"/> : <Icon type="down"/> }
                </Button>
            </div>
        );
    }
});

module.exports = CrmFilter;
