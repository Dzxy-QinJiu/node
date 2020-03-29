/**
 * Created by wangliping on 2017/9/20.
 */
import { Form, DatePicker, InputNumber, Select, Radio, Input } from 'antd';
import PropTypes from 'prop-types';
import language from 'PUB_DIR/language/getLanguage';
const { TextArea } = Input;
const Option = Select.Option;
import AppUserAjax from 'MOD_DIR/app_user_manage/public/ajax/app-user-ajax';
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import { APPLY_TYPES ,TIMERANGEUNIT} from 'PUB_DIR/sources/utils/consts';
import {getDelayTimeUnit, isCustomDelayType} from 'PUB_DIR/sources/utils/common-method-util';
import { getApplyActiveEmailTip } from '../../utils/crm-util';
const UNCHANGED_TYPE = 'unchanged';//保持不变的用户类型
class CrmUserApplyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitStateData();
    }

    getInitStateData() {
        return {
            formData: {
                //延迟时间输入框，默认是1
                delayTimeNumber: 1,
                //延期时间范围，默认是天
                delayTimeRange: TIMERANGEUNIT.DAY,
                // 到期时间(选择到期时间)
                delayDeadlineTime: moment().endOf('day').valueOf(),
                user_type: UNCHANGED_TYPE,
                //到期不变
                over_draft: '0',
                //销售申请的备注
                remark: {
                    //延期备注
                    delayRemark: '',
                    //启用、停用备注
                    statusRemark: '',
                    //修改密码备注
                    passwordRemark: '',
                    //修改其他类型的备注
                    otherRemark: ''
                }
            },
            isApplying: false,//正在申请中
            applyErrorMsg: ''//申请报错的提示
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.applyType !== nextProps.applyType) {
            this.setState(this.getInitStateData());
        }
    }

    //延期时间数字改变
    delayTimeNumberChange(value) {
        let formData = this.state.formData;
        formData.delayTimeNumber = value;
        this.setState({ formData: formData });
    }

    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(value) {
        let timestamp = value && value.endOf('day').valueOf() || '';
        let formData = this.state.formData;
        formData.delayDeadlineTime = timestamp;
        this.setState({ formData: formData });
    }

    // 设置不可选时间的范围
    setDisabledDate(current) {
        return current && current.valueOf() < Date.now();
    }

    //备注信息修改
    remarkChange(field, event) {
        let formData = this.state.formData;
        formData.remark[field] = event.target.value;
        this.setState({ formData: formData });
    }

    //延期时间范围改变
    delayTimeRangeChange(value, text) {
        let formData = this.state.formData;
        formData.delayTimeRange = value;
        this.setState({ formData: formData });
    }

    radioValueChange(field, event) {
        let value = event.target.value;
        let formData = this.state.formData;
        formData[field] = value;
        this.setState({ formData: formData });
    }
    //用户类型的修改
    onUserTypeChange(event){
        let formData = this.state.formData;
        formData.user_type = event.target.value;
        this.setState({formData});
    }

    //申请延期的数据处理
    getDelayData() {
        let formData = this.state.formData;
        let submitObj = {
            apply_type: APPLY_TYPES.DELAY,
            customer_id: _.get(this.props.crmUserList,'[0].customer.customer_id'),
        };
        const paramItem = {};
        if (isCustomDelayType(formData.delayTimeRange)) {
            paramItem.end_date = formData.delayDeadlineTime;
        } else {
            //向data中添加delay字段
            paramItem.delay_time = getDelayTimeUnit(formData.delayTimeRange, formData.delayTimeNumber);
        }
        //向data中添加备注
        submitObj.remark = this.state.formData.remark.delayRemark;
        //到期是否停用
        paramItem.over_draft = Number(formData.over_draft);
        //用户类型，如果保持不变，就不需要传
        if(formData.user_type !== UNCHANGED_TYPE){
            paramItem.user_type = formData.user_type;
        }

        submitObj.users_or_grants = this.getSelectedUserMultiAppData().map(x => {
            if(paramItem.delay_time){
                delete x.end_date;
                delete x.begin_date;
            }
            return {
                ...x,
                ...paramItem
            };
        });

        return submitObj;
    }

    //申请延期的数据提交
    submitDelayData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮(申请延期)');
        let submitObj = this.getDelayData();
        //销售提交申请延期
        this.setState({ isApplying: true });
        AppUserAjax.applyDelayMultiApp({
            // usePromise: true,
            data: submitObj
        }).then((result) => {
            if (result) {
                this.setState({ isApplying: false });
                this.props.closeApplyPanel();
            } else {
                this.setState({ isApplying: false, applyErrorMsg: Intl.get('user.apply.delay.failed', '申请延期失败') });
            }
        }).catch((errMsg) => {
            this.setState({ isApplying: false, applyErrorMsg: errMsg || Intl.get('user.apply.delay.failed', '申请延期失败') });
        });
    }

    getSelectedUsers() {
        //选中的用户
        let selectedUsers = [];
        if (_.isArray(this.props.crmUserList) && this.props.crmUserList.length) {
            selectedUsers = _.filter(this.props.crmUserList, (userObj) => {
                //选择的用户
                if (userObj && userObj.user && userObj.user.checked) {
                    return true;
                }
                //选择的应用
                if (userObj && _.isArray(userObj.apps) && userObj.apps.length) {
                    let checkedApp = _.find(userObj.apps, app => app.checked);
                    if (checkedApp) {
                        return true;
                    }
                }
            });
        }
        return selectedUsers;
    }

    //获取选择的用户及其应用相关的数据
    getSelectedUserAppData() {
        let selectedUsers = this.getSelectedUsers();
        //客户名 用户名 添加应用名 用户id
        let selectedAppId = [], user_ids = [];
        _.each(selectedUsers, (obj) => {
            user_ids.push(obj.user.user_id);
            //选择的应用
            if (obj && _.isArray(obj.apps) && obj.apps.length) {
                _.each(obj.apps, app => {
                    if (app.checked) {
                        selectedAppId.push(app.app_id);
                    }
                });
            }
        });
        return {
            application_ids: JSON.stringify(selectedAppId),
            user_ids: user_ids
        };
    }

    //获取选择的用户及其应用相关的数据(多个应用)
    getSelectedUserMultiAppData() {
        let appArr = [];
        this.props.crmUserList.forEach(user => {
            if (user.apps && user.apps.length > 0) {
                user.apps.forEach(app => {
                    if (app.checked) {
                        appArr.push(({
                            'client_id': app.app_id,
                            'user_id': user.user.user_id,
                            'user_name': user.user.user_name,
                            'nickname': user.user.nick_name,
                            'client_name': app.app_name,
                            'end_date': app.end_time,
                            'begin_date': app.start_time
                        }));
                    }
                });
            }
        });
        return appArr;
    }

    // 申请停用
    submitStopUseData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮(申请停用)');
        const users_or_grants = this.getSelectedUserMultiAppData().map(x => {
            const item = x;
            delete item.end_date;
            delete item.begin_date;
            return {
                ...x,
                status: 0
            };
        });
        const submitObj = {
            apply_type: APPLY_TYPES.DISABLE,
            customer_id: _.get(this.props.crmUserList,'[0].customer.customer_id'),
            remark: this.state.formData.remark.statusRemark,
            users_or_grants
        };

        this.setState({ isApplying: true });
        //调用申请修改开通状态
        AppUserAjax.applyDelayMultiApp({
            // usePromise: true,
            data: submitObj
        }).then((result) => {
            this.setState({ isApplying: false });
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({ applyErrorMsg: Intl.get('user.apply.status.failed', '申请修改开通状态失败') });
            }
        }).catch((errMsg) => {
            this.setState({ isApplying: false, applyErrorMsg: errMsg || Intl.get('user.apply.status.failed', '申请修改开通状态失败')});
        });
    }

    //申请修改密码
    submitEditPasswordData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮(申请修改密码)');
        const selectedUserAppData = this.getSelectedUserAppData();
        //todo 修改修改密码
        const submitObj = {
            apply_type: APPLY_TYPES.APPLY_PWD_CHANGE,
            customer_id: _.get(this.props.crmUserList,'[0].customer.customer_id'),
            user_ids: selectedUserAppData.user_ids,
            remark: this.state.formData.remark.passwordRemark
        };
        this.setState({ isApplying: true });
        //调用修改密码
        AppUserAjax.applyChangePasswordAndOther(submitObj).then((result) => {
            this.setState({ isApplying: false });
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({ applyErrorMsg: Intl.get('user.apply.password.failed', '申请修改密码失败') });
            }
        }, (errorMsg) => {
            this.setState({ isApplying: false, applyErrorMsg: errorMsg || Intl.get('user.apply.password.failed', '申请修改密码失败') });
        });
    }

    //申请其他类型的修改
    submitEditOtherData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮(申请其他类型的修改)');
        let selectedUserAppData = this.getSelectedUserMultiAppData();
        const apps = _.map(selectedUserAppData, item => {
            delete item.end_date;
            delete item.begin_date;
            return item;
        });
        let userIds = _.map(selectedUserAppData, 'user_id');
        const submitObj = {
            apply_type: APPLY_TYPES.APPLY_STH_ELSE,
            customer_id: _.get(this.props.crmUserList,'[0].customer.customer_id'),
            user_ids: userIds,
            remark: this.state.formData.remark.otherRemark,
            users_or_grants: apps
        };
        this.setState({ isApplying: true });
        //调用修改其他类型的申请
        AppUserAjax.applyChangePasswordAndOther(submitObj).then((result) => {
            this.setState({ isApplying: false });
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({ applyErrorMsg: Intl.get('user.apply.password.failed', '申请其他类型的修改失败') });
            }
        }, (errorMsg) => {
            this.setState({ isApplying: false, applyErrorMsg: errorMsg || Intl.get('user.apply.password.failed', '申请其他类型的修改失败') });
        });
    }

    handleSubmit() {
        if (this.state.isApplying) {
            return;
        }
        const APPLY_TYPES = this.props.APPLY_TYPES;
        const applyType = this.props.applyType;
        //申请延期
        if (applyType === APPLY_TYPES.DELAY) {
            this.submitDelayData();
        } else if (applyType === APPLY_TYPES.STOP_USE) {
            //申请停用
            this.submitStopUseData();
        } else if (applyType === APPLY_TYPES.EDIT_PASSWORD) {
            //申请修改密码
            this.submitEditPasswordData();
        } else if (applyType === APPLY_TYPES.OTHER) {
            //申请其他类型的修改
            this.submitEditOtherData();
        }
    }

    renderDelayForm() {
        let divWidth = (language.lan() === 'zh') ? '80px' : '74px';
        let label = '';
        let formData = this.state.formData;
        var customDelayType = isCustomDelayType(formData.delayTimeRange);
        if (customDelayType) {
            label = Intl.get('user.time.end', '到期时间');
        } else {
            label = Intl.get('common.delay.time', '延期时间');
        }
        const formItemLayout = {
            colon: false,
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        return (
            <Form>
                <div className="delay_time_form">
                    <FormItem
                        label={label}
                        {...formItemLayout}
                    >
                        {customDelayType ? (
                            <DatePicker placeholder={Intl.get('my.app.change.expire.time.placeholder', '请选择到期时间')}
                                onChange={this.setDelayDeadlineTime.bind(this)}
                                disabledDate={this.setDisabledDate}
                                defaultValue={moment(formData.delayDeadlineTime)}
                                allowClear={false}
                                showToday={false}
                            />
                        ) : (
                            <InputNumber
                                value={formData.delayTimeNumber}
                                onChange={this.delayTimeNumberChange.bind(this)}
                                style={{ width: '80px', height: '30px' }}
                                min={1}
                                max={10000}
                            />
                        )}

                        <Select
                            value={formData.delayTimeRange}
                            style={{ width: divWidth }}
                            onChange={this.delayTimeRangeChange.bind(this)}
                        >
                            <Option value={TIMERANGEUNIT.DAY}>{Intl.get('common.time.unit.day', '天')}</Option>
                            <Option value={TIMERANGEUNIT.WEEK}>{Intl.get('common.time.unit.week', '周')}</Option>
                            <Option value={TIMERANGEUNIT.MONTH}>{Intl.get('common.time.unit.month', '月')}</Option>
                            <Option value={TIMERANGEUNIT.YEAR}>{Intl.get('common.time.unit.year', '年')}</Option>
                            <Option value={TIMERANGEUNIT.CUSTOM}>{Intl.get('user.time.custom', '自定义')}</Option>
                        </Select>
                    </FormItem>
                </div>
                <FormItem
                    label={Intl.get('user.expire.select', '到期可选')}
                    {...formItemLayout}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this, 'over_draft')}
                        value={formData.over_draft}>
                        <Radio key="1" value="1">{Intl.get('user.status.stop', '停用')}</Radio>
                        <Radio key="2" value="2">{Intl.get('user.status.degrade', '降级')}</Radio>
                        <Radio key="0" value="0">{Intl.get('user.status.immutability', '不变')}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('user.user.type', '用户类型')}
                >
                    <RadioGroup onChange={this.onUserTypeChange.bind(this)}
                        value={formData.user_type}>
                        <Radio key="try" value={Intl.get('common.trial.user', '试用用户')}>
                            {Intl.get('common.trial.user', '试用用户')}
                        </Radio>
                        <Radio key="formal" value={Intl.get('common.trial.official', '正式用户')}>
                            {Intl.get('user.signed.user', '签约用户')}
                        </Radio>
                        <Radio key={UNCHANGED_TYPE} value={UNCHANGED_TYPE}>
                            <span title={Intl.get('common.apply.user.type.unchanged.tip', '延期后不改变原有的用户类型')}>
                                {Intl.get('common.apply.user.type.unchanged', '保持不变')}
                            </span>
                        </Radio>
                    </RadioGroup>
                </FormItem>
                {/*申请延期要填备注，批量延期不需要填备注*/}
                <FormItem
                    label={Intl.get('common.remark', '备注')}
                    {...formItemLayout}
                >
                    <TextArea
                        placeholder={Intl.get('user.remark.write.tip', '请填写备注')}
                        autosize={{ minRows: 2, maxRows: 6 }}
                        onChange={this.remarkChange.bind(this, 'delayRemark')}
                        value={formData.remark.delayRemark}
                    />
                </FormItem>
            </Form>
        );
    }

    //停用及修改密码的备注表单
    renderRemarkForm(key, placeholder) {
        return (
            <form>
                <FormItem
                    wrapperCol={{ span: 24 }}
                >
                    <TextArea
                        placeholder={placeholder}
                        value={this.state.formData.remark[key]}
                        autosize={{ minRows: 2, maxRows: 6 }}
                        onChange={this.remarkChange.bind(this, key)}
                    />
                </FormItem>
            </form>
        );
    }

    closeApplyPanel() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击取消按钮');
        this.props.closeApplyPanel();
    }

    renderApplyForm() {
        const APPLY_TYPES = this.props.APPLY_TYPES;
        const applyType = this.props.applyType;
        let applyForm = null;
        switch (applyType) {
            case APPLY_TYPES.DELAY:
                applyForm = this.renderDelayForm();
                break;
            case APPLY_TYPES.STOP_USE:
                applyForm = this.renderRemarkForm('statusRemark', Intl.get('crm.apply.stop.placeholder', '请输入停用的原因'));
                break;
            case APPLY_TYPES.EDIT_PASSWORD:
                applyForm = this.renderRemarkForm('passwordRemark', Intl.get('crm.apply.update.password.placeholder', '请输入修改密码的要求'));
                break;
            case APPLY_TYPES.OTHER:
                applyForm = this.renderRemarkForm('otherRemark', Intl.get('crm.apply.other.placeholder', '请输入申请内容'));
                break;
        }
        return applyForm;
    }

    render() {
        return (
            <DetailCard
                className="crm-user-apply-form-container"
                content={this.renderApplyForm()}
                isEdit={true}
                loading={this.state.isApplying}
                saveErrorMsg={getApplyActiveEmailTip(this.state.applyErrorMsg)}
                handleSubmit={this.handleSubmit.bind(this)}
                handleCancel={this.closeApplyPanel.bind(this)}
                okBtnText={Intl.get('common.sure', '确定')}
            />);
    }
}
CrmUserApplyForm.defaultProps = {
    APPLY_TYPES: {},
    applyType: '',
    crmUserList: [],
    closeApplyPanel: function() {
    },
};
CrmUserApplyForm.propTypes = {
    APPLY_TYPES: PropTypes.object,
    applyType: PropTypes.string,
    crmUserList: PropTypes.array,
    closeApplyPanel: PropTypes.func
};
export default CrmUserApplyForm;
