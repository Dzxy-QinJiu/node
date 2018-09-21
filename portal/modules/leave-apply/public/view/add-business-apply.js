/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-business-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon,message, DatePicker} from 'antd';
const FormItem = Form.Item;
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
var BusinessApplyAction = require('../action/business-apply-action');
import AlertTimer from 'CMP_DIR/alert-timer';
import {AntcAreaSelection} from 'antc';
import Trace from 'LIB_DIR/trace';
const DELAY_TIME_RANGE = {
    SUCCESS_RANGE: 600 ,
    ERROR_RANGE: 3000,
    CLOSE_RANGE: 500
};
class AddBusinessApply extends React.Component {
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
                reason: '',
                milestone: '',
                province: '',
                city: '',
                county: '',
                address: '',
                customers: [{
                    id: '',
                }

                ]
            },
        };
    }

    onStoreChange = () => {

    };

    componentDidMount() {
        this.addLabelRequiredCls();
    }

    //获取全部请假申请

    componentWillUnmount() {

    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }
    addLabelRequiredCls(){
        if (!$('.add-leave-apply-form-wrap form .customer-name label').hasClass('ant-form-item-required')){
            $('.add-leave-apply-form-wrap form .customer-name label').addClass('ant-form-item-required');
        }
    }


    hideBusinessApplyAddForm = () => {
        this.props.hideBusinessApplyAddForm();
    };
    onBeginTimeChange = (date, dateString) => {
        var formData = this.state.formData;
        formData.begin_time = moment(date).valueOf();
        this.setState({
            formData: formData
        },() => {
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
        },() => {
            if (this.props.form.getFieldValue('begin_time')) {
                this.props.form.validateFields(['begin_time'], {force: true});
            }
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
            if (err) return;
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            if (values.reason){
                formData.reason = values.reason;
            }
            if (values.address){
                formData.address = values.address;
            }
            //拼接出差地址
            let addressItem = ['province','city','county','address'];
            _.forEach(addressItem,(key) => {
                if (formData[key]){
                    formData.milestone += formData[key];
                }
                delete formData[key];
            });
            $.ajax({
                url: '/rest/add/apply/list',
                dataType: 'json',
                type: 'post',
                data: formData,
                success: (data) => {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    setTimeout(() => {
                        this.hideBusinessApplyAddForm();
                        //todo 添加完后的处理
                        // BusinessApplyAction.afterAddApplySuccess(data);
                    },DELAY_TIME_RANGE.CLOSE_RANGE);
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
        formData.province = selectedCustomer.province;
        formData.city = selectedCustomer.city;
        formData.county = selectedCustomer.county;
        formData.address = selectedCustomer.address;
        this.setState({
            formData: formData
        },() => {
            this.props.form.validateFields(['leave_for_customer'], {force: true});
        });
    };
    checkCustomerName = (rule, value, callback) => {
        value = $.trim(_.get(this.state, 'formData.customer_id'));
        if (!value) {
            callback(new Error(Intl.get('leave.apply.select.customer','请先选择客户')));
        }else{
            callback();
        }
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
                    callback();
                }
            } else {
                callback();
            }
        };
    }

    //更新地址
    updateLocation = (addressObj) => {
        let formData = this.state.formData;
        formData.province = addressObj.provName || '';
        formData.city = addressObj.cityName || '';
        formData.county = addressObj.countyName || '';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item'), '选择地址');
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
            return current && current.valueOf() < Date.now();
        };
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
                                <Form layout='horizontal' className="sales-clue-form" id="leave-apply-form">
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('contract.120', '开始时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('begin_time', {
                                            rules: [{
                                                required: true,
                                            },{validator: _this.validateStartAndEndTime('begin_time')}],
                                            initialValue: moment()
                                        })(
                                            <DatePicker
                                                onChange={this.onBeginTimeChange}
                                                value={formData.begin_time ? moment(formData.begin_time) : moment()}
                                                disabledDate={disabledDate}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('contract.105', '结束时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('end_time', {
                                            rules: [{
                                                required: true,
                                            },{validator: _this.validateStartAndEndTime('end_time')}],
                                            initialValue: moment()
                                        })(
                                            <DatePicker
                                                onChange={this.onEndTimeChange}
                                                value={formData.end_time ? moment(formData.end_time) : moment()}
                                                disabledDate={disabledDate}
                                            />
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
                                        className="form-item-label customer-name"
                                        label={Intl.get('call.record.customer', '客户')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('leave_for_customer', {
                                            rules: [{validator: _this.checkCustomerName}],
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
                                                required={true}
                                            />
                                        )}

                                    </FormItem>
                                    <AntcAreaSelection labelCol="5" wrapperCol="19" width="100%"
                                        colon={false}
                                        label={Intl.get('crm.96', '地域')}
                                        placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                                        provName={formData.province} cityName={formData.city}
                                        countyName={formData.county} updateLocation={this.updateLocation}/>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('realm.address', '地址')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('address', {
                                            initialValue: formData.address
                                        })(
                                            <Input
                                                name="address"
                                                placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('common.remark', '备注')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('reason', {
                                            initialValue: ''
                                        })(
                                            <Input
                                                type="textarea" id="reason" rows="3"
                                                placeholder={Intl.get('leave.apply.fill.leave.reason','请填写出差事由')}
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
                                        <Button className="cancel-btn" onClick={this.hideBusinessApplyAddForm}
                                            data-tracename="点击取消添加出差申请按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer time={saveResult === 'error' ? DELAY_TIME_RANGE.ERROR_RANGE : DELAY_TIME_RANGE.SUCCESS_RANGE}
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