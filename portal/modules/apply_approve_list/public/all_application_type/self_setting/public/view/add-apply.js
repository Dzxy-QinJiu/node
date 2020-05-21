/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-self-setting-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
import {
    applyComponentsType,
    ADDAPPLYFORMCOMPONENTS,
    getAllWorkFlowList
} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {ALL_COMPONENTS, SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import {DELAY_TIME_RANGE, LEAVE_TIME_RANGE,AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
import classNames from 'classnames';
import ApplyApproveAjax from 'MOD_DIR/common/public/ajax/apply-approve';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
class AddApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            formData: {
                customer: {id: '', name: ''},
            },
            saveApplyLoading: false,
            workFlowList: [],//配置过的申请审批列表
        };
    }

    componentDidMount() {
        this.addLabelRequiredCls();
        getAllWorkFlowList((workFlowList) => {
            this.setState({
                workFlowList: workFlowList
            });
        });
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err){
                return;
            }
            values = _.cloneDeep(values);
            values['customers'] = [_.get(this.state, 'formData.customer')];
            let customizForm = this.getCustomizeForm();
            var customerTarget = _.find(customizForm,item => item.component_type === ALL_COMPONENTS.CUSTOMERSEARCH);
            var userTarget = _.find(customizForm,item => item.component_type === ALL_COMPONENTS.USER_SEARCH);
            if (_.get(customerTarget,'is_required') && !_.get(values, 'customers[0].id')){
                return;
            }
            let {selectUserId,selectUserName,selectNickName} = this.state;
            if (_.get(userTarget,'is_required') && !selectUserId){
                return;
            }
            values['managers'] = [{
                id: selectUserId,
                nick_name: selectNickName,
                user_name: selectUserName,
            }];
            //时间周期的数据统一
            for (var key in values){
                if (_.get(values[key],'begin_time')){
                    values[key]['begin_time'] = moment(_.get(values[key],'begin_time')).format(oplateConsts.DATE_FORMAT) + `_${_.get(values[key],'begin_type')}`;
                }
                if (_.get(values[key],'end_time')){
                    values[key]['end_time'] = moment(_.get(values[key],'end_time')).format(oplateConsts.DATE_FORMAT) + `_${_.get(values[key],'end_type')}`;
                }
                if (_.get(values[key],'date_time')){
                    values[key]['date_time'] = moment(_.get(values[key],'date_time')).format(oplateConsts.DATE_FORMAT);
                }
                delete values[key]['begin_type'];
                delete values[key]['end_type'];
            }
            this.setState({
                saveApplyLoading: true,
            });

            ApplyApproveAjax.addSelfSettingApply().sendRequest({'detail': values,'type': this.props.addWorkFlowType}).success((result) => {
                //添加成功
                this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                //添加完后的处理
                result.afterAddReplySuccess = true;
                result.showCancelBtn = true;
                this.hideApplyAddForm(result);
            }).error((result) => {
                this.setResultData(result, 'error');
            });
        });
    };
    //保存结果的处理
    setResultData(saveMsg, saveResult) {
        this.setState({
            saveApplyLoading: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }
    hideApplyAddForm = (result) => {
        this.props.hideApplyAddForm(result);
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
    getCustomizeForm = () => {
        var workConfig = _.find(this.state.workFlowList,item => item.type === this.props.addWorkFlowType);
        let customizForm = [];
        if(workConfig){
            customizForm = workConfig.customiz_form;
        }
        return customizForm;
    };
    handleOptionChange = (userData) => {
        this.setState({
            selectUserId: _.split(userData, '&&')[0],
            selectNickName: _.split(userData, '&&')[1],
            selectUserName: _.split(userData, '&&')[2]
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
        var workConfig = _.find(this.state.workFlowList,item => item.type === this.props.addWorkFlowType);
        let customizForm = this.getCustomizeForm();
        return (
            <RightPanel showFlag={true} data-tracename="添加自定义的申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideApplyAddForm}
                    data-tracename="关闭添加自定义申请面板"></span>
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
                                        if (target.component_type === ALL_COMPONENTS.DATETIME){//时间组件要按type类型进行区分
                                            target = _.find(ADDAPPLYFORMCOMPONENTS, item => item.type === _.get(formItem, 'type'));
                                        }
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
                                            } else if (target.component_type === ALL_COMPONENTS.USER_SEARCH) {
                                                return <ApplyComponent {...propertyObj} form={this.props.form} handleOptionChange={this.handleOptionChange}/>;
                                            }else{
                                                return <ApplyComponent {...propertyObj} form={this.props.form}/>;
                                            }

                                        }
                                    })}
                                    <div className="submit-button-container">
                                        <SaveCancelButton loading={this.state.saveApplyLoading}
                                            saveErrorMsg={this.state.saveMsg}
                                            saveSuccessMsg={this.state.saveMsg}
                                            handleSubmit={this.handleSubmit}
                                            handleCancel={this.hideApplyAddForm}
                                            hideSaveTooltip={this.hideSaveTooltip}
                                            saveResult={saveResult}
                                            errorShowTime={DELAY_TIME_RANGE.ERROR_RANGE}
                                        />
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
AddApply.defaultProps = {
    hideApplyAddForm: function() {
    }

};
AddApply.propTypes = {
    hideApplyAddForm: PropTypes.func,
    form: PropTypes.object,
    addWorkFlowType: PropTypes.string,
};
export default Form.create()(AddApply);
