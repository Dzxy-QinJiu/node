import SaveCancelButton from 'MOD_DIR/crm/public/views/customer_record';

/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, Radio, Input, Button } from 'antd';

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
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';

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


class RepaymentPlan extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);
        let repayments = _.extend({}, props.contract.repayments) || [];

        return {
            repayments,
            formData: this.getInitialFormData(),
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    getInitialFormData() {
        return {
            type: 'repay_plan',
            unit: 'days',
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
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加回款计划输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            // Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置所属客户按钮');
            this.setState({
                displayType: type
            });
        }
    }
    handleSubmit = () => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加回款计划');
    };
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };

    onUnitChange(value) {
        const {formData} = this.state;
        formData.unit = value;

        const num = formData.num;

        if (!isNaN(num)) {
            const signDate = this.props.contract.date;
            const count = parseInt(num);
            formData.date = moment(signDate).add(count, value).valueOf();
        }

        this.setState({formData});
    }

    onNumChange(e) {
        const num = e.target.value;
        const {formData} = this.state;
        formData.num = num;

        if (!isNaN(num)) {
            const count = parseInt(num);
            const signDate = this.props.contract.date;
            formData.date = moment(signDate).add(count, formData.unit).valueOf();
        }

        this.setState({formData});
    }

    renderAddRepaymentPanel() {
        let {getFieldDecorator} = this.props.form;
        //合同额
        const contractAmount = _.get(this, 'props.contract.contract_amount',0);
        //已添加的回款总额
        let repaymentsAmount = 0;
        const repayments = _.filter(this.state.repayments, item => item.type === 'repay_plan');

        if (repayments.length) {
            repaymentsAmount = _.reduce(repayments, (memo, repayment) => {
                const num = parseFloat(repayment.amount);
                return memo + num;
            }, 0);
        }

        return (
            <Form layout='horizontal' className='add-repayment-form'>
                <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />
                {/*<FormItem
                >
                    {
                        getFieldDecorator('num', {
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule()]
                        })(
                            <Input
                                name="num"
                                value={this.state.formData.num}
                                onChange={this.onNumChange}
                            />
                        )
                    }
                </FormItem>*/}
                <Select
                    value={this.state.formData.unit}
                    onChange={this.onUnitChange}
                >
                    <Option key="days" value="days"><ReactIntl.FormattedMessage id="contract.79" defaultMessage="日" /></Option>
                    <Option key="weeks" value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                    <Option key="months" value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                </Select>
                {Intl.get('contract.80', '内')}，
                {Intl.get('contract.93', '应收回款')}
                {/* <FormItem
                >
                    {
                        getFieldDecorator('amount', {
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule(), numberAddNoMoreThan.bind(this, contractAmount, repaymentsAmount, Intl.get('contract.161', '已超合同额'))]
                        })(
                            <Input
                                value={this.state.formData.amount}
                                onChange={this.onNumChange}
                            />
                        )
                    }
                </FormItem>*/}
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元" />
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderRepaymentList() {
        const repayments = this.state.repayments;
        let repayPlanLists = _.filter(repayments,item => item.type === 'repay_plan');
        return (
            <div className="finance-list">
                <ul>
                    {repayPlanLists.map((repayment, index) => { return (
                        <li key={index}>
                            ({moment(repayment.date).format(oplateConsts.DATE_FORMAT)}{Intl.get('common.before', '前')}) ,{Intl.get('contract.94', '应收金额')}{parseAmount(repayment.amount)}{Intl.get('contract.155', '元')}
                            <span className="btn-bar"
                                title={Intl.get('common.delete', '删除')}>
                                <Icon type="close" theme="outlined" />
                            </span>
                        </li>
                    );})}
                </ul>
            </div>
        );
    }

    // 渲染基础信息
    renderBasicInfo() {
        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddRepaymentPanel() : this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                        <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {this.renderRepaymentList()}
                </div>
            );
        };

        let repayTitle = (
            <div className="repayment-repay">
                <span className="repayment-repay-label">{Intl.get('contract.97', '回款计划')}:</span>
            </div>
        );

        return (
            <DetailCard
                content={content()}
                title={repayTitle}
            />
        );
    }


    render() {
        return this.renderBasicInfo();
    }
}

RepaymentPlan.propTypes = {
    contract: PropTypes.object,
    repayPlanLists: PropTypes.array,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(RepaymentPlan);

