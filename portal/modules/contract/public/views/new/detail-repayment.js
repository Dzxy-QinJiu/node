/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import RepaymentInfo from './repayment-info';
import RepaymentPlan from './repayment-plan';
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

class DetailRepayment extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);
        let formData = _.extend(true, {}, props.contract);

        return {
            formData: _.cloneDeep(formData),
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }else {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }
    }

    saveContractBasicInfo = (saveObj, successFunc, errorFunc) => {

    };

    // 渲染已回款信息
    renderReypayInfo() {
        return (
            <RepaymentInfo
                contract={this.props.contract}
                refreshCurrentContractRepayment={this.props.refreshCurrentContractRepayment}
            />
        );
    }

    // 渲染回款计划信息
    renderReypayPlan() {
        return (
            <RepaymentPlan
                contract={this.props.contract}
                refreshCurrentContractRepaymentPlan={this.props.refreshCurrentContractRepaymentPlan}
            />
        );
    }


    render() {
        const DetailBlock = (
            <div className='clearfix contract-repayment-container'>
                {this.renderReypayPlan()}
                {this.renderReypayInfo()}
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

DetailRepayment.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
    refreshCurrentContractRepaymentPlan: PropTypes.func,
    viewType: PropTypes.string,
};
module.exports = DetailRepayment;

