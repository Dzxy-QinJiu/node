/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-business-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker,Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
import DynamicAddDelCustomers from 'CMP_DIR/dynamic-add-delete-customers';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
const DEFAULTTIMETYPE = 'day';
var DateSelectorUtils = require('CMP_DIR/datepicker/utils');
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import {calculateTotalTimeRange, calculateRangeType} from 'PUB_DIR/sources/utils/common-data-util';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {DELAY_TIME_RANGE,LEAVE_TIME_RANGE,AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
class AddBusinessApply extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = getStartEndTimeOfDiffRange(DEFAULTTIMETYPE, true);
        var newSetting = calculateRangeType();
        this.state = {
            hideCustomerRequiredTip: false,
            search_customer_name: '',
            formData: {
                begin_time: newSetting.begin_time || DateSelectorUtils.getMilliseconds(timeRange.start_time),//出差开始时间
                begin_type: newSetting.begin_type || '',//出差开始的类型
                end_time: newSetting.end_time || DateSelectorUtils.getMilliseconds(timeRange.end_time, true),//出差结束时间
                end_type: newSetting.end_type || '',//出差结束的类型
                reason: '',
                customers: [{
                    id: '',
                    name: '',
                    province: '',
                    city: '',
                    county: '',
                    address: '',
                    remarks: ''
                }
                ]
            },
        };
    }

    componentDidMount() {
        this.calculateTotalLeaveRange();
    }

    componentDidUpdate() {
    }


    hideBusinessApplyAddForm = (data) => {
        this.props.hideBusinessApplyAddForm(data);
    };
    onBeginTimeChange = (date, dateString) => {
        var formData = this.state.formData;
        formData.begin_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.props.form.getFieldValue('end_time')) {
                this.props.form.validateFields(['end_time'], {force: true});
                if (formData.begin_type && formData.end_type){
                    this.calculateTotalLeaveRange();
                }
            }
        });
    };
    onEndTimeChange = (date, dateString) => {
        var formData = this.state.formData;
        formData.end_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.props.form.getFieldValue('begin_time')) {
                this.props.form.validateFields(['begin_time'], {force: true});
                if (formData.begin_type && formData.end_type){
                    this.calculateTotalLeaveRange();
                }
            }
        });
    };
    handleChangeStartRange = (value) => {
        var formData = this.state.formData;
        formData.begin_type = value;
        this.setState({
            formData: formData
        },() => {
            this.props.form.validateFields(['begin_time'], {force: true});
            if (formData.end_type){
                this.calculateTotalLeaveRange();
            }
        });
    };
    handleChangeEndRange = (value) => {
        var formData = this.state.formData;
        formData.end_type = value;
        this.setState({
            formData: formData
        },() => {
            this.props.form.validateFields(['end_time'], {force: true});
            if (formData.begin_type){
                this.calculateTotalLeaveRange();
            }
        });
    };
    calculateTotalLeaveRange = () => {
        var formData = this.state.formData;
        formData.total_range = calculateTotalTimeRange(formData);
        this.setState({
            formData: formData
        });
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
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
            var formData = _.cloneDeep(this.state.formData);
            var submitObj = {
                customers: []
            };
            if (err) return;
            submitObj.apply_time = [{
                start: moment(values.begin_time).format(oplateConsts.DATE_FORMAT) + `_${formData.begin_type}`,
                end: moment(values.end_time).format(oplateConsts.DATE_FORMAT) + `_${formData.end_type}`
            }];
            submitObj.condition = {
                condition: formData.total_range
            };
            _.forEach(formData.customers, (customerItem, index) => {
                var submitCustomerItem = {
                    name: customerItem.name || '',
                    id: customerItem.id || '',
                    province: customerItem.province || '',
                    city: customerItem.city || '',
                    county: customerItem.county || '',
                    address: customerItem.address || '',
                    remarks: customerItem.remarks || '',
                };
                //传入每个客户的拜访时间
                if (customerItem.visit_start_time && customerItem.visit_start_type && customerItem.visit_end_time && customerItem.visit_end_type){
                    submitCustomerItem.visit_time = {
                        start: moment(customerItem.visit_start_time).format(oplateConsts.DATE_FORMAT) + `_${customerItem.visit_start_type}`,
                        end: moment(customerItem.visit_end_time).format(oplateConsts.DATE_FORMAT) + `_${customerItem.visit_end_type}`
                    };
                }else{
                    submitCustomerItem.visit_time = _.get(submitObj,'apply_time[0]');
                }
                if (customerItem['remarks']) {
                    submitObj.reason += customerItem['remarks'];
                }
                submitObj.customers.push(submitCustomerItem);
            });
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/apply/list',
                dataType: 'json',
                type: 'post',
                data: submitObj,
                success: (data) => {
                    if (data){
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
                        this.hideBusinessApplyAddForm(data);

                    }else{
                        this.setResultData(errTip, 'error');
                    }
                },
                error: (xhr) => {
                    if (xhr.responseJSON && _.isString(xhr.responseJSON)){
                        errTip = xhr.responseJSON;
                    }
                    this.setResultData(errTip, 'error');
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
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
            />
        );
    };

    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(timeType) {
        return (rule, value, callback) => {
            // 如果没有值，则没有错误
            if (!value) {
                callback();
                return;
            }
            var formData = this.state.formData;
            const begin_time = formData.begin_time;
            const endTime = formData.end_time;
            const isBeginTime = timeType === 'begin_time' ? true : false;
            if (endTime && begin_time) {
                if (formData.begin_type && formData.end_type){
                    if (moment(endTime).isBefore(begin_time)) {
                        if (isBeginTime) {
                            callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                        } else {
                            callback(Intl.get('contract.end.time.less.than.start.time.warning', '结束时间不能小于起始时间'));
                        }
                    } else if (moment(endTime).isSame(begin_time,'day') && formData.begin_type === AM_AND_PM.PM && formData.end_type === AM_AND_PM.AM){
                        //是同一天的时候，不能开始时间选下午，结束时间选上午
                        callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
                }
            } else {
                callback();
            }
        };
    }


    handleCustomersChange = (customers) => {
        let formData = this.state.formData;
        formData.customers = customers;
        this.setState({formData});
    };

    render() {
        var _this = this;
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
        const disabledDate = function(current) {
            //不允许选择大于当前天的日期
            return current && current.valueOf() < moment().startOf('day');
        };
        var customer = this.state.customer;
        return (
            <RightPanel showFlag={true} data-tracename="添加出差申请" className="add-leave-apply-container">
                <span className="iconfont icon-close add—leave-apply-close-btn" onClick={this.hideBusinessApplyAddForm}
                    data-tracename="关闭添加出差申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('leave.apply.add.leave.apply', '出差申请')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' id="leave-apply-form">
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                        label={Intl.get('contract.120', '开始时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('begin_time', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get('leave.apply.fill.in.start.time','请填写开始时间')
                                            }, {validator: _this.validateStartAndEndTime('begin_time')}],
                                            initialValue: moment(formData.begin_time)
                                        })(
                                            <DatePicker
                                                onChange={this.onBeginTimeChange}
                                                value={formData.begin_time ? moment(formData.begin_time) : moment()}
                                                disabledDate={disabledDate}
                                            />

                                        )}
                                        {getFieldDecorator('begin_type', {initialValue: formData.begin_type})(
                                            <Select
                                                getPopupContainer={() => document.getElementById('leave-apply-form')}
                                                onChange={this.handleChangeStartRange}

                                            >
                                                {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                                                    LEAVE_TIME_RANGE.map((leaveItem, idx) => {
                                                        return (<Option key={idx} value={leaveItem.value}>{leaveItem.name}</Option>);
                                                    }) : null
                                                }
                                            </Select>
                                        )}

                                    </FormItem>
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                        label={Intl.get('contract.105', '结束时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('end_time', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get('leave.apply.fill.in.end.time', '请填写结束时间')
                                            }, {validator: _this.validateStartAndEndTime('end_time')}],
                                            initialValue: moment(formData.end_time)
                                        })(
                                            <DatePicker
                                                onChange={this.onEndTimeChange}
                                                value={formData.end_time ? moment(formData.end_time) : moment()}
                                                disabledDate={disabledDate}
                                            />
                                        )}
                                        {getFieldDecorator('end_type', {initialValue: formData.end_type})(
                                            <Select
                                                getPopupContainer={() => document.getElementById('leave-apply-form')}
                                                onChange={this.handleChangeEndRange}
                                                defaultValue={formData.end_type}
                                            >
                                                {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                                                    LEAVE_TIME_RANGE.map((leaveItem, idx) => {
                                                        return (<Option key={idx} value={leaveItem.value}>{leaveItem.name}</Option>);
                                                    }) : null
                                                }
                                            </Select>
                                        )}

                                    </FormItem>
                                    {formData.total_range ?
                                        <FormItem
                                            className="form-item-label add-apply-time"
                                            label={Intl.get('business.leave.time.range', '出差时长')}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('total_range')(
                                                <div className="total-range">
                                                    {Intl.get('weekly.report.n.days', '{n}天',{n: formData.total_range})}
                                                </div>
                                            )}
                                        </FormItem>
                                        : null}
                                    <DynamicAddDelCustomers
                                        addAssignedCustomer={this.addAssignedCustomer}
                                        form={this.props.form}
                                        handleCustomersChange={this.handleCustomersChange}
                                        initialVisitStartTime={formData.begin_time}
                                        initial_visit_start_type={formData.begin_type}
                                        initialVisitEndTime={formData.end_time}
                                        initial_visit_end_type={formData.end_type}
                                        isRequired={false}
                                    />
                                    <div className="submit-button-container">
                                        <SaveCancelButton loading={this.state.isSaving}
                                            saveErrorMsg={this.state.saveMsg}
                                            saveSuccessMsg={this.state.saveMsg}
                                            handleSubmit={this.handleSubmit}
                                            handleCancel={this.hideBusinessApplyAddForm}
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
AddBusinessApply.defaultProps = {
    hideBusinessApplyAddForm: function() {
    },
    form: {}
};
AddBusinessApply.propTypes = {
    hideBusinessApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddBusinessApply);