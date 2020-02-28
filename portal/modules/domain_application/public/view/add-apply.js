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
import {ADDAPPLYFORMCOMPONENTS} from '../../../apply_approve_manage/public/utils/apply-approve-utils';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {
    ALL_COMPONENTS,
    SELF_SETTING_FLOW,
    checkDomainName,
    checkPlatName
} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import {DELAY_TIME_RANGE, DOMAIN_END} from 'PUB_DIR/sources/utils/consts';
import leaveStore from '../store/leave-apply-store';
import LeaveApplyAction from '../action/leave-apply-action';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import CustomerAjax from '../../../common/public/ajax/customer';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const PAGE_SIZE = 1000;
class AddApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            crmUserList: [],//某个客户对应的用户列表
            selectOptionValue: '',//选中的某个用户
            formData: {
                customer: {id: '', name: ''},
            },
            domainRequiredErrmsg: '',//域名相关信息没写的提示
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
            if (err) {
                return;
            }
            values = _.cloneDeep(values);
            values['customers'] = [_.get(this.state, 'formData.customer')];
            var selectUserId = this.state.selectOptionValue;
            var targetObj = _.find(this.state.crmUserList,item => item.value === selectUserId);
            values['managers'] = [{
                id: selectUserId,
                nick_name: _.get(targetObj,'nick_name',''),
                user_name: _.get(targetObj,'user_name',''),
            }];
            if (!_.get(values, 'customers[0].id')) {
                return;
            }
            //舆情平台域名 舆情平台名称 组织管理员
            //这三个选项至少选一个
            if(!_.get(values,'managers[0].id') && !_.get(values,'customer_sign') && !_.get(values,'display_name')){
                this.setResultData(Intl.get('apply.domain.at.least.one.item', '平台域名，平台名称，组织管理员，至少应写一项!'), 'error');
                return;
            }
            LeaveApplyAction.addSelfSettingApply({
                'detail': values,
                'type': SELF_SETTING_FLOW.DOMAINAPPLY
            }, (result) => {
                if (!_.isString(result)) {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.hideLeaveApplyAddForm(result);
                    //添加完后的处理
                    result.afterAddReplySuccess = true;
                    result.showCancelBtn = true;
                } else {
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
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
    };
    hideLeaveApplyAddForm = (result) => {
        this.props.hideLeaveApplyAddForm(result);
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
    };
    //渲染添加客户内容
    renderAddCustomer = () => {
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                addOne={this.addOne}
            />
        );
    };

    customerChoosen = (key, selectedCustomer) => {
        var formData = this.state.formData;
        formData.customer.id = selectedCustomer.id;
        formData.customer.name = selectedCustomer.name;
        //选择客户后发请求获取该客户对应的用户列表
        if(selectedCustomer.id){
            CustomerAjax.getUserOfCustomer().sendRequest({
                customer_id: selectedCustomer.id,
                id: '',
                page_size: PAGE_SIZE
            }).success((result) => {
                if (_.get(result,'data','[0]')) {
                    var crmUserList = _.map(result.data,'user');
                    _.forEach(crmUserList, item => {
                        item['name'] = item.nick_name;
                        item['value'] = item.user_id;
                    });
                    this.setState({
                        crmUserList: crmUserList
                    });
                } else {
                    this.setState({
                        selectOptionValue: '',
                        crmUserList: []
                    });
                }
            }).error(errMsg => {
                this.setState({
                    selectOptionValue: '',
                    crmUserList: []
                });
            }
            );
        }else{
            this.setState({
                selectOptionValue: '',
                crmUserList: [],
            });
        }
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
        if(!flag){
            this.setState({
                selectOptionValue: ''
            });
        }
        this.setState({
            hideCustomerRequiredTip: flag
        }, () => {
            this.props.form.validateFields([key], {force: true});
        });
    };
    handleOptionChange = (userId) => {
        this.setState({
            selectOptionValue: userId
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
        var workConfig = _.find(_.get(user, 'workFlowConfigs', []), item => item.type === SELF_SETTING_FLOW.DOMAINAPPLY);
        var customizForm = workConfig.customiz_form;
        return (
            <RightPanel showFlag={true} data-tracename="添加舆情平台申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加舆情平台申请面板"></span>
                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={_.get(workConfig, 'description')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-leave-apply-form">
                                    {_.map(customizForm, (formItem, index) => {
                                        var target = _.find(ADDAPPLYFORMCOMPONENTS, item => item.component_type === _.get(formItem, 'component_type'));
                                        if (target) {
                                            var ApplyComponent = target.component;
                                            var propertyObj = _.assign({}, target, formItem);
                                            propertyObj['formItemKey'] = propertyObj['key'];
                                            if (target.component_type === ALL_COMPONENTS.CUSTOMERSEARCH) {
                                                return (
                                                    <FormItem
                                                        className="form-item-label require-item"
                                                        label={_.get(propertyObj, 'title')}
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
                                                                hideCustomerRequiredTip={_this.hideCustomerRequiredTip.bind(_this, propertyObj['key'])}
                                                            />
                                                        )}
                                                    </FormItem>
                                                );

                                            } else {
                                                //todo 只能暂时这样加校验规则
                                                if (target.component_type === ALL_COMPONENTS.INPUT ) {
                                                    if(index === 1){
                                                        return <ApplyComponent {...propertyObj} form={this.props.form} validator={checkDomainName} addonAfter={DOMAIN_END}/>;
                                                    }else if(index === 2){
                                                        return <ApplyComponent {...propertyObj} form={this.props.form} validator={checkPlatName}/>;
                                                    }else{
                                                        return <ApplyComponent {...propertyObj} form={this.props.form}/>;
                                                    }
                                                } else if (target.component_type === ALL_COMPONENTS.USERSEARCH) {
                                                    //如果是下拉框，需要在选完客户后把客户对应的用户传进去
                                                    propertyObj.select_arr = this.state.crmUserList;
                                                    return <ApplyComponent {...propertyObj} form={this.props.form} handleOptionChange={this.handleOptionChange} selectOptionValue={this.state.selectOptionValue}/>;
                                                } else {
                                                    return <ApplyComponent {...propertyObj} form={this.props.form}/>;
                                                }

                                            }

                                        }
                                    })}
                                    <div className="submit-button-container">
                                        <SaveCancelButton loading={this.state.saveApply.loading}
                                            saveErrorMsg={this.state.saveMsg}
                                            saveSuccessMsg={this.state.saveMsg}
                                            handleSubmit={this.handleSubmit}
                                            handleCancel={this.hideLeaveApplyAddForm}
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
    hideLeaveApplyAddForm: function() {
    },
};
AddApply.propTypes = {
    hideLeaveApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddApply);