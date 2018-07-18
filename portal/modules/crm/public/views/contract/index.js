require('../../css/contract.less');
const GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
import Spinner from 'CMP_DIR/spinner';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import ContractAction from '../../action/contract-action';
import ContractStore from '../../store/contract-store';
import ContractItem from './contract-item';
//高度常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_ORDER_HEIGHHT: 155,//添加订单面板的高度
    TOP_TOTAL_HEIGHT: 30//共xxx条的高度
};

const Contract = React.createClass({
    getInitialState() {
        return {
            curCustomer: this.props.curCustomer,//当前查看详情的客户
            windowHeight: $(window).height(),
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
    componentDidMount() {
        ContractStore.listen(this.onStoreChange);
        let params = this.getParams();
        let reqBody = {query: {'customer_id': this.props.curCustomer.id}};
        if (this.props.curCustomer) {
            ContractAction.getContractByCustomerId(params, reqBody);
        }
        $(window).on('resize', this.onStoreChange);
    },
    componentWillReceiveProps(nextProps) {
        let oldCustomerId = this.state.curCustomer.id;
        if (nextProps.curCustomer && nextProps.curCustomer.id !== oldCustomerId) {
            this.setState({
                curCustomer: nextProps.curCustomer
            });
            let params = this.getParams();
            let reqBody = {query: {'customer_id': nextProps.curCustomer.id}};
            setTimeout(() => {
                ContractAction.resetState();
                ContractAction.getContractByCustomerId(params, reqBody);
            });
        }
    },
    componentWillUnmount() {
        ContractStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    },
    render() {
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        //减头部的客户基本信息高度
        divHeight -= parseInt($('.basic-info-contianer').outerHeight(true));
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
        }
        //减添加合同面版的高度
        if (this.state.isShowAddContactForm) {
            divHeight -= LAYOUT_CONSTANTS.ADD_ORDER_HEIGHHT;
        } else {//减共xxx条的高度
            divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
        }
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            divHeight -= LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        let contractListLength = this.state.contractList.data.length || 0;
        let loading = this.state.contractList.loading;
        return (
            <div className="contract-container" data-tracename="合同页面">
                {
                    loading ? null : (contractListLength ? <ReactIntl.FormattedMessage
                        id="sales.frontpage.total.list"
                        defaultMessage={'共{n}条'}
                        values={{'n': contractListLength + ''}}/> : Intl.get('crm.no.contract.tip', '该客户还没有添加过合同'))
                }
                <div className="contract-container-scroll" style={{height: divHeight}}>
                    <GeminiScrollbar>
                        {
                            loading ? <Spinner /> : (
                                contractListLength ? this.state.contractList.data.map( (contract, index) => {
                                    return (
                                        <ContractItem
                                            key={index}
                                            customerId={this.state.curCustomer.id}
                                            contract={contract}
                                        />
                                    );
                                } ) : <NoDataIconTip tipContent={Intl.get('common.no.more.contract', '暂无合同')}/>
                            )
                        }
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = Contract;