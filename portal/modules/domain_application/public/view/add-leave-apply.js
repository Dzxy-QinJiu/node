/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-leave-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
var user = require('PUB_DIR/sources/user-data').getUserData();
import { ADDAPPLYFORMCOMPONENTS} from '../../../apply_approve_manage/public/utils/apply-approve-utils';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {ALL_COMPONENTS, SELF_SETTING_FLOW,checkDomainName} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import leaveStore from '../store/leave-apply-store';
import LeaveApplyAction from '../action/leave-apply-action';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
class AddLeaveApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            formData: {
                customer: {id: '', name: ''},
            },
            ...leaveStore.getState()
        };
    }
    onStoreChange = () => {
        this.setState(leaveStore.getState());
    };
    componentDidMount() {
        leaveStore.listen(this.onStoreChange);
        this.addLabelRequiredCls();
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }
    componentWillUnmount() {
        leaveStore.unlisten(this.onStoreChange);
    }



    handleSubmit = (e) => {

        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err){
                return;
            }
            values = _.cloneDeep(values);
            values['customers'] = [_.get(this.state, 'formData.customer')];
            if (!_.get(values, 'customers[0].id')){
                return;
            }
            LeaveApplyAction.addSelfSettingApply({'detail': values,'type': SELF_SETTING_FLOW.DOMAINAPPLY},(result) => {
                if (!_.isString(result)){
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.hideLeaveApplyAddForm();
                    //添加完后的处理
                    result.afterAddReplySuccess = true;
                    result.showCancelBtn = true;
                    LeaveApplyAction.afterAddApplySuccess(result);
                }else{
                    this.setResultData(result, 'error');
                }

            });
        });
    };
    //保存结果的处理
    setResultData(saveMsg, saveResult) {
        this.setState({
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }
    hideLeaveApplyAddForm = () => {
        this.props.hideLeaveApplyAddForm();
    };
    checkCustomerName = (rule, value, callback) => {
        value = _.trim(_.get(this.state, 'formData.customer.id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };
    addAssignedCustomer = () => {
        this.setState({
            isShowAddCustomer: true
        });
    };
    //关闭添加面板
    hideAddForm = () => {
        this.setState({
            isShowAddCustomer: false
        });
    };
    //添加完成后关闭面板
    addOne = () => {
        this.setState({
            isShowAddCustomer: false
        });
    }
    //渲染添加客户内容
    renderAddCustomer = () => {
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                addOne = {this.addOne}
            />
        );
    };

    customerChoosen = (key, selectedCustomer) => {
        var formData = this.state.formData;
        formData.customer.id = selectedCustomer.id;
        formData.customer.name = selectedCustomer.name;
        this.setState({
            formData: formData
        }, () => {
            this.props.form.validateFields([key], {force: true});
        });
    };
    addLabelRequiredCls() {
        if (!$('.add-leave-apply-form-wrap form .require-item label').hasClass('ant-form-item-required')) {
            $('.add-leave-apply-form-wrap form .require-item label').addClass('ant-form-item-required');
        }
    }
    hideCustomerRequiredTip = (key, flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        },() => {
            this.props.form.validateFields([key], {force: true});
        });
    };
    render() {
        var formData = this.state.formData;
        var _this = this;
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        let saveResult = this.state.saveResult;
        var workConfig = _.find(_.get(user, 'workFlowConfigs',[]),item => item.type === SELF_SETTING_FLOW.DOMAINAPPLY);
        var customizForm = workConfig.customiz_form;
        return (
            <RightPanel showFlag={true} data-tracename="添加域名申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加域名申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={_.get(workConfig,'description')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-leave-apply-form">
                                    {_.map(customizForm,(formItem,index) => {
                                        var target = _.find(ADDAPPLYFORMCOMPONENTS, item => item.component_type === _.get(formItem, 'component_type'));
                                        if (target){
                                            var ApplyComponent = target.component;
                                            var propertyObj = _.assign({}, target, formItem);
                                            propertyObj['formItemKey'] = propertyObj['key'];
                                            if (target.component_type === ALL_COMPONENTS.CUSTOMERSEARCH){
                                                return (
                                                    <FormItem
                                                        className="form-item-label require-item"
                                                        label={_.get(propertyObj,'title')}
                                                        {...formItemLayout}
                                                    >
                                                        {getFieldDecorator(propertyObj['key'], {
                                                            rules: [{validator: _this.checkCustomerName}],
                                                            initialValue: ''
                                                        })(
                                                            <ApplyComponent
                                                                field='customer'
                                                                hasEditPrivilege={true}
                                                                displayText={''}
                                                                displayType={'edit'}
                                                                id={''}
                                                                show_error={this.state.isShowCustomerError}
                                                                noJumpToCrm={true}
                                                                customer_name={''}
                                                                customer_id={''}
                                                                addAssignedCustomer={_this.addAssignedCustomer}
                                                                noDataTip={Intl.get('clue.has.no.data', '暂无')}
                                                                hideButtonBlock={true}
                                                                customerChoosen={_this.customerChoosen.bind(_this, propertyObj['key'])}
                                                                required={true}
                                                                hideCustomerRequiredTip={_this.hideCustomerRequiredTip.bind(_this,propertyObj['key'])}
                                                            />
                                                        )}
                                                    </FormItem>
                                                );

                                            }else{
                                                //todo 只能暂时这样加校验规则
                                                if(target.component_type === ALL_COMPONENTS.INPUT && propertyObj.is_required){
                                                    return <ApplyComponent {...propertyObj} form={this.props.form} validator={checkDomainName}/>;
                                                }else{
                                                    return <ApplyComponent {...propertyObj} form={this.props.form}/>;
                                                }

                                            }

                                        }
                                    })}

                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.saveApply.loading} data-tracename="点击保存添加
                                            域名申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.saveApply.loading ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideLeaveApplyAddForm}
                                            data-tracename="点击取消添加域名申请按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer
                                                        time={saveResult === 'error' ? DELAY_TIME_RANGE.ERROR_RANGE : DELAY_TIME_RANGE.SUCCESS_RANGE}
                                                        message={this.state.saveMsg}
                                                        type={saveResult} showIcon
                                                        onHide={this.hideSaveTooltip}/>
                                                ) : ''
                                            }
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </GeminiScrollbar>
                        {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
                    </div>
                </div>
            </RightPanel>

        );
    }
}
AddLeaveApply.defaultProps = {
    hideLeaveApplyAddForm: function() {
    },
};
AddLeaveApply.propTypes = {
    hideLeaveApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddLeaveApply);