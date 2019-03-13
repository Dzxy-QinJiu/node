/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Icon, Spin, Button, Popconfirm, Alert } from 'antd';

import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import 'MOD_DIR/user_manage/public/css/user-info.less';
var AlertTimer = require('CMP_DIR/alert-timer');
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { OPERATE, PRIVILEGE_MAP, DISPLAY_TYPES, OPERATE_INFO } from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import {parseAmount} from 'LIB_DIR/func';
import RepeymentPlanForm from '../components/repeyment-plan-form';

class RepaymentPlan extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);

        return {
            formData: this.getInitialFormData(),
            repayPlanLists: this.getList(props.contract),
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
                currentRepayment: {},
                repayPlanLists: this.getList(nextProps.contract)
            });
        }
    }

    getList(contract) {
        let repayments = _.sortBy(_.cloneDeep(_.get(contract,'repayments',[])), item => item.date).reverse();
        return _.filter(repayments,item => item.type === 'repay_plan');
    }
    getUpdateLists() {
        let propLists = this.getList(this.props.contract);
        let Lists;
        // 需要判断列表中是否有添加项
        // 有：合并并更新
        // 没有: 直接覆盖
        let addItem = _.filter(_.get(this.state,'repayPlanLists',[]), item => item.isAdd);
        if(addItem) {
            Lists = [...addItem,...propLists];
        }else {
            Lists = propLists;
        }
        return Lists;
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
            this.setState({
                displayType: type
            }, () => {
                this.props.updateScrollBar();
            });
        }
    }
    handleSubmit = (type, id, data) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加回款计划');
        let _this = this;
        let saveObj = {};
        if (type === DISPLAY_TYPES.DELETE) {
            saveObj = [id];
            const successFunc = () => {
                this.setState({
                    repayPlanLists: this.getUpdateLists(),
                    repayPlanLoading: false,
                    submitErrorMsg: ''
                },() => {
                    this.props.updateScrollBar();
                });
            };
            const errorFunc = (errorMsg) => {
                this.setState({ repayPlanLoading: false, submitErrorMsg: errorMsg });
            };
            this.editRepayment(type, saveObj,'', successFunc, errorFunc);
        } else if(type === DISPLAY_TYPES.ADD){
            this.setState({ repayPlanLoading: true });
            const params = {contractId: this.props.contract.id, type: 'repay_plan'};
            saveObj = data;
            let newState = {
                repayPlanLoading: false,
                submitErrorMsg: '',
                currentRepayment: {},
            };
            let successFunc;

            if(!_.isEmpty(saveObj.repay_type)) {// 更新
                type = saveObj.repay_type;
                delete saveObj.repay_type;

                successFunc = () => {
                    newState.repayPlanLists = this.getUpdateLists();
                    _this.setState(newState, () => {
                        this.props.updateScrollBar();
                    });
                };
            }else {// 添加
                successFunc = () => {
                    newState.repayPlanLists = this.getList(this.props.contract);
                    newState.displayType = DISPLAY_TYPES.TEXT;
                    _this.setState(newState, () => {
                        this.props.updateScrollBar();
                    });
                };
            }

            const errorFunc = (errorMsg) => {
                _this.setState({
                    repayPlanLoading: false,
                    submitErrorMsg: errorMsg
                });
            };
            this.editRepayment(type, saveObj, params, successFunc, errorFunc);
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
                message.success(OPERATE_INFO[type].success);
                //返回数据
                let resultData = result.result;

                //删除的时候没有返回数据，需要根据id从当前回款列表中取
                if (type === DISPLAY_TYPES.DELETE) {
                    const repaymentId = data[0];
                    resultData = _.find(this.props.contract.repayments, repayment => repayment.id === repaymentId);
                } else if(type === DISPLAY_TYPES.UPDATE) { // 更新后没有返回id，
                    let currentRepayment = _.cloneDeep(this.state.currentRepayment);
                    delete currentRepayment.isEditting;
                    resultData = _.extend(currentRepayment, resultData);
                }
                //刷新合同列表中的回款信息
                this.props.refreshCurrentContractRepaymentPlan(type, resultData);

                if (_.isFunction(successFunc)) successFunc();
            } else {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type].faild);
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type].faild);
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    handleDeleteRepayment = (repayment, e) => {
        Trace.traceEvent(e, '点击删除回款计划按钮');
        this.setState({
            repayPlanLoading: true
        }, () => {
            this.handleSubmit(DISPLAY_TYPES.DELETE, repayment.id);
        });
    };
    // 修改某项编辑状态
    setEditable(repayment, e) {
        Trace.traceEvent(e, '点击编辑回款计划按钮');
        let {formData, repayPlanLists} = this.state;
        formData = this.getInitialFormData();
        if(_.isNil(repayment.isAdd)){
            formData.repay_type = DISPLAY_TYPES.UPDATE;
        }
        formData.num = moment(repayment.date).startOf('day').diff(moment(this.props.contract.date).startOf('day'), formData.unit);
        formData.amount = repayment.amount;
        formData.date = repayment.date;

        _.each(repayPlanLists, item => {
            item.isEditting = item.id === repayment.id;
        });
        this.setState({
            repayPlanLists,
            currentRepayment: repayment,
            formData,
            submitErrorMsg: ''
        });
    }
    // 点击添加按钮
    addList = () => {
        let repayments = this.getList(this.props.contract);
        repayments.unshift({
            id: '',
            amount: 0,
            date: moment().valueOf(),
            isEditting: true, //是否可编辑
            isAdd: true, // 是否是添加
        });
        this.setState({
            formData: this.getInitialFormData(),
            repayPlanLists: repayments,
            displayType: DISPLAY_TYPES.EDIT,
            submitErrorMsg: ''
        });
    };
    save(repayment) {
        this.repeymentPlanRef.getValidatedValue((err,value) => {
            if(err) return false;
            this.handleSubmit(DISPLAY_TYPES.ADD,'', value);
        });
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存对汇款计划列表的修改');
    }
    cancel(repayment) {
        // 这里判断是添加项取消，还是编辑项取消
        // 是：添加项取消，需要删除添加项，
        // 否：编辑项不变
        let repayPlanLists = this.state.repayPlanLists;
        let displayType = this.state.displayType;
        let isAdd = !_.isNil(repayment.isAdd);
        if(isAdd) {
            repayPlanLists = _.filter(repayPlanLists, item => !item.isAdd);
            displayType = DISPLAY_TYPES.TEXT;
        }else {
            repayPlanLists = _.map(repayPlanLists, item => {
                item.isEditting = false;
                return item;
            });
        }

        this.setState({
            formData: this.getInitialFormData(),
            repayPlanLists,
            displayType
        });
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对汇款计划列表的修改');
    }
    getAmount(repayment) {
        let repayments = this.state.repayPlanLists;
        //合同额
        const contractAmount = _.get(this, 'props.contract.contract_amount',0);
        //已添加的回款总额
        let repaymentsAmount = 0;

        if (repayments.length) {
            repaymentsAmount = _.reduce(repayments, (memo, item) => {
                // 过滤掉单个添加的，和当前项
                const num = item.isAdd || repayment.id === item.id ? 0 : parseFloat(item.amount);
                return memo + num;
            }, 0);
        }
        return { contractAmount, repaymentsAmount };
    }
    // 渲染编辑操作按钮
    renderBtnBlock(repayment) {
        /*是否可编辑*/
        if(repayment.isEditting){
            return (
                <span className='float-r'>
                    <Button
                        shape="circle"
                        title={Intl.get('common.save', '保存')}
                        className="btn-save"
                        onClick={() => this.save(repayment)}
                        icon='save'
                    />
                    <Button
                        shape="circle"
                        className="btn-cancel"
                        title={Intl.get('common.cancel', '取消')}
                        onClick={() => this.cancel(repayment)}
                        icon='cross'
                    />
                </span>
            );
        }else {
            return (
                <span>
                    {repayment.isAdd ? null : <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`} onConfirm={this.handleDeleteRepayment.bind(this, repayment)}>
                        <span className="btn-bar"
                            title={Intl.get('common.delete', '删除')}>
                            <Icon type="close" theme="outlined" />
                        </span>
                    </Popconfirm>}
                    <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={(e) => {
                        this.setEditable(repayment ,e);
                    }}/>
                </span>
            );
        }
    }
    // 渲染回款计划单项信息
    renderPlanInfo(repayment) {
        // 是否编辑
        if(repayment.isEditting) {
            return this.renderAddRepaymentPanel(repayment);
        }else {
            const date = this.props.contract.date;
            let timeInterval = moment(repayment.date).startOf('day').diff(moment(date).startOf('day'), 'days');
            return (
                <span>
                    {Intl.get('contract.238', '从签订日起{time}日内({date})前,应收回款{amount}元',{
                        time: timeInterval,
                        date: moment(repayment.date).format(oplateConsts.DATE_FORMAT),
                        amount: parseAmount(repayment.amount)
                    })}
                </span>
            );
        }
    }
    // 渲染添加和编辑时的form表单
    renderAddRepaymentPanel(repayment) {
        const amount = this.getAmount(repayment);

        return (
            <RepeymentPlanForm
                wrappedComponentRef={ref => this.repeymentPlanRef = ref}
                signDate={this.props.contract.date}
                contractAmount={amount.contractAmount}
                repaymentsAmount={amount.repaymentsAmount}
                formData={this.state.formData}
            />
        );
    }
    // 渲染回款计划里列表
    renderRepaymentList() {
        let repayPlanLists = this.state.repayPlanLists;
        if(repayPlanLists.length > 0) {
            return (
                <div className="finance-list">
                    <Spin spinning={this.state.repayPlanLoading}>
                        <ul>
                            {repayPlanLists.map((repayment, index) => {
                                let classname = classNames('finance-list-item');
                                return (
                                    <li key={index} className={classname}>
                                        {this.renderPlanInfo(repayment)}
                                        {this.renderBtnBlock(repayment)}
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
        let repayPlanLists = this.state.repayPlanLists;
        const noRepaymentData = !repayPlanLists.length && !this.state.loading;
        const contract_amount = _.get(this.props.contract,'contract_amount',0);
        //已添加的回款总额
        let repaymentsAmount = 0;

        if (repayPlanLists.length) {
            repaymentsAmount = _.reduce(repayPlanLists, (memo, item) => {
                // 过滤掉单个添加的
                const num = item.isAdd ? 0 : parseFloat(item.amount);
                return memo + num;
            }, 0);
        }


        const content = () => {
            //能否添加回款计划，是展示状态，且有权限编辑，且合同总额大于已回款总额
            const hasAddPrivilege = this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege && contract_amount > repaymentsAmount;
            return (
                <div className="repayment-list">
                    {hasAddPrivilege ? (
                        <span className="iconfont icon-add detail-edit-add" onClick={this.addList}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {this.renderRepaymentList()}
                    {this.state.submitErrorMsg ? <AlertTimer time={4000} type="error" message={this.state.submitErrorMsg} showIcon onHide={() => {
                        this.setState({
                            submitErrorMsg: ''
                        });
                    }} /> : null}
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
    refreshCurrentContractRepaymentPlan: PropTypes.func
};
module.exports = RepaymentPlan;

