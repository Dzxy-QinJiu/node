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
import { LEAVE_TYPE } from 'PUB_DIR/sources/utils/consts';
var LeaveApplyAction = require('../action/leave-apply-action');
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
const BEGIN_AND_END_RANGE = {
    begin_time: moment(),
    end_time: moment().add(1,'hours')
};
class AddLeaveApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                begin_time: moment(BEGIN_AND_END_RANGE.begin_time).valueOf(),//请假开始时间
                end_time: moment(BEGIN_AND_END_RANGE.end_time).valueOf(),//请假结束时间
                reason: '',
                leave_type: 'personal_leave'
            },
        };
    }

    componentDidMount() {
        this.addLabelRequiredCls();
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }
    addLabelRequiredCls() {
        if (!$('.add-leave-apply-form-wrap form .require-item label').hasClass('ant-form-item-required')) {
            $('.add-leave-apply-form-wrap form .require-item label').addClass('ant-form-item-required');
        }
    }
    hideLeaveApplyAddForm = () => {
        this.props.hideLeaveApplyAddForm();
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
            if (err) return;
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            values.begin_time = moment(values.begin_time).valueOf();
            values.end_time = moment(values.end_time).valueOf();
            $.ajax({
                url: '/rest/add/leave_apply/list',
                dataType: 'json',
                type: 'post',
                data: values,
                success: (data) => {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.hideLeaveApplyAddForm();
                    //添加完后的处理
                    data.afterAddReplySuccess = true;
                    data.showCancelBtn = true;
                    LeaveApplyAction.afterAddApplySuccess(data);

                },
                error: (errorMsg) => {
                    this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
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
            const begin_time = this.state.formData.begin_time;
            const endTime = this.state.formData.end_time;
            const isBeginTime = timeType === 'begin_time' ? true : false;
            if (endTime && begin_time) {
                if (moment(endTime).isBefore(begin_time)) {
                    if (isBeginTime) {
                        callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                    } else {
                        callback(Intl.get('contract.end.time.less.than.start.time.warning', '结束时间不能小于起始时间'));
                    }
                } else {
                    //结束时间要比开始时间晚至少一个小时
                    if (endTime - begin_time < DELAY_TIME_RANGE.BEGIN_AND_END_RANGE){
                        callback(Intl.get('leave.apply.time.range.at.least.one.hour','开始和结束时间应至少相隔一个小时'));
                    }else{
                        callback();
                    }

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
            }
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
                                            initialValue: BEGIN_AND_END_RANGE.begin_time
                                        })(
                                            <DatePicker
                                                showTime={{ format: 'HH:mm' }}
                                                format="YYYY-MM-DD HH:mm"
                                                onChange={this.onBeginTimeChange}
                                                value={formData.begin_time ? moment(formData.begin_time) : moment()}
                                            />
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
                                            initialValue: BEGIN_AND_END_RANGE.end_time
                                        })(
                                            <DatePicker
                                                showTime={{ format: 'HH:mm' }}
                                                format="YYYY-MM-DD HH:mm"
                                                onChange={this.onEndTimeChange}
                                                value={formData.end_time ? moment(formData.end_time) : moment()}
                                            />
                                        )}
                                    </FormItem>
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