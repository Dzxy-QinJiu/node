/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-leave-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input} from 'antd';
const FormItem = Form.Item;
import DatePicker from 'CMP_DIR/datepicker';
const FORMLAYOUT = {
    PADDINGTOTAL: 70
};
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
// import CustomerSuggest from 'MOD_DIR/app_user_manage/public/views/customer_suggest/customer_suggest';
var user = require('../../../../public/sources/user-data').getUserData();
const ADD_LEAVE_CUSTOMER_SUGGEST_ID = 'add-leave-customer-suggest-wrap';
class AddLeaveApply extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search_customer_name: '',
            formData: {
                begin_time: '',//出差开始时间
                end_time: '',//出差结束时间
                customer_id: '',
                customer_name: '',
                reason: '',
                milestone: '',
            }
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
    }
    onSelectDate = () => {

    }
    onCustomerChoosen = () => {

    }
    hideCustomerError = () => {

    };
    addAssignedCustomer = () => {
        this.setState({
            isShowAddCustomer: true
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
                                                disableDateAfterToday={true}
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
                                        {getFieldDecorator('leave_person', {
                                            rules: [{
                                                required: true,
                                            }],
                                            initialValue: ''
                                        })(
                                            <CustomerSuggest
                                                field='leave_person'
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
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('leave.apply.add.leave.reason', '出差事由')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('reason', {
                                            initialValue: Intl.get('customer.visit.customer', '拜访客户')
                                        })(
                                            <Input
                                                type="textarea" id="reason" rows="3"
                                            />
                                        )}
                                    </FormItem>
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