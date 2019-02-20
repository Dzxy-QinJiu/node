/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, Input, Spin, Button, Modal, Popconfirm } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
const confirm = Modal.confirm;
import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
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

        return {
            formData: this.getInitialFormData(),
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
            currentRepayment: {},// 当前选中的回款计划
            repayPlanLoading: false,
        };
    }
    static defaultProps = {
        updateScrollBar: function() {}
    };

    getInitialFormData() {
        return {
            type: 'repay_plan',
            unit: 'days',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                formData: this.getInitialFormData(),
                currentRepayment: {}
            });
        }
    }

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加回款计划输入区');
            this.setState({
                displayType: type,
                formData: this.getInitialFormData(),
                submitErrorMsg: '',
                currentRepayment: {}
            }, () => {
                this.props.updateScrollBar();
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            // Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置所属客户按钮');
            this.setState({
                displayType: type
            }, () => {
                this.props.updateScrollBar();
            });
        }
    }
    handleSubmit = (type, index, id) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加回款计划');
        let _this = this;
        let saveObj;
        if (type === 'delete') {
            saveObj = [id];
            const successFunc = () => {
                this.setState({
                    repayPlanLoading: false
                },() => {
                    this.props.updateScrollBar();
                });
            };
            const errorFunc = (errorMsg) => {
                message.error(errorMsg);
                this.setState({ repayPlanLoading: false });
            };
            this.editRepayment(type, saveObj,'', successFunc, errorFunc);
        } else if(type === 'add'){
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});
                const params = {contractId: this.props.contract.id, type: 'repay_plan'};
                let { formData } = this.state;
                formData = JSON.parse(JSON.stringify(formData));

                saveObj = {...formData,...value};
                delete saveObj.unit;
                delete saveObj.num;
                if(!_.isEmpty(formData.repay_type)) {
                    type = formData.repay_type;
                    delete saveObj.repay_type;
                }

                const successFunc = () => {
                    formData = this.getInitialFormData();
                    _this.setState({
                        loading: false,
                        formData,
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT,
                        currentRepayment: {}
                    }, () => {
                        this.props.updateScrollBar();
                    });
                };
                const errorFunc = (errorMsg) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg
                    });
                };
                this.editRepayment(type, saveObj, params, successFunc, errorFunc);
            });
        }
    };
    editRepayment(type, data, params, successFunc, errorFunc) {

        const handler = type + 'Repayment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE[type] + Intl.get('contract.41', '成功'));
                //返回数据
                let resultData = result.result;

                //删除的时候没有返回数据，需要根据id从当前回款列表中取
                if (type === 'delete') {
                    const repaymentId = data[0];
                    resultData = _.find(this.props.contract.repayments, repayment => repayment.id === repaymentId);
                }
                // 更新后没有返回id，
                if(type === 'update') {
                    resultData = _.extend({},this.state.currentRepayment, resultData);
                }
                //刷新合同列表中的回款信息
                this.props.refreshCurrentContractRepaymentPlan(type, resultData);

                if (_.isFunction(successFunc)) successFunc();
            } else {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE[type] + Intl.get('user.failed', '失败'));
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE[type] + Intl.get('user.failed', '失败'));
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    handleDeleteRepayment = (repayment, e) => {
        Trace.traceEvent(e, '点击删除回款计划按钮');
        // Trace.traceEvent(e, '点击删除回款计划确认按钮');
        this.setState({
            repayPlanLoading: true
        }, () => {
            this.handleSubmit('delete','',repayment.id);
        });
    };
    setEditable(repayment, e) {
        Trace.traceEvent(e, '点击编辑回款计划按钮');
        let formData = this.state.formData;
        formData.repay_type = 'update';
        let timeInterval = moment(repayment.date).startOf('day').diff(moment(this.props.contract.date).startOf('day'), formData.unit);
        formData.num = timeInterval;
        formData.amount = repayment.amount;
        formData.date = repayment.date;
        this.props.form.resetFields();
        this.setState({
            currentRepayment: repayment,
            formData,
            displayType: DISPLAY_TYPES.EDIT
        });
    }
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

    renderAddRepaymentPanel(repayments) {
        let {getFieldDecorator} = this.props.form;
        //合同额
        const contractAmount = _.get(this, 'props.contract.contract_amount',0);
        //已添加的回款总额
        let repaymentsAmount = 0;
        // const repayments = _.filter(this.state.repayments, item => item.type === 'repay_plan');

        if (repayments.length) {
            repaymentsAmount = _.reduce(repayments, (memo, repayment) => {
                const num = parseFloat(repayment.amount);
                return memo + num;
            }, 0);
        }

        return (
            <Form layout='inline' className='detailcard-form-container new-add-repayment-container'>
                <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />
                <FormItem>
                    {
                        getFieldDecorator('num', {
                            initialValue: this.state.formData.num,
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule()]
                        })(
                            <Input
                                name="num"
                                value={this.state.formData.num}
                                onChange={this.onNumChange.bind(this)}
                            />
                        )
                    }
                </FormItem>
                <Select
                    value={this.state.formData.unit}
                    onChange={this.onUnitChange.bind(this)}
                >
                    <Option key="days" value="days"><ReactIntl.FormattedMessage id="contract.79" defaultMessage="日" /></Option>
                    <Option key="weeks" value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                    <Option key="months" value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                </Select>
                {Intl.get('contract.80', '内')}，
                {Intl.get('contract.93', '应收回款')}
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            initialValue: this.state.formData.amount,
                            rules: [{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule(), numberAddNoMoreThan.bind(this, contractAmount, repaymentsAmount, Intl.get('contract.161', '已超合同额'))]
                        })(
                            <Input
                                value={this.state.formData.amount}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元" />
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,'add')}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderRepaymentList(repayPlanLists) {
        const date = this.props.contract.date;

        if(repayPlanLists.length > 0) {
            return (
                <div className="finance-list">
                    <Spin spinning={this.state.repayPlanLoading}>
                        <ul>
                            {repayPlanLists.map((repayment, index) => {
                                let timeInterval = moment(repayment.date).startOf('day').diff(moment(date).startOf('day'), 'days');
                                let classname = classNames('finance-list-item',{
                                    'item-actived': !_.isEmpty(this.state.currentRepayment) && this.state.currentRepayment.id === repayment.id
                                });
                                return (
                                    <li key={index} className={classname}>
                                        <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />{timeInterval}{`${Intl.get('contract.79', '日')}${Intl.get('contract.80', '日')}`}
                                        ({moment(repayment.date).format(oplateConsts.DATE_FORMAT)}{Intl.get('common.before', '前')}),{Intl.get('contract.93', '应收回款')}{parseAmount(repayment.amount)}{Intl.get('contract.155', '元')}
                                        <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`} onConfirm={this.handleDeleteRepayment.bind(this, repayment)}>
                                            <span className="btn-bar"
                                                //onClick={this.handleDeleteRepayment.bind(this, repayment)}
                                                title={Intl.get('common.delete', '删除')}>
                                                <Icon type="close" theme="outlined" />
                                            </span>
                                        </Popconfirm>
                                        <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={(e) => {
                                            this.setEditable(repayment ,e);
                                        }}/>
                                    </li>
                                );
                            })}
                        </ul>
                    </Spin>
                </div>
            );
        } else {
            return null;
        }
    }

    // 渲染基础信息
    renderBasicInfo() {
        let repayments = _.sortBy(this.props.contract.repayments || [], item => item.date).reverse();
        let repayPlanLists = _.filter(repayments,item => item.type === 'repay_plan');
        const noRepaymentData = !repayPlanLists.length && !this.state.loading;

        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddRepaymentPanel(repayPlanLists) : this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                        <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {this.renderRepaymentList(repayPlanLists)}
                </div>
            );
        };

        let repayTitle = (
            <div className="repayment-title">
                <span className="repayment-title-label">{Intl.get('contract.97', '回款计划')}:</span>
            </div>
        );

        return (
            <DetailCard
                content={content()}
                titleBottomBorderNone={noRepaymentData}
                titleDescr={noRepaymentData ? Intl.get('contract.195', '还未添加回款计划') : ''}
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
    updateScrollBar: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepaymentPlan: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(RepaymentPlan);

