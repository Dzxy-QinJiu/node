import {hasPrivilege} from 'CMP_DIR/privilege/checker';
require('../../css/contract.less');
import { Button } from 'antd';
import Spinner from 'CMP_DIR/spinner';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import ContractAction from '../../action/contract-action';
import ContractStore from '../../store/contract-store';
import ContractItem from './contract-item';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import ContractForm from './contract-form';
import Trace from 'LIB_DIR/trace';
import crmPrivilegeConst from '../../privilege-const';

class Contract extends React.Component {
    state = {
        curCustomer: this.props.curCustomer,//当前查看详情的客户
        windowHeight: $(window).height(),
        appList: [],
        ...ContractStore.getState()
    };

    onStoreChange = () => {
        this.setState(ContractStore.getState());
    };

    getParams = () => {
        return {
            pageSize: this.state.pageSize,
            sortField: this.state.sortField,
            order: this.state.order
        };
    };

    getAppList = () => {
        commonDataUtil.getAllProductList(appList => {
            this.setState({appList: appList});
        });
    };

    getContractByCustomerId = (customerId) => {
        let params = this.getParams();
        let reqBody = {query: {'customer_id': customerId}};
        ContractAction.getContractByCustomerId(params, reqBody);
    };

    componentDidMount() {
        ContractStore.listen(this.onStoreChange);
        this.getAppList();
        if (this.props.curCustomer && this.props.curCustomer.id) {
            this.getContractByCustomerId(this.props.curCustomer.id);
        }
        $(window).on('resize', this.onStoreChange);
        let $contractContainer = $('.contract-container-scroll');
        if($contractContainer){
            $contractContainer.delegate('.add-app-container .add-btn', 'click', this.refreshScrollBar);
            $contractContainer.delegate('.add-app-container .sure-btn', 'click', this.refreshScrollBar);
            $contractContainer.delegate('.add-app-container .cancel-btn', 'click', this.refreshScrollBar);
        }
    }

    refreshScrollBar = () => {
        let contractListLength = this.state.contractList.data.length || 0;
        setTimeout(() => {
            //没有合同时，添加合同，选择应用时或选择应用后，滚动条展示、隐藏的处理
            if (!contractListLength && _.get(this.contactScrollRef, 'rightPanelScrollBarRef')) {
                this.contactScrollRef.rightPanelScrollBarRef.update();
            }
        });
    };

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
    }

    componentWillUnmount() {
        ContractStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    }

    showForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-detail-add-btn'), '添加合同');
        ContractAction.showForm();
    };

    render() {

        let contractListLength = this.state.contractList.data.length || 0;
        let loading = this.state.contractList.loading;
        return (
            <div className="crm-contract-container" data-tracename="合同页面">
                <div className="crm-detail-top-total-block">
                    {
                        this.state.isAddFormShow || loading ? null : (contractListLength ? <ReactIntl.FormattedMessage
                            id="sales.frontpage.total.list"
                            defaultMessage={'共{n}条'}
                            values={{'n': contractListLength + ''}}/> : Intl.get('crm.no.contract.tip', '该客户还没有签订过合同'))
                    }
                    {this.props.disableEdit || this.props.isMerge || this.state.isAddFormShow || !hasPrivilege(crmPrivilegeConst.CRM_CONTRACT_COMMON_BASE) ? null : (
                        <Button className='crm-detail-add-btn'
                            onClick={this.showForm.bind(this, '')}>
                            {Intl.get('contract.98', '添加合同')}
                        </Button>
                    )}
                </div>
                <RightPanelScrollBar totalHeight={contractListLength} ref={(contactScroll) => {
                    this.contactScrollRef = contactScroll;
                }}>
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
                                            disableEdit={this.props.disableEdit}
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
}
Contract.propTypes = {
    curCustomer: PropTypes.object,
    isMerge: PropTypes.bool,
    disableEdit: PropTypes.bool,
};
module.exports = Contract;
