var React = require('react');
import { RightPanelClose } from 'CMP_DIR/rightPanel/index';
import { AntcTable } from 'antc';
import { Alert } from 'antd';
import Spinner from 'CMP_DIR/spinner';
import PropTypes from 'prop-types';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';

//计算距离所需布局距离
const LAYOUT = {
    TOP: 150//顶部留白
};

class CustomerStageTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showRightPanel: false,
            selectedCustomerId: '',
            selectedCustomerIndex: '',
            tableHeight: 0,
        };
    }

    componentDidMount() {
        this.changeTableHeight();
        $(window).on('resize', this.changeTableHeight);
    }

    //计算表格高度
    changeTableHeight = () => {
        var tableHeight = $(window).height() - LAYOUT.TOP;
        this.setState({ tableHeight });
    }

    componentWillUnmount() {
        $(window).off('resize', this.changeTableHeight);
    }

    hideRightPanel = () => {
        this.setState({
            showRightPanel: false
        });
    }

    handleScrollBottom() {
        this.props.handleScrollBottom({
            query: {
                label: this.props.params.type,
                nickname: this.props.params.nickname
            },
            rang_params: [{
                'from': moment(this.props.params.time).startOf('day').valueOf(),
                'to': moment(this.props.params.time).endOf('day').valueOf(),
                'name': 'time',
                'type': 'time'
            }]
        });
    }

    render() {
        const handleCustomerClick = (item, index) => {
            this.setState({
                showRightPanel: true,
                selectedCustomerId: item.customer_id,
                selectedCustomerIndex: index
            });
            //触发打开带拨打电话状态的客户详情面板
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    currentId: item.customer_id,
                    ShowCustomerUserListPanel: this.props.ShowCustomerUserListPanel,
                    hideRightPanel: this.hideRightPanel
                }
            });
        };
        const getRowKey = function(record, index) {
            return index;
        };
        //处理选中行的样式
        const handleRowClassName = (record, index) => {
            if ((index === this.state.selectedCustomerIndex) && this.state.showRightPanel) {
                return 'current_row';
            }
            else {
                return '';
            }
        };
        const { data, loading, errorMsg, lastId, listenScrollBottom } = this.props.result;
        const loadingFirst = loading && !lastId;
        const loadingNotFirst = loading && lastId;
        const renderErr = () => {
            if (errorMsg) {
                return (
                    <div className="alert-container">
                        <Alert
                            message={errorMsg}
                            type="error"
                            showIcon
                        />
                    </div>
                );
            }
        };
        const renderSpiner = () => {
            if (loadingFirst && !errorMsg) {
                return (
                    <Spinner />
                );
            }
        };
        const hideTable = errorMsg || loadingFirst;
        const renderStageCustomerList = () => {
            const columns = [
                {
                    dataIndex: 'customer_name',
                    key: 'customer_name',
                    title: Intl.get('crm.4', '客户名称'),
                    render: (text, item, index) => {
                        return (<span className="click-cell"
                            onClick={handleCustomerClick.bind(this, item, index)}>{text}</span>);
                    },
                    width: 100
                },
                {
                    dataIndex: 'label',
                    key: 'label',
                    title: Intl.get('weekly.report.customer.stage', '客户阶段'),
                    width: 100
                }
            ];
            let customerOfCurUser = this.state.customerOfCurUser;
            return (
                <div className="stage-changed-customer-list-wrapper">
                    {renderErr()}
                    {renderSpiner()}
                    <div className={hideTable ? 'hide' : ''}>
                        <AntcTable
                            dropLoad={{
                                loading: loadingNotFirst,
                                handleScrollBottom: this.handleScrollBottom.bind(this),
                                listenScrollBottom: listenScrollBottom && !loading,
                                showNoMoreDataTip: this.props.showNoMoreData,
                                noMoreDataText: Intl.get('noMoreTip.customer', '没有更多客户了')
                            }}
                            rowKey={getRowKey}
                            rowClassName={handleRowClassName}
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            scroll={{ y: this.state.tableHeight }}
                        />
                    </div>
                </div>
            );
        };
        return (
            <div>
                <div className="customer-table-close topNav">
                    <RightPanelClose
                        title={Intl.get('common.app.status.close', '关闭')}
                        onClick={this.props.onClose}
                    />
                </div>
                {renderStageCustomerList()}
            </div>
        );
    }
}

CustomerStageTable.propTypes = {
    handleScrollBottom: PropTypes.func,
    params: PropTypes.object,
    result: PropTypes.object,
    showNoMoreData: PropTypes.bool,
    onClose: PropTypes.func,
    ShowCustomerUserListPanel: PropTypes.func
};

export default CustomerStageTable;