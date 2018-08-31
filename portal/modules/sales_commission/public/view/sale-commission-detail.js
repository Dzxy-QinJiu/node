/**
 * 销售明细组件
 * */
var React = require('react');
import { AntcTable } from 'antc';
import SaleCommissionDetailStore from '../store/sale-commission-detail-store';
import SaleCommissionDetailActions from '../action/sale-commission-detail-actions';
import { Checkbox, message} from 'antd';
import { RightPanel } from 'CMP_DIR/rightPanel';
import ajax from '../../../contract/common/ajax';
import routeList from '../../../contract/common/route';
import ContractRightPanel from '../../../contract/public/right-panel';
import { VIEW_TYPE } from '../../../contract/consts';
import SalesCommissionAjax from '../ajax/index';
const Spinner = require('CMP_DIR/spinner');
const SALES_COMMISSION = {
    FAILED_CONTRACT: Intl.get('sales.commission.failed.get.contract.detail', '获取合同详情失败！')
};

class SaleCommissionDetail extends React.Component {
    state = {
        currentContract: {},
        isRightPanelShow: false,
        selectedRowIndex: null, // 点击的行索引
        ...SaleCommissionDetailStore.getState()
    };

    onStoreChange = () => {
        this.setState(SaleCommissionDetailStore.getState());
    };

    refreshCurrentContract = (id) => {
        let handler = 'queryContract';

        if (this.state.type === VIEW_TYPE.COST) {
            handler = 'queryCost';
        }

        const route = _.find(routeList, route => route.handler === handler);

        const params = {
            page_size: 1,
            sort_field: 'id',
            order: 'descend',
        };

        const arg = {
            url: route.path,
            type: route.method,
            data: {query: {id: id}},
            params: params
        };

        ajax(arg).then(result => {
            if (result && result.code === 0 && _.isArray(result.list) && result.list.length) {
                const updatedContract = result.list[0];
                let index = _.findIndex(this.state.contractList, item => item.id === id);
                if (index > -1) this.state.contractList[index] = updatedContract;
                this.state.currentContract = updatedContract;
                this.setState(this.state);
            }
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.userId && nextProps.userId !== this.props.userId) {
            // 提成列表和提成明细中，会出现dispatch冲突，加延时处理
            setTimeout( () => {
                SaleCommissionDetailActions.setInitialState();
                this.getSaleCommissionDetail({userId: nextProps.userId});
            });
        }
        // 更新提成的变更状态和提成明细中，会出现dispatch冲突，加延时处理
        if (nextProps.grantStatus){
            setTimeout( () => {
                SaleCommissionDetailActions.setGrantStatus(nextProps.grantStatus);
            },100 );
        }
    }

    componentDidMount() {
        SaleCommissionDetailStore.listen(this.onStoreChange);
    }

    componentWillUnmount() {
        SaleCommissionDetailActions.resetState();
        SaleCommissionDetailStore.unlisten(this.onStoreChange);
    }

    getParams = (params) => {
        return {
            page_size: this.state.pageSize,
            sort_field: params && params.sortField || this.state.sortField,
            order: params && params.order || this.state.order,
            user_id: params && params.userId || this.props.userId
        };
    };

    // 获取销售提成明细
    getSaleCommissionDetail = (queryObj) => {
        let params = this.getParams(queryObj);
        let reqData = {
            start_time: this.props.startTime,
            end_time: this.props.endTime,
            id: this.state.lastId
        };
        SaleCommissionDetailActions.getSaleCommissionDetail(params, reqData);
    };

    // 展示合同详情
    showContractDetail = (contractNum, rowData, index) => {
        this.setState(() => {
            SalesCommissionAjax.getContractDetail(contractNum).then( (resData) => {
                if (resData.code === 0 && resData.contract) {
                    this.setState({
                        currentContract: resData.contract,
                        isRightPanelShow: true,
                        selectedRowIndex: index
                    });
                } else {
                    message.error(SALES_COMMISSION.FAILED_CONTRACT);
                }
            }, (errMsg) => {
                message.error(errMsg || SALES_COMMISSION.FAILED_CONTRACT);
            } );
        });
    };

    hideRightPanel = () => {
        this.setState({
            isRightPanelShow: false
        });
    };

    getSalesDetailTableColumns = () => {
        return [
            {
                title: Intl.get('contract.122', '回款时间'),
                dataIndex: 'repayment_date',
                className: 'has-filter',
                width: '14%',
                sorter: true,
                key: 'repayment_date',
                render: (timestamp) => {
                    return (<span>
                        {moment(timestamp).format(oplateConsts.DATE_FORMAT)}
                    </span>);
                }
            }, {
                title: Intl.get('contract.29', '回款毛利'),
                dataIndex: 'repayment_gross_profit',
                className: 'has-filter number-value',
                width: '14%',
                sorter: true,
                key: 'repayment_gross_profit'
            }, {
                title: Intl.get('contract.133', '费用'),
                dataIndex: 'cost_detail',
                className: 'has-filter number-value',
                width: '10%',
                sorter: true,
                key: 'cost_detail'
            }, {
                title: Intl.get('contract.141', '提成比例'),
                dataIndex: 'commission_rate',
                className: 'has-filter number-value',
                width: '14%',
                sorter: true,
                key: 'commission_rate',
                render: (rate) => {
                    return (<span>
                        {rate ? `${rate}%` : ''}
                    </span>);
                }
            }, {
                title: Intl.get('sales.commission.this.commission', '本次提成'),
                dataIndex: 'commission_detail',
                className: 'has-filter number-value',
                width: '14%',
                sorter: true,
                key: 'commission_detail'
            }, {
                title: Intl.get('sales.commission.grant', '已发放'),
                dataIndex: 'grant',
                className: 'has-filter',
                width: '10%',
                key: 'grant',
                render: (grant) => {
                    let checkedFlag = grant === 'yes';
                    return (<span>
                        <Checkbox checked={checkedFlag}/>
                    </span>);
                }
            }, {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                className: 'has-filter',
                sorter: true,
                width: '12%',
                key: 'customer_name'
            }, {
                title: Intl.get('contract.24', '合同号'),
                dataIndex: 'contract_number',
                className: 'has-filter',
                width: '12%',
                sorter: true,
                key: 'contract_number',
                render: (contractNum, rowData, index) => {
                    return (
                        <div onClick={this.showContractDetail.bind(this, contractNum, rowData, index)}>{contractNum}
                        </div>
                    );
                }
            }
        ];
    };

    getTimeTitle = () => {
        let year = moment(+this.props.startTime).get('year');
        let startQuarter = moment(+this.props.startTime).get('quarter');
        let endQuarter = moment(+this.props.endTime).get('quarter');
        if (startQuarter === endQuarter) {
            return `${year}${Intl.get('common.time.unit.year','年')}${startQuarter}${Intl.get('common.time.unit.quarter', '季度')}`;
        } else {
            return `${year}${Intl.get('common.time.unit.year','年')}`;
        }
    };

    salesDetailHeadInfo = () => {
        return (
            <div className="sales-detail-head">
                <span className="commission-detail">
                    {Intl.get('sales.commission.detail', '{username}{time}的提成明细', {'username': this.props.userName, 'time': this.getTimeTitle()})}
                </span>
            </div>
        );
    };

    handleTableChange = (pagination, filters, sorter) => {
        const sortOrder = sorter.order || this.state.sortOrder;
        const sortField = sorter.field || this.state.sortField;
        SaleCommissionDetailActions.setSort({sortField, sortOrder});
        setTimeout( () => {
            SaleCommissionDetailActions.setInitialState();
            this.getSaleCommissionDetail({
                sort_field: sortField,
                order: sortOrder
            });
        } );
    };

    handleRowClassName = (record, index) => {
        if ((index === this.state.selectedRowIndex) && this.state.isRightPanelShow) {
            return 'current-row';
        } else {
            return '';
        }
    };

    handleScrollBottom = () => {
        this.getSaleCommissionDetail({
            lastId: this.state.lastId
        });
    };

    showNoMoreDataTip = () => {
        return !this.state.saleCommissionDetailList.loading &&
            this.state.saleCommissionDetailList.data.length >= 10 && !this.state.listenScrollBottom;
    };

    // 销售明细表格
    renderSaleDetailTable = () => {
        let columns = this.getSalesDetailTableColumns();
        let dataSource = this.state.saleCommissionDetailList.data;
        let loading = this.state.saleCommissionDetailList.loading;
        let doNotShow = false;
        if (loading && this.state.lastId === '') {
            doNotShow = true;
        }
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.saleCommissionDetailList.loading,
            showNoMoreDataTip: this.showNoMoreDataTip()
        };
        return (
            <div className="sale-detail-commission-list-table-wrap scroll-load"

                style={{display: doNotShow ? 'none' : 'block'}}
            >
                <div className="sales-detail-table">
                    <AntcTable
                        util={{ zoomInSortArea: true }}
                        dropLoad={dropLoadConfig}
                        dataSource={dataSource}
                        columns={ columns }
                        onChange={this.handleTableChange}
                        rowClassName={this.handleRowClassName}
                        scroll={{
                            y: (this.props.height > 0 ? this.props.height - 60 : 560)
                        }}
                        pagination={false}
                        bordered
                    />
                </div>
            </div>
        );
    };

    renderLoadingBlock = () => {
        if (!this.state.saleCommissionDetailList.loading || this.state.lastId) {
            return null;
        }
        return (
            <div className="sale-detail-loading">
                <Spinner />
            </div>
        );
    };

    // 销售明细
    renderSaleDetailContent = () => {
        return (
            <div className="sale-detail-content">
                {this.salesDetailHeadInfo()}
                {this.renderLoadingBlock()}
                {this.renderSaleDetailTable()}
            </div>
        );
    };

    render() {
        return (
            <div className="sale-detail">
                {this.renderSaleDetailContent()}
                <RightPanel
                    showFlag={this.state.isRightPanelShow}
                    className={'right-panel-sell'}
                >
                    {this.state.isRightPanelShow ? (
                        <ContractRightPanel
                            view="detail"
                            contract={this.state.currentContract}
                            appList={this.props.appList}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                            hideRightPanel={this.hideRightPanel}
                            refreshCurrentContract={this.refreshCurrentContract}
                        />
                    ) : null}
                </RightPanel>
            </div>
        );
    }
}

module.exports = SaleCommissionDetail;
