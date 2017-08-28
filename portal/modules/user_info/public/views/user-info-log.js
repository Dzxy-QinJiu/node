var Table = require("antd").Table;
var Spinner = require("../../../../components/spinner");
import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
const messages = defineMessages({
    common_no_data: {id: 'common.no.data'},//暂无数据
});
var UserInfoLog = React.createClass({
    mixins: [reactIntlMixin],
    tableOnChange: function (pagination, filters, sorter) {
        this.props.changeLogNum(pagination.current);
    },
    render: function () {
        var Columns = [{
            title: Intl.get("common.login.time","时间"),
            dataIndex: 'loginTime',
            width:'16%'
        }, {
            title: Intl.get("user.info.login.address","地点"),
            dataIndex: 'loginAddress',
            width:'16%'
        }, {
            title: 'IP',
            dataIndex: 'loginIP',
            width:'16%'
        }, {
            title: Intl.get("user.info.login.browser","浏览器"),
            dataIndex: 'loginBrowser',
            width:'16%'
        }, {
            title: Intl.get("common.login.equipment","设备"),
            dataIndex: 'loginEquipment',
            width:'16%'
        }, {
            title: Intl.get("common.operate","操作"),
            dataIndex: 'loginMessage',
            width:'20%'
        }];
        var Pagination = false;
        if (this.props.logTotal / this.props.pageSize > 1) {
            Pagination = {
                total: this.props.logTotal,
                showSizeChanger: false,
                pageSize: this.props.pageSize,
                current: this.props.logNum
            };
        }

        var rowKey = function (record) {
            return record.id;
        };

        let localeObj = {emptyText: this.props.logErrorMsg || this.formatMessage(messages.common_no_data)
        };
        return (
            <div className="log-table" style={{height: this.props.height}}>
                {this.props.logLoading ? (<Spinner className="isloading"/>) : (
                    <Table columns={Columns} dataSource={this.props.logList} onChange={this.tableOnChange}
                           pagination={Pagination} bordered locale={localeObj}
                           rowKey={rowKey}/>)}
            </div>
        );
    }
});

module.exports = injectIntl(UserInfoLog);