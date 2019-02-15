import { parseAmount } from 'LIB_DIR/func';

/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import InvoiceAmount from './invoice-amount';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { CONTRACT_STAGE, COST_STRUCTURE, COST_TYPE, OPERATE, VIEW_TYPE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';


//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//添加所属客户
    TEXT: 'text'//展示
};

const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 330;
const formItemLayout = {
    labelCol: {span: 0},
    wrapperCol: {span: 18},
};

class DetailInvoice extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_INVOICE);
        let formData = _.extend(true, {}, props.contract);

        return {
            formData: _.cloneDeep(formData),
            loading: false,
            isFormShow: false,
            submitErrorMsg: '',
            hasEditPrivilege, // 添加和修改发票信息的权限
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
                displayType: DISPLAY_TYPES.TEXT
            });
        }
    }

    renderAddInvoicePanel() {

    }

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加发票信息表单');
            this.setState({
                displayType: type,
                formData: {},
                submitErrorMsg: '',
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            });
        }
    }

    // 渲染发票信息
    renderInvoice() {
        const invoiceDetail = this.props.contract.invoice_detail || {};

        //编辑按钮是否显示, 发票信息为空+展示信息时+编辑权限
        const isEditBtnShow = _.isEmpty(invoiceDetail.id) && this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege;

        const detailOp = invoiceDetail.id ? 'update' : 'add';
        const noInoviceDetail = _.isEmpty(invoiceDetail.id);

        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddInvoicePanel() : isEditBtnShow ? (
                        <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {/*{this.renderRepaymentList(repayLists)}*/}
                </div>
            );
        };
        let invoiceTitle = (
            <div className="repayment-repay">
                {!noInoviceDetail ? <span>{Intl.get('contract.40', '发票基本信息')}: </span> : null}
            </div>
        );
        return (
            <DetailCard
                content={content()}
                titleBottomBorderNone={noInoviceDetail}
                titleDescr={noInoviceDetail ? Intl.get('contract.add.invoice.info','发票基本信息尚未添加，可点击后面的编辑按钮进行添加') : ''}
                title={invoiceTitle}
            />
        );
    }

    // 渲染发票额信息
    renderInvoiceAmount() {
        return (
            <InvoiceAmount
                contract={this.props.contract}
                refreshCurrentContractNoAjax={this.props.refreshCurrentContractNoAjax}
            />
        );
    }

    render() {
        const DetailBlock = (
            <div className='clearfix contract-repayment-container'>
                {this.renderInvoice()}
                {this.renderInvoiceAmount()}
            </div>
        );

        return (
            <div style={{height: this.props.height}}>
                <GeminiScrollBar>
                    {DetailBlock}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailInvoice.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractNoAjax: PropTypes.func,
    viewType: PropTypes.string,
};
module.exports = DetailInvoice;

