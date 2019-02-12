/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { CONTRACT_STAGE, COST_STRUCTURE, COST_TYPE, OPERATE, VIEW_TYPE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import {parseAmount} from 'LIB_DIR/func';

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

class RepaymentInfo extends React.Component {
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

    componentDidMount() {

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

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加已回款输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            });
        }
    }
    handleSubmit = () => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加已回款内容');
    };
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };

    // 渲染基础信息
    renderBasicInfo() {
        const contract = this.state.formData;

        const content = () => {
            if (this.state.displayType === DISPLAY_TYPES.TEXT) {
                return (
                    <div className="repayment-list">
                    </div>
                );
            } else if (this.state.displayType === DISPLAY_TYPES.EDIT) {
                return '';
            }
        };

        let repayTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.194', '回款进程')}: </span>
                <span className='repayment-label'>{Intl.get('contract.179', '已回款')}: {parseAmount(contract.total_amount)}{Intl.get('contract.82', '元')}/ </span>
                <span className='repayment-label'>{Intl.get('contract.180', '尾款')}: {parseAmount(contract.total_plan_amount)}{Intl.get('contract.82', '元')}</span>
                {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                    <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                        title={Intl.get('common.edit', '编辑')}/>) : null}
            </div>
        );

        return (
            <DetailCard
                content={content()}
                title={repayTitle}
                isEdit={this.state.displayType !== DISPLAY_TYPES.TEXT}
                loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.handleCancel}
            />
        );
    }


    render() {
        return this.renderBasicInfo();
    }
}

RepaymentInfo.propTypes = {
    contract: PropTypes.object,
    repayLists: PropTypes.array,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(RepaymentInfo);

