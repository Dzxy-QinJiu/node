var React = require('react');
import { Select, Icon } from 'antd';
import {SearchInput} from 'antc';

class Filter extends React.Component {
    state = {
        condition: {},
    };

    componentWillReceiveProps(nextProps) {
        //切换视图时清空表头搜索筛选条件
        if (nextProps.type !== this.props.type) {
            this.setState({condition: {}});
            this.refs.searchInput.closeSearchInput();
        }
    }

    search = () => {
        this.state.condition = this.refs.searchInput.state.formData;
        this.props.getContractList();
    };

    render() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'customer_name',
            },
            {
                name: Intl.get('contract.4', '甲方'),
                field: 'buyer',
            },
            {
                name: Intl.get('crm.6', '负责人'),
                field: 'user_name',
            },
            {
                name: Intl.get('contract.24', '合同号'),
                field: 'num',
            },
        ];

        return (
            <div className="filter">
                <SearchInput
                    ref="searchInput"
                    type="select"
                    searchFields={searchFields}
                    searchEvent={this.search}
                />
            </div>
        );
    }
}

module.exports = Filter;

