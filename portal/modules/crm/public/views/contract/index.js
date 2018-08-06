require('../../css/contract.less');
import { Button } from 'antd';
import Spinner from 'CMP_DIR/spinner';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import ContractAction from '../../action/contract-action';
import ContractStore from '../../store/contract-store';
import ContractItem from './contract-item';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import commonDataUtil from 'PUB_DIR/sources/utils/get-common-data-util';
import ContractForm from './contract-form';
import Trace from 'LIB_DIR/trace';

const Contract = React.createClass({
    getInitialState() {
        return {
            curCustomer: this.props.curCustomer,//当前查看详情的客户
            windowHeight: $(window).height(),
            appList: [],
            ...ContractStore.getState()
        };
    },
    onStoreChange() {
        this.setState(ContractStore.getState());
    },
    getParams() {
        return {
            pageSize: this.state.pageSize,
            sortField: this.state.sortField,
            order: this.state.order
        };
    },
    getAppList() {
        commonDataUtil.getAppList(appList => {
            this.setState({appList: appList});
        });
    },
    getContractByCustomerId(customerId) {
        let params = this.getParams();
        let reqBody = {query: {'customer_id': customerId}};
        ContractAction.getContractByCustomerId(params, reqBody);
    },
    componentDidMount() {
        ContractStore.listen(this.onStoreChange);
        this.getAppList();
        if (this.props.curCustomer && this.props.curCustomer.id) {
            this.getContractByCustomerId(this.props.curCustomer.id);
        }
        $(window).on('resize', this.onStoreChange);
    },
    componentWillReceiveProps(nextProps) {
        let oldCustomerId = this.state.curCustomer.id;
        if (_.get(nextProps.curCustomer , 'id') && nextProps.curCustomer.id !== oldCustomerId) {
            this.setState({
                curCustomer: nextProps.curCustomer
            });
            setTimeout(() => {
                ContractAction.resetState();
                this.getContractByCustomerId(nextProps.curCustomer.id);
            });
        }
    },
    componentWillUnmount() {
        ContractStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    },
    showForm() {
        Trace.traceEvent($(this.getDOMNode()).find('.crm-detail-add-btn'), '添加合同');
        ContractAction.showForm();
    },
    render() {
        let contractListLength = this.state.contractList.data.length || 0;
        let loading = this.state.contractList.loading;
        return (
            <div className="contract-container" data-tracename="合同页面">
                {
                    this.state.isAddFormShow || loading ? null : (contractListLength ? <ReactIntl.FormattedMessage
                        id="sales.frontpage.total.list"
                        defaultMessage={'共{n}条'}
                        values={{'n': contractListLength + ''}}/> : Intl.get('crm.no.contract.tip', '该客户还没有签订过合同'))
                }
                {this.props.isMerge || this.state.isAddFormShow ? null : (
                    <Button className='crm-detail-add-btn'
                        onClick={this.showForm.bind(this, '')}>
                        {Intl.get('contract.98', '添加合同')}
                    </Button>
                )}
                <RightPanelScrollBar totalHeight={contractListLength}>
                    <div className="contract-container-scroll">
                        {
                            this.state.isAddFormShow ? (
                                <ContractForm
                                    curCustomer={this.state.curCustomer}
                                    customerId={this.state.curCustomer.id}
                                    appList={this.state.appList}
                                />
                            ) : null
                        }
                        {
                            loading ? <Spinner /> : (
                                contractListLength ? this.state.contractList.data.map( (contract, index) => {
                                    return (
                                        <ContractItem
                                            key={index}
                                            customerId={this.state.curCustomer.id}
                                            contract={contract}
                                            appList={this.state.appList}
                                        />
                                    );
                                } ) : (
                                    this.state.isAddFormShow ? null : <NoDataIconTip tipContent={Intl.get('common.no.more.contract', '暂无合同')}/>
                                )
                            )
                        }
                    </div>
                </RightPanelScrollBar>
            </div>
        );
    }
});

module.exports = Contract;