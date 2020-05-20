/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('./index.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select, Upload,Radio} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
import AlertTimer from 'CMP_DIR/alert-timer';
import {APPLY_APPROVE_TYPES, DELAY_TIME_RANGE, FILES_LIMIT,OTHER_REPORT,CHARGE_MODE} from 'PUB_DIR/sources/utils/consts';
import {uniteFileSize} from 'PUB_DIR/sources/utils/common-method-util';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import Trace from 'LIB_DIR/trace';
import UploadAndDeleteFile from 'CMP_DIR/apply-components/upload-and-delete-file';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

class AddReportSendApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            fileList: [],
            formData: {
                customer: {id: '', name: ''},//客户的信息
                expect_submit_time: moment().valueOf(),//预计成交时间
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

    hideApplyAddForm = (data) => {
        this.props.hideApplyAddForm(data);
    };
    hideCustomerRequiredTip = (flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
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
            if (err) return;
            if (!_.get(this.state, 'formData.customer.id')) {
                return;
            }
            values['expect_submit_time'] = moment(values['expect_submit_time']).valueOf();
            values['customer'] = JSON.stringify(_.get(this.state, 'formData.customer'));
            const formData = new FormData();
            var fileList = this.state.fileList;
            //是否有上传过文件
            if (_.isArray(fileList) && fileList.length){
                fileList.forEach((file) => {
                    formData.append('files', file);
                });
            }
            //其他表单的提交项
            if(values.report_type === OTHER_REPORT){//如果选中的是其他的舆情报告类型，就不需要传收费模式字段
                values.charge_mode = 'free';
            }
            _.forEach(values, (value, key) => {
                formData.append(key,value);
            });
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/opinionreport/list',
                contentType: false, // 注意这里应设为false
                processData: false,
                cache: false,
                type: 'post',
                data: formData,
                success: (data) => {
                    if(data){
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
                        this.hideApplyAddForm(data);
                        _.isFunction(this.props.afterAddApplySuccess) && this.props.afterAddApplySuccess(data);
                    }else{
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

    onExpectTimeChange = (date, dateString) => {
        var formData = this.state.formData;
        formData.expect_submit_time = moment(date).valueOf();
        this.setState({
            formData: formData
        });
    };
    checkCustomerName = (rule, value, callback) => {
        value = _.trim(_.get(this.state, 'formData.customer.id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };
    customerChoosen = (selectedCustomer) => {
        var formData = this.state.formData;
        formData.customer.id = selectedCustomer.id;
        formData.customer.name = selectedCustomer.name;
        this.setState({
            formData: formData
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
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
    //添加客户成功事件
    afterAddCustomer = (result) => {
        let customerSuggestRef = this.customerSuggestRef;
        if(customerSuggestRef) {
            _.each(result, item => {
                item.customer_name = item.name;
                item.customer_id = item.id;
            });
            customerSuggestRef.setCustomer(result, _.get(result,'[0].id',''));
        }
    };
    //渲染添加客户内容
    renderAddCustomer = () => {
        let customerName = _.get(this.state.formData,'customer.name');
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                formData={{
                    name: customerName
                }}
                afterAddCustomer={this.afterAddCustomer}
            />
        );
    };
    beforeUpload = (file) => {
        this.setState(({fileList}) => ({
            fileList: [...fileList, file],
        }));
        return false;
    };
    fileRemove=(file) => {
        var fileList = this.state.fileList;
        const index = fileList.indexOf(file);
        fileList.splice(index, 1);
        this.setState(
            {
                fileList: fileList
            }
        );
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
        var fileList = uniteFileSize(this.state.fileList);
        var isReportType = this.props.applyAjaxType === APPLY_APPROVE_TYPES.REPORT;
        var typeDesc = isReportType ? '舆情报告' : '文件撰写';
        return (
            <RightPanel showFlag={true} data-tracename={`添加${typeDesc}申请`} className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideApplyAddForm}
                    data-tracename={`关闭添加${typeDesc}舆情报告申请面板`}></span>
                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={this.props.titleType}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' className="sales-clue-form" id="add-leave-apply-form">
                                    <FormItem
                                        label={this.props.applyLabel}
                                        id={this.props.addType}
                                        {...formItemLayout}
                                    >
                                        {
                                            getFieldDecorator(this.props.addType, {
                                                rules: [{required: true, message: this.props.selectTip}],
                                            })(
                                                <Select
                                                    placeholder={this.props.selectPlaceholder}
                                                    name={this.props.addType}
                                                    getPopupContainer={() => document.getElementById('add-leave-apply-form')}

                                                >
                                                    {_.isArray(this.props.applyType) && this.props.applyType.length ?
                                                        this.props.applyType.map((reportItem, idx) => {
                                                            return (<Option key={idx}
                                                                value={reportItem.value}>{reportItem.name}</Option>);
                                                        }) : null
                                                    }
                                                </Select>
                                            )}
                                    </FormItem>
                                    {/*只有舆情报告申请，并且舆情报告的类型不是其他的时候才才加上这个条件*/}
                                    {isReportType && getFieldValue(this.props.addType) !== OTHER_REPORT ? <FormItem
                                        className="form-item-label"
                                        label={Intl.get('apply.approved.charge.mode', '收费模式')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('charge_mode',{
                                            initialValue: 'free',
                                        })(
                                            <Radio.Group>
                                                {_.map(CHARGE_MODE,mode => {
                                                    return <Radio value={_.get(mode,'value')}>{_.get(mode,'name')}</Radio>;
                                                })}
                                            </Radio.Group>
                                        )}
                                    </FormItem> : null}

                                    <FormItem
                                        className="form-item-label require-item"
                                        label={Intl.get('call.record.customer', '客户')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('customer', {
                                            rules: [{validator: _this.checkCustomerName}],
                                            initialValue: '',
                                            validateTrigger: 'onBlur'
                                        })(
                                            <CustomerSuggest
                                                ref={ref => this.customerSuggestRef = ref}
                                                field='customer'
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
                                                hideCustomerRequiredTip={this.hideCustomerRequiredTip}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                        label={Intl.get('apply.approve.expect.submit.time', '期望提交时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('expect_submit_time', {
                                            initialValue: moment()
                                        })(
                                            <DatePicker
                                                showTime={{format: 'HH:mm'}}
                                                format="YYYY-MM-DD HH:mm"
                                                onChange={this.onExpectTimeChange}
                                                value={formData.expect_submit_time ? moment(formData.expect_submit_time) : moment()}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('common.remark', '备注')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('remarks', {
                                            initialValue: ''
                                        })(
                                            <Input
                                                type="textarea" id="remarks" rows="3"
                                                placeholder={this.props.remarkPlaceholder}
                                            />
                                        )}
                                    </FormItem>
                                    <UploadAndDeleteFile
                                        beforeUpload = {this.beforeUpload}
                                        fileList={fileList}
                                        fileRemove={this.fileRemove}
                                        uploadAndDeletePrivilege={FILES_LIMIT.TOTAL}
                                    />
                                    <div className="submit-button-container">
                                        <SaveCancelButton loading={this.state.isSaving}
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
AddReportSendApply.defaultProps = {
    hideApplyAddForm: function() {
    },
    form: {},
    applyAjaxType: '',
    afterAddApplySuccess: function() {

    },
    titleType: '',
    applyLabel: '',
    addType: '',
    applyType: [],
    selectTip: '',
    selectPlaceholder: '',
    remarkPlaceholder: '',
};
AddReportSendApply.propTypes = {
    hideApplyAddForm: PropTypes.func,
    form: PropTypes.object,
    applyAjaxType: PropTypes.string,
    afterAddApplySuccess: PropTypes.func,
    titleType: PropTypes.string,
    applyLabel: PropTypes.string,
    addType: PropTypes.string,
    selectTip: PropTypes.string,
    selectPlaceholder: PropTypes.string,
    remarkPlaceholder: PropTypes.string,
    applyType: PropTypes.object,
};
export default Form.create()(AddReportSendApply);
