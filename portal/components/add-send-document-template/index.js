/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('./index.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Input, Button, Icon, message, DatePicker, Select, Upload} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
var user = require('PUB_DIR/sources/user-data').getUserData();
import {getStartEndTimeOfDiffRange} from 'PUB_DIR/sources/utils/common-method-util';
import AlertTimer from 'CMP_DIR/alert-timer';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';

class AddReportSendApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            isUpLoading: false,
            uploadFileArrs: [],
            deleteResult: {
                result: '',
                delId: '',//删除申请的id
                errMsg: '',//删除失败后的提示
            },
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

    hideApplyAddForm = () => {
        this.props.hideApplyAddForm();
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
    afterUpload = () => {
        this.setState({
            isUpLoading: false,
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
            values['expect_submit_time'] = moment(values['expect_submit_time']).valueOf();
            values['customer'] = _.get(this.state, 'formData.customer');
            if (!_.get(values, 'customer.id')) {
                return;
            }
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            $.ajax({
                url: '/rest/add/opinionreport/list/' + this.props.applyAjaxType,
                dataType: 'json',
                type: 'post',
                data: values,
                success: (data) => {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.hideApplyAddForm();
                    //添加完后的处理
                    data.afterAddReplySuccess = true;
                    data.showCancelBtn = true;
                    _.isFunction(this.props.afterAddApplySuccess) && this.props.afterAddApplySuccess(data);
                },
                error: (xhr) => {
                    var errTip = Intl.get('crm.154', '添加失败');
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
    //渲染添加客户内容
    renderAddCustomer = () => {
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
            />
        );
    };
    handleChange = (info) => {
        this.setState({isUpLoading: true});
        const response = info.file.response;
        if (info.file.status === 'done') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-reportsend'), '上传报告成功');
            if (response) {
                var uploadFileArrs = this.state.uploadFileArrs;
                //上传成功
                this.setState({
                    uploadFileArrs: uploadFileArrs.push(
                        {
                            fileUploadId: response.file_id,
                            fileUploadName: response.file_name,
                            fileReportId: response.id,
                            fileDirId: response.file_dir_id
                        })
                });
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            }
            this.afterUpload();
        } else if (info.file.status === 'error') {
            message.error(_.isString(response) ? response : Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            this.afterUpload();
        }
    };
    handleDeleteFile = (fileDirId,fileId) => {
        var submitObj = {
            file_dir_id: fileDirId,
            file_id: fileId
        };
        // ReportSendApplyDetailAction.deleteLoadApplyApproveFile(submitObj,()=>{
        //     this.setState({
        //
        //     });
        //
        // });
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
        var props = {
            name: 'reportsend',
            multiple: true,
            action: '/rest/reportsend/upload',
            showUploadList: false,
            onChange: this.handleChange,
        };
        var uploadFileArrs = this.state.uploadFileArrs;
        return (
            <RightPanel showFlag={true} data-tracename="添加舆情报告申请" className="add-leave-container">
                <span className="iconfont icon-close add-leave-apply-close-btn"
                    onClick={this.hideApplyAddForm}
                    data-tracename="关闭添加舆情报告申请面板"></span>
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
                                    <FormItem
                                        className="form-item-label require-item"
                                        label={Intl.get('call.record.customer', '客户')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('customer', {
                                            rules: [{validator: _this.checkCustomerName}],
                                            initialValue: ''
                                        })(
                                            <CustomerSuggest
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
                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                            disabled={this.state.isSaving} data-tracename="点击保存添加
                                            舆情报告申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.hideApplyAddForm}
                                            data-tracename="点击取消添加舆情报告申请按钮">
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
                                    {_.map(uploadFileArrs, (fileItem) => {
                                        const reqData = {
                                            file_dir_id: '',
                                            file_id: '',
                                            file_name: '',
                                        };
                                        return (
                                            <div className="upload-file-name">
                                                {hasPrivilege('DOCUMENT_DOWNLOAD') ?
                                                    <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
                                                <Icon type="close"
                                                    onClick={this.handleDeleteFile.bind(this, fileDirId, fileId)}/>
                                                {/*删除文件失败后的提示*/}
                                                {this.state.deleteResult.errorMsg ?
                                                    <AlertTimer
                                                        time={4000}
                                                        message={this.state.deleteResult.errorMsg}
                                                        type="error"
                                                        showIcon
                                                        onHide={hide}
                                                    /> : null}

                                            </div>
                                        );
                                    })}
                                    {hasPrivilege('DOCUMENT_UPLOAD') ?
                                        <Upload {...props} className="import-reportsend" data-tracename="上传文件">
                                            <Button type='primary' className='download-btn'>
                                                {_.isArray(uploadFileArrs) && uploadFileArrs.length ? Intl.get('apply.approve.update.file', '更新文件') : Intl.get('apply.approve.import.file', '上传文件')}
                                                {this.state.isUpLoading ?
                                                    <Icon type="loading" className="icon-loading"/> : null}</Button>
                                        </Upload>
                                        : null}
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