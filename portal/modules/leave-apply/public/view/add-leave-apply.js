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
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import {calculateTotalTimeRange,calculateRangeType} from 'PUB_DIR/sources/utils/common-data-util';
import { LEAVE_TYPE } from 'PUB_DIR/sources/utils/consts';
var LeaveApplyAction = require('../action/leave-apply-action');
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {DELAY_TIME_RANGE, LEAVE_TIME_RANGE,AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
class AddLeaveApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                begin_time: moment().valueOf(),//请假开始时间
                begin_type: '',//请假开始的类型
                end_time: moment().valueOf(),//请假结束时间
                end_type: '',//请假结束的类型
                total_range: '',//总的请假时长
            },
        };
    }

    componentDidMount() {
        var newSetting = calculateRangeType();
        var formData = this.state.formData;
        for (var key in newSetting){
            formData[key] = newSetting[key];
        }
        this.updateFormData(formData);
        this.addLabelRequiredCls();
    }
    updateFormData = (formData) => {
        this.setState({
            formData: formData
        },() => {
            this.calculateTotalLeaveRange();
        });
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }
    addLabelRequiredCls() {
        if (!$('.add-leave-apply-form-wrap form .require-item label').hasClass('ant-form-item-required')) {
            $('.add-leave-apply-form-wrap form .require-item label').addClass('ant-form-item-required');
        }
    }
    hideLeaveApplyAddForm = (data) => {
        this.props.hideLeaveApplyAddForm(data);
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
            values = _.cloneDeep(values);
            var formData = this.state.formData;
            if (err) return;
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            values.apply_time = [{
                start: moment(values.begin_time).format(oplateConsts.DATE_FORMAT) + `_${formData.begin_type}`,
                end: moment(values.end_time).format(oplateConsts.DATE_FORMAT) + `_${formData.end_type}`,
            }];
            //增加出差时长
            values.condition = {
                condition: formData.total_range
            };
            delete values.begin_time;
            delete values.end_time;
            delete values.total_range;
            delete values.begin_type;
            delete values.end_type;
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/leave_apply/list',
                dataType: 'json',
                type: 'post',
                data: values,
                success: (data) => {
                    if (data){
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        this.hideLeaveApplyAddForm(data);
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
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
    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(timeType) {
        return (rule, value, callback) => {
            // 如果没有值，则没有错误
            if (!value) {
                callback();
                return;
            }
            const formData = this.state.formData;
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
                    }else if (moment(endTime).isSame(begin_time,'day') && formData.begin_type === AM_AND_PM.PM && formData.end_type === AM_AND_PM.AM){
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
        const formDataLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        let saveResult = this.state.saveResult;
        return (
            <RightPanel showFlag={true} data-tracename="添加请假申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加请假申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('leave.apply.leave.application', '请假申请')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-leave-apply-form">
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
                                                format="YYYY-MM-DD"
                                                onChange={this.onBeginTimeChange}
                                                value={formData.begin_time ? moment(formData.begin_time) : moment()}
                                            />
                                        )}
                                        {getFieldDecorator('begin_type', {initialValue: formData.begin_type})(
                                            <Select
                                                getPopupContainer={() => document.getElementById('add-leave-apply-form')}
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
                                                format="YYYY-MM-DD"
                                                onChange={this.onEndTimeChange}
                                                value={formData.end_time ? moment(formData.end_time) : moment()}
                                            />
                                        )}
                                        {getFieldDecorator('end_type', {initialValue: formData.end_type})(
                                            <Select
                                                getPopupContainer={() => document.getElementById('add-leave-apply-form')}
                                                onChange={this.handleChangeEndRange}
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
                                            label={Intl.get('apply.approve.total.leave.time','请假时长')}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('total_range')(
                                                <div className="total-range">
                                                    {Intl.get('weekly.report.n.days', '{n}天',{n: formData.total_range})}
                                                </div>
                                            )}
                                        </FormItem>
                                        : null}
                                    <FormItem
                                        label={Intl.get('leave.apply.leave.type','请假类型')}
                                        id="leave_type"
                                        {...formItemLayout}
                                    >
                                        {
                                            getFieldDecorator('leave_type',{
                                                rules: [{required: true, message: Intl.get('leave.apply.select.at.least.one.type','请选择至少一个请假类型')}],
                                            })(
                                                <Select
                                                    placeholder={Intl.get('leave.apply.select.leave.type','请选择请假类型')}
                                                    name="leave_type"
                                                    getPopupContainer={() => document.getElementById('add-leave-apply-form')}

                                                >
                                                    {_.isArray(LEAVE_TYPE) && LEAVE_TYPE.length ?
                                                        LEAVE_TYPE.map((leaveItem, idx) => {
                                                            return (<Option key={idx} value={leaveItem.value}>{leaveItem.name}</Option>);
                                                        }) : null
                                                    }
                                                </Select>
                                            )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('leave.apply.leave.reason','请假原因')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('reason', {
                                            rules: [{required: true, message: Intl.get('leave.apply.fill.in.leave.reason','请填写请假原因')}]

                                        })(
                                            <Input
                                                type="textarea" id="reason" rows="3"
                                                placeholder={Intl.get('leave.apply.fill.in.leave.reason','请填写请假原因')}
                                            />
                                        )}
                                    </FormItem>
                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.isSaving} data-tracename="点击保存添加
                                            请假申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideLeaveApplyAddForm}
                                            data-tracename="点击取消添加请假申请按钮">
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