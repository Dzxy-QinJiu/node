import { Button, Icon } from 'antd';
import Trace from 'LIB_DIR/trace';
import {SearchInput} from 'antc';
var FilterAction = require('../action/filter-actions');
var FilterStore = require('../store/filter-store');

class CrmFilter extends React.Component {
    state = FilterStore.getState();

    onStoreChange = () => {
        this.setState(FilterStore.getState());
    };

    componentDidMount() {
        FilterStore.listen(this.onStoreChange);
    }

    //如果是从客户分析点击团队成员跳转过来时，将搜索框中的关键字置为点击的成员名称
    componentWillReceiveProps(nextProps) {
        if (nextProps.crmFilterValue){
            this.refs.searchInput.state.keyword = nextProps.crmFilterValue;
        }
    }

    componentWillUnmount() {
        FilterAction.setInputCondition({});
        FilterStore.unlisten(this.onStoreChange);
    }

    searchEvent = () => {
        FilterAction.setInputCondition(this.refs.searchInput.state.formData);
        setTimeout(() => this.props.search());
    };

    togglePanel = () => {
        if (this.state.isPanelShow) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-btn-ghost'),'关闭筛选面板');
            FilterAction.hidePanel();
            this.props.changeTableHeight();
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-btn-ghost'),'打开筛选面板');
            FilterAction.showPanel();
            this.props.changeTableHeight(true);
        }
    };

    render() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'name'
            },
            {
                name: Intl.get('call.record.contacts', '联系人'),
                field: 'contact_name'
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
            <div className="block search-input-select-block" style={{width: this.props.filterInputWidth}}>
                <SearchInput
                    ref="searchInput"
                    type="select"
                    searchFields={searchFields}
                    searchEvent={this.searchEvent}
                    className="btn-item"
                />
                <Button type="ghost" onClick={this.togglePanel}>
                    {Intl.get('common.filter', '筛选')} { this.state.isPanelShow ? <Icon type="up"/> : <Icon type="down"/> }
                </Button>
            </div>
        );
    }
}
CrmFilter.propTypes = {
    crmFilterValue: PropTypes.string,
    changeTableHeight: PropTypes.func,
    search: PropTypes.func,
    filterInputWidth: PropTypes.number
};
module.exports = CrmFilter;

