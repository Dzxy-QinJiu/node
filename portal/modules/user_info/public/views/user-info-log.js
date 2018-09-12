var React = require('react');
var createReactClass = require('create-react-class');
import { AntcTable } from 'antc';
import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
var Spinner = require('../../../../components/spinner');
const messages = defineMessages({
    common_no_data: {id: 'common.no.data'},//暂无数据
});
const tableHeadHeight = 40;

var UserInfoLog = createReactClass({
    displayName: 'UserInfoLog',
    mixins: [reactIntlMixin],

    isShowNoMoreDataTips() {
        return !this.props.logLoading &&
            this.props.logList.length >= 10 && !this.props.listenScrollBottom;
    },
    renderLogTableContent() {
        var Columns = [{
            title: Intl.get('common.login.time','时间'),
            dataIndex: 'loginTime',
            width: '23%'
        }, {
            title: Intl.get('user.info.login.address','地点'),
            dataIndex: 'loginAddress',
            width: '16%'
        }, {
            title: 'IP',
            dataIndex: 'loginIP',
            width: '16%'
        }, {
            title: Intl.get('user.info.login.browser','浏览器'),
            dataIndex: 'loginBrowser',
            width: '16%'
        }, {
            title: Intl.get('common.login.equipment','设备'),
            dataIndex: 'loginEquipment',
            width: '16%'
        }, {
            title: Intl.get('common.operate','操作'),
            dataIndex: 'loginMessage',
            width: '20%'
        }];
        var rowKey = function(record) {
            return record.id;
        };
        let localeObj = {emptyText: this.formatMessage(messages.common_no_data)};
        const dropLoadConfig = {
            listenScrollBottom: this.props.listenScrollBottom,
            handleScrollBottom: this.props.handleScrollBottom,
            loading: this.props.logLoading,
            showNoMoreDataTip: this.isShowNoMoreDataTips(),
            noMoreDataText: Intl.get('noMoreTip.log', '没有更多日志了')
        };
        const tableHeight = this.props.height - tableHeadHeight;
        return (
            <div className="user-log-list-table-wrap scroll-load">
                <div className="log-table" style={{ height: this.props.height }}>
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        dataSource={ this.props.logList }
                        columns={ Columns }
                        locale={localeObj}
                        rowKey={rowKey}
                        util={{ zoomInSortArea: true}}
                        scroll={{ y: tableHeight }}
                        pagination={false}
                        bordered
                    />
                </div>
                {
                    this.props.logTotal ?
                        <div className="summary-info">
                            {Intl.get('user.log.total','共有{number}条日志记录', {number: this.props.logTotal})}
                        </div> : null
                }

            </div>
        );
    },
    renderLogList(){
        if (this.props.sortId === '' && this.props.logLoading){
            return (
                <div className="load-content">
                    <Spinner className="isloading"/>
                    <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                </div>
            );
        } else if (this.props.logErrorMsg) {
            return <div className="errmsg-wrap">
                <i className="iconfont icon-data-error"></i>
                <p className="abnornal-status-tip">{this.props.logErrorMsg}</p>
            </div>;
        } else {
            return this.renderLogTableContent();
        }

    },

    render() {
        return (
            <div className="user-log">
                {this.renderLogList()}
            </div>
        );
    },
});

module.exports = injectIntl(UserInfoLog);
