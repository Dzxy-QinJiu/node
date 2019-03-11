/** Created by 2019-01-31 11:11 */
/**
 * 已回款信息展示及编辑页面
 */

var React = require('react');
import { message, Select, Icon, Form } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import 'MOD_DIR/user_manage/public/css/user-info.less';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import RepaymentInfo from './repayment-info';
import RepaymentPlan from './repayment-plan';
import Spinner from 'CMP_DIR/spinner';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { DISPLAY_TYPES, VIEW_TYPE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';

class DetailRepayment extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);

        return {
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
            isRepaymentLoading: false,
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentDidMount() {
        //在回款列表上打开详情时，由于列表项中不包含回款记录字段，所以要再用合同id获取一下合同详情
        if (this.props.viewType === VIEW_TYPE.REPAYMENT && !this.props.contract.repayments) {
            this.refreshContract();
        }
    }

    refreshContract() {
        this.props.refreshCurrentContract(this.props.contract.id, false);
        this.setState({isRepaymentLoading: true});
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            let newState = this.getInitStateData(nextProps);

            //在回款列表上打开详情时，由于列表项中不包含回款记录字段，所以要再用合同id获取一下合同详情
            if (nextProps.viewType === VIEW_TYPE.REPAYMENT && !nextProps.contract.repayments) {
                nextProps.refreshCurrentContract(nextProps.contract.id, false);
                newState.isRepaymentLoading = true;
            } else {
                newState.isRepaymentLoading = false;
            }

            this.setState(newState);
        }else {
            if (nextProps.viewType === VIEW_TYPE.REPAYMENT && !nextProps.contract.repayments) {
                nextProps.refreshCurrentContract(nextProps.contract.id, false);
                this.setState({isRepaymentLoading: true});
            } else {
                this.setState({isRepaymentLoading: false});
            }
        }
    }

    updateScrollBar = () => {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) {
            return;
        }

        scrollBar.update();
    };

    // 渲染已回款信息
    renderReypayInfo() {
        return (
            <RepaymentInfo
                contract={this.props.contract}
                updateScrollBar={this.updateScrollBar}
                refreshCurrentContractRepayment={this.props.refreshCurrentContractRepayment}
            />
        );
    }

    // 渲染回款计划信息
    renderReypayPlan() {
        return (
            <RepaymentPlan
                contract={this.props.contract}
                updateScrollBar={this.updateScrollBar}
                refreshCurrentContractRepaymentPlan={this.props.refreshCurrentContractRepaymentPlan}
            />
        );
    }


    render() {
        return (
            <div style={{height: this.props.height}} data-tracename="回款页面">
                <GeminiScrollBar ref="gemiScrollBar">
                    {this.state.isRepaymentLoading ? <Spinner /> :
                        (<div className='clearfix contract-view-content'>
                            {this.renderReypayPlan()}
                            {this.renderReypayInfo()}
                        </div>)}
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

