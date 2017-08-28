import { Select, Icon } from "antd";
import SearchInput from "../../../components/searchInput";

const Filter = React.createClass({
    getInitialState: function () {
        return {
            formData: {},
            condition: {},
        };
    },
    search: function () {
        this.state.condition = _.extend({}, this.state.formData, this.refs.searchInput.state.formData);
        this.props.getContractList();
    },
    render: function () {
        const searchFields = [
            {
                name: Intl.get("crm.41", "客户名"),
                field: "customer_name",
            },
            {
                name: Intl.get("crm.6", "负责人"),
                field: "user_name",
            },
            {
                name: Intl.get("contract.4", "甲方"),
                field: "buyer",
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
});

module.exports = Filter;
