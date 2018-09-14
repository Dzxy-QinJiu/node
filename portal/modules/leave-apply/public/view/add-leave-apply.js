/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-leave-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon,message} from 'antd';
const FormItem = Form.Item;
import DatePicker from 'CMP_DIR/datepicker';
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
const INITIALDESC = Intl.get('customer.visit.customer', '拜访客户');
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
// import CustomerSuggest from 'MOD_DIR/app_user_manage/public/views/customer_suggest/customer_suggest';
var user = require('../../../../public/sources/user-data').getUserData();
const ADD_LEAVE_CUSTOMER_SUGGEST_ID = 'add-leave-customer-suggest-wrap';
const DEFAULTTIMETYPE = 'day';
var DateSelectorUtils = require('CMP_DIR/datepicker/utils');
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
var leaveApplyAction = require('../action/leave-apply-action');
import AlertTimer from 'CMP_DIR/alert-timer';
class AddLeaveApply extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = getStartEndTimeOfDiffRange(DEFAULTTIMETYPE, true);
        this.state = {
            search_customer_name: '',
            formData: {
                begin_time: DateSelectorUtils.getMilliseconds(timeRange.start_time),//出差开始时间
                end_time: DateSelectorUtils.getMilliseconds(timeRange.end_time,true),//出差结束时间
                customer_id: '',
                customer_name: '',
                reason: INITIALDESC,
                milestone: '',
            },
        };
    }

    onStoreChange = () => {

    };

    componentDidMount() {


    }

    //获取全部请假申请

    componentWillUnmount() {

    }

    hideLeaveApplyAddForm = () => {
        this.props.hideLeaveApplyAddForm();
    };
    onSelectDate = (start_time, end_time) => {
        var formData = this.state.formData;
        //todo 如果不选时间，时间的默认值是什么
        //如果选择的是全部时间
        if (!start_time) {
            start_time = moment().startOf('year').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('year').valueOf();
        }
        formData.begin_time = start_time;
        formData.end_time = end_time;
        this.setState({formData: formData});
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
        setTimeout(() => {
            this.props.hideLeaveApplyAddForm();
        }, 1000);

    };
    //保存结果的处理
    setResultData(saveMsg, saveResult) {
        this.setState({
            isSaving: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var formData = this.state.formData;
            if (err) return;
            if (!formData.customer_id){
                message.error(Intl.get('leave.apply.select.customer','请先选择客户'));
                return;
            }
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            if (values.reason){
                formData.reason = values.reason;
            }
            $.ajax({
                url: '/rest/add/apply/list',
                dataType: 'json',
                type: 'post',
                data: formData,
                success: (data) => {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.hideLeaveApplyAddForm();
                },
                error: (errorMsg) => {
                    this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
                }
            });
        });
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
    //渲染添加客户内容
    renderAddCustomer = () => {
        var phoneNum = this.state.curClue ? this.state.curClue.contact_way : '';
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
            />
        );
    };
    customerChoosen = (selectedCustomer) => {
        var formData = this.state.formData;
        formData.customer_name = selectedCustomer.name;
        formData.customer_id = selectedCustomer.id;
        formData.milestone = selectedCustomer.address;
        this.setState({
            formData: formData
        });
    };

    render() {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 19},
            },
        };
        var formData = this.state.formData;
        let saveResult = this.state.saveResult;
        return (
            <RightPanel showFlag={true} data-tracename="添加出差申请" className="add-leave-apply-container">
                <span className="iconfont icon-close add—leave-apply-close-btn" onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加出差申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('leave.apply.add.leave.apply', '出差申请')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="leave-apply-form">
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('leave.apply.add.leave.time', '出差时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('leave_time_range', {
                                            rules: [{
                                                required: true,
                                            }],
                                            initialValue: moment()
                                        })(
                                            <DatePicker
                                                range="day"
                                                onSelect={this.onSelectDate}>
                                                <DatePicker.Option
                                                    value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                                <DatePicker.Option
                                                    value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                                <DatePicker.Option
                                                    value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                                <DatePicker.Option
                                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                                <DatePicker.Option
                                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                                <DatePicker.Option
                                                    value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                                            </DatePicker>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('leave.apply.add.leave.person', '出差人员')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('leave_person', {
                                            initialValue: user.nick_name
                                        })(
                                            <Input disabled/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('call.record.customer', '客户')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('leave_for_customer', {
                                            // rules: [{
                                            //     required: true,
                                            // }],
                                            initialValue: ''
                                        })(
                                            <CustomerSuggest
                                                field='leave_for_customer'
                                                hasEditPrivilege={true}
                                                displayText={''}
                                                displayType={'edit'}
                                                id={''}
                                                show_error={this.state.isShowCustomerError}
                                                noJumpToCrm={true}
                                                customer_name={''}
                                                customer_id={''}
                                                addAssignedCustomer={this.addAssignedCustomer}
                                                noDataTip={Intl.get('clue.has.no.data', '暂无')}
                                                hideButtonBlock={true}
                                                customerChoosen={this.customerChoosen}

                                            />
                                        )}
                                        {formData.milestone ? <span className="customer-milestone">{formData.milestone}</span> : null}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('leave.apply.add.leave.reason', '出差事由')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('reason', {
                                            initialValue: INITIALDESC
                                        })(
                                            <Input
                                                type="textarea" id="reason" rows="3"
                                            />
                                        )}
                                    </FormItem>
                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.isSaving} data-tracename="点击保存添加
                                            出差申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideLeaveApplyAddForm}
                                            data-tracename="点击取消添加出差申请按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer time={saveResult === 'error' ? 3000 : 600}
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
    form: {}
};
AddLeaveApply.propTypes = {
    hideLeaveApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddLeaveApply);