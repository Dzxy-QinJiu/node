/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';

require('../css/add-business-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;

const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
import DynamicAddDelCustomersTime from 'CMP_DIR/dynamic-add-delete-customers-time';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import {
    checkCustomerTotalLeaveTime,
    getStartEndTimeOfDiffRange,
    getTimeWithSecondZero
} from 'PUB_DIR/sources/utils/common-method-util';
import {calculateTotalTimeInterval, calculateTimeIntervalByMillSecond} from 'PUB_DIR/sources/utils/common-data-util';

import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

class AddBusinessWhile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            search_customer_name: '',
            formData: {
                begin_time: moment().startOf('day').add(8,'hour').add(30,'minute').valueOf(),//外出开始时间默认当天8:30
                end_time: moment().startOf('day').add(17,'hour').add(30,'minute').valueOf(),//外出结束时间默认当天17:30
                while_date: moment().valueOf(),
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
    onBusinessWhileChange = (date) => {
        var formData = this.state.formData;
        formData.while_date = getTimeWithSecondZero(date);
        this.setState({
            formData: formData
        });
    };
    //修改每个客户的外出时间后，计算总的外出时长
    handleCustomersChange = (customers) => {
        let formData = this.state.formData;
        formData.customers = customers;
        //计算具体的外出时间，不同的外出时间计算
        var total_range = 0, cloneCustomers = _.map(customers, item => {
            return {
                visit_start_time: item.visit_start_time,
                visit_end_time: item.visit_end_time
            };
        });
        //先过滤掉相同的时间的
        cloneCustomers = _.unionWith(cloneCustomers, _.isEqual);
        var customerTime = [];
        _.each(cloneCustomers,(item,index) => {
            if(index === 0){
                customerTime.push(item);
            }else{
                //判断开始和结束时间和之前的时间是否有交叉的情况
                var targetObj = _.find(customerTime,timeItem => (item.visit_start_time >= timeItem.visit_start_time && item.visit_start_time < timeItem.visit_end_time) || (item.visit_end_time > timeItem.visit_start_time && item.visit_end_time <= timeItem.visit_end_time));
                if(targetObj){
                    if(item.visit_start_time >= targetObj.visit_start_time && item.visit_start_time < targetObj.visit_end_time){
                        if(targetObj.visit_end_time <= item.visit_end_time){
                            targetObj.visit_end_time = item.visit_end_time;
                        }
                    }
                    if(item.visit_end_time > targetObj.visit_start_time && item.visit_end_time <= targetObj.visit_end_time){
                        if(targetObj.visit_start_time >= item.visit_start_time){
                            targetObj.visit_start_time = item.visit_start_time;
                        }
                    }
                }else{
                    //是否包含之前的时间
                    var timeObj = _.find(customerTime,timeItem => (item.visit_start_time <= timeItem.visit_start_time && item.visit_end_time >= timeItem.visit_end_time) );
                    if(timeObj){
                        timeObj.visit_start_time = item.visit_start_time;
                        timeObj.visit_end_time = item.visit_end_time;
                    }else{
                        customerTime.push(item);
                    }
                }
            }
        });
        _.each(customerTime,item => {
            total_range += (item.visit_end_time - item.visit_start_time);
        });
        formData.total_range = calculateTimeIntervalByMillSecond(total_range);
        this.setState({formData});
    };
    calculateTotalLeaveRange = () => {
        var formData = this.state.formData;
        formData.total_range = calculateTotalTimeInterval(formData);
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
            submitObj.apply_time = [{//开始和结束时间算所有客户中的最早时间和最晚时间
                start: moment(_.chain(formData.customers).map('visit_start_time').min().value()).format(oplateConsts.DATE_TIME_FORMAT),
                end: moment(_.chain(formData.customers).map('visit_end_time').max().value()).format(oplateConsts.DATE_TIME_FORMAT)
            }];
            var hasNoAddress = false;
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
                if(!customerItem.province && !customerItem.city && !customerItem.county){
                    hasNoAddress = true;
                }
                //传入每个客户的外出时间
                if (customerItem.visit_start_time && customerItem.visit_end_time) {
                    submitCustomerItem.visit_time = {
                        start: moment(customerItem.visit_start_time).format(oplateConsts.DATE_TIME_FORMAT),
                        end: moment(customerItem.visit_end_time).format(oplateConsts.DATE_TIME_FORMAT)
                    };
                } else {
                    submitCustomerItem.visit_time = _.get(submitObj, 'apply_time[0]');
                }
                if (customerItem['remarks']) {
                    submitObj.reason = (submitObj.reason || '') + customerItem['remarks'];
                }
                submitObj.customers.push(submitCustomerItem);
            });
            //外出的地址是必填项
            if(hasNoAddress){
                this.setResultData(Intl.get('business.leave.time.is.required', '外出地域是必填项'), 'error');
                return;
            }
            // //校验外出的时间
            // const checkCustomerTimeBeforeSubmit = checkCustomerTotalLeaveTime(values.begin_time,values.end_time,formData.customers);
            // if(_.get(checkCustomerTimeBeforeSubmit,'errTip')){
            //     this.setResultData(_.get(checkCustomerTimeBeforeSubmit,'errTip'), 'error');
            //     return;
            // }

            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/businesswhile/apply',
                dataType: 'json',
                type: 'post',
                data: submitObj,
                success: (data) => {
                    if (data) {
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
                        this.hideBusinessApplyAddForm(data);
                    } else {
                        this.setResultData(errTip, 'error');
                    }
                },
                error: (xhr) => {
                    if (xhr.responseJSON && _.isString(xhr.responseJSON)) {
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
            <RightPanel showFlag={true} data-tracename="添加外出申请" className="add-away-apply-container">
                <span className="iconfont icon-close add—leave-apply-close-btn" onClick={this.hideBusinessApplyAddForm}
                    data-tracename="关闭添加外出申请面板"></span>
                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('apply.leave.while.application.work.flow', '外出申请')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' id="leave-apply-form">
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                        label={Intl.get('crm.146', '日期')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('while_date', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get('contract.42', '请选择日期')
                                            },],
                                            initialValue: moment(formData.while_date)
                                        })(
                                            <DatePicker
                                                showTime={{format: oplateConsts.DATE_FORMAT }}
                                                type='time'
                                                format={oplateConsts.DATE_FORMAT}
                                                onChange={this.onBusinessWhileChange}
                                                value={formData.while_date ? moment(formData.while_date) : moment()}
                                            />
                                        )}
                                    </FormItem>
                                    {formData.total_range ?
                                        <FormItem
                                            className="form-item-label add-apply-time"
                                            label={Intl.get('user.duration', '时长')}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('total_range')(
                                                <div className="total-range">
                                                    {formData.total_range}
                                                </div>
                                            )}
                                        </FormItem>
                                        : null}
                                    <div className='position-wrap'>
                                        <div className='position-lable ant-form-item-required'>{Intl.get('user.info.login.address', '地点')}：</div>
                                        <DynamicAddDelCustomersTime
                                            className='while-apply-position'
                                            addAssignedCustomer={this.addAssignedCustomer}
                                            form={this.props.form}
                                            handleCustomersChange={this.handleCustomersChange}
                                            initialVisitStartTime={formData.begin_time}
                                            initialVisitEndTime={formData.end_time}
                                            isRequired={false}
                                            while_date={formData.while_date}
                                        />
                                    </div>
                                    <div className="submit-button-container" >
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

AddBusinessWhile.defaultProps = {
    hideBusinessApplyAddForm: function() {
    },
    form: {}
};
AddBusinessWhile.propTypes = {
    hideBusinessApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddBusinessWhile);
