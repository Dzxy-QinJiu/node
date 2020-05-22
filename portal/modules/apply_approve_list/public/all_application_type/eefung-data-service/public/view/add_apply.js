/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';

require('../css/add_apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Form, Button, Upload, Icon, Popconfirm, Radio, DatePicker, Input} from 'antd';
const FormItem = Form.Item;
const FORMLAYOUT = {
    PADDINGTOTAL: 70,
};
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import Trace from 'LIB_DIR/trace';
import {
    CHARGE_MODE,
    DELAY_TIME_RANGE,
    FILES_TYPE_FORBIDDEN_RULES,
    XLSX_FILES_TYPE_RULES
} from 'PUB_DIR/sources/utils/consts';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import applyPrivilegeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';
import {checkFileNameAllowRule, checkFileNameForbidRule} from 'PUB_DIR/sources/utils/common-method-util';
var AlertTimer = require('CMP_DIR/alert-timer');
class AddDataService extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            search_customer_name: '',
            formData: {
                customer: {id: '', name: ''},
            },
        };
    }

    componentDidMount() {
        this.addLabelRequiredCls();
    }
    addLabelRequiredCls() {
        if (!$('.add-leave-apply-form-wrap form .require-item label').hasClass('ant-form-item-required')) {
            $('.add-leave-apply-form-wrap form .require-item label').addClass('ant-form-item-required');
        }
    }
    componentDidUpdate() {
        this.addLabelRequiredCls();
    }

    hideApplyAddForm = (data) => {
        this.props.hideApplyAddForm(data);
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
            var customer_id = _.get(this.state.formData,'customer.id');
            var fileList = this.state.fileList;
            if(!customer_id){
                return;
            }
            delete values.customer;
            if(!_.get(fileList,'[0]')){
                this.setState({
                    warningMsg: Intl.get('apply.approved.upload.annex.list.first', '请先上传附件')
                });
                return;
            }
            const formData = new FormData();
            //是否有上传过文件
            formData.append('files', _.get(fileList,'[0]'));
            formData.append('customer_id',customer_id);
            _.forEach(values,(item,key) => {
                if(key === 'expect_submit_time'){
                    formData.append(key,item.valueOf());
                }else{
                    formData.append(key,item);
                }
            });
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/add/data_service/list',
                contentType: false, // 注意这里应设为false
                processData: false,
                cache: false,
                type: 'post',
                data: formData,
                success: (data) => {
                    if (data) {
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //添加完后的处理
                        data.afterAddReplySuccess = true;
                        data.showCancelBtn = true;
                        this.hideApplyAddForm(data);
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


    handleCustomersChange = (customers) => {
        let formData = this.state.formData;
        formData.customers = customers;
        this.setState({formData});
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
    checkFileNameRule = (filename) => {
        var checkForbidObj = checkFileNameForbidRule(filename, FILES_TYPE_FORBIDDEN_RULES);
        var checkAllowObj = checkFileNameAllowRule(filename,XLSX_FILES_TYPE_RULES);
        var warningMsg = checkForbidObj.warningMsg || checkAllowObj.warningMsg;
        var nameQualified = true;
        if (!checkForbidObj.nameQualified || !checkAllowObj.nameQualified){
            nameQualified = false;
        }
        if (warningMsg){
            this.setState({
                warningMsg: warningMsg
            });
        }
        return nameQualified;
    };
    checkFileType = (filename,fileSize) => {
        if (!this.checkFileNameRule(filename)){
            return false;
        }
        return true;
    };
    beforeUpload = (file) => {
        var fileName = file.name,fileSize = file.size;
        if (this.checkFileType(fileName,fileSize)){
            this.setState({
                fileList: [file],
            });
            return true;
        }else{
            return false;
        }
    };
    handleDeleteFile = (fileItem) => {
        this.setState({
            fileList: []
        });
    };
    renderDeleteAndLoadingBtn = (fileItem) => {
        return (
            <span>
                <Popconfirm placement="top" title={Intl.get('apply.approve.delete.this.file', '是否删除此文件')}
                    onConfirm={this.handleDeleteFile.bind(this, fileItem)} okText={Intl.get('user.yes', '是')}
                    cancelText={Intl.get('user.no', '否')}>
                    <i className="iconfont icon-delete handle-btn-item"></i>
                </Popconfirm>
            </span>
        );

    };
    renderFileList = () => {
        var {fileList} = this.state;
        return _.map(fileList, (fileItem) => {
            var fileName = fileItem.file_name || fileItem.name;
            return (
                <div className="upload-file-name">
                    <span className="file-name">
                        {fileName}
                    </span>
                    {this.renderDeleteAndLoadingBtn(fileItem)}
                </div>
            );
        });
    };
    renderUploadAndDownLoad = () => {
        var props = {
            name: 'dataService',
            showUploadList: false,
            beforeUpload: this.beforeUpload,
        };
        return (
            <div className='upload-and-download'>
                <div className='ant-col-xs-24 ant-col-sm-18'>
                    <Upload {...props}>
                        <Button type='primary'>{Intl.get('apply.approved.upload.annex.list', '上传附件')}</Button>
                    </Upload>
                    <a href="/rest/data/service/download_template">{Intl.get('apply.approved.download.template', '下载模板')}</a>
                </div>
            </div>
        );
    };
    hideCustomerRequiredTip = (flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        },() => {
            this.props.form.validateFields(['customer'], {force: true});
        });
    };
    render() {
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
        var formData = this.state.formData;
        let saveResult = this.state.saveResult;
        var hide = () => {
            this.setState({
                warningMsg: ''
            });
        };
        const disabledDate = function(current) {
            //不允许选择大于当前的时刻
            return current && current.valueOf() < moment().startOf('day');
        };
        return (
            <RightPanel showFlag={true} data-tracename="添加数据导出申请" className="add-data-service-apply-container">
                <span className="iconfont icon-close add—leave-apply-close-btn" onClick={this.hideApplyAddForm}
                    data-tracename="关闭添加数据导出申请面板"></span>
                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('apply.eefung.data.service', '数据导出')}
                    />
                    <div className="add-leave-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-leave-form">
                                <Form layout='horizontal' id="leave-apply-form">
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
                                        className="form-item-label"
                                        label={Intl.get('apply.approved.charge.mode', '收费模式')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('charge_mode',{
                                            initialValue: 'free',
                                            rules: [{
                                                required: true
                                            }],
                                        })(
                                            <Radio.Group>
                                                {_.map(CHARGE_MODE,mode => {
                                                    return <Radio value={_.get(mode,'value')}>{_.get(mode,'name')}</Radio>;
                                                })}
                                            </Radio.Group>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                        label={Intl.get('apply.approve.expect.submit.time', '期望提交时间')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('expect_submit_time', {
                                            initialValue: moment(),
                                            rules: [{
                                                required: true,
                                                message: Intl.get('apply.approve.form.expect.submit.time.require', '请填写期望提交时间')
                                            }],
                                        })(
                                            <DatePicker
                                                disabledDate={disabledDate}
                                                allowClear={false}
                                                showTime={{format: 'HH:mm'}}
                                                format="YYYY-MM-DD HH:mm"
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
                                                placeholder={Intl.get('user.remark.write.tip', '请填写备注')}
                                            />
                                        )}
                                    </FormItem>
                                    {_.get(this.state.fileList,'[0]') ? this.renderFileList() : this.renderUploadAndDownLoad()}
                                    {this.state.warningMsg ?
                                        <div className='alert-wrap'>
                                            <AlertTimer time={4000}
                                                message={this.state.warningMsg}
                                                type="error"
                                                showIcon
                                                onHide={hide}/>
                                        </div>
                                        : null}
                                    <div className="submit-button-container" >
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

AddDataService.defaultProps = {
    hideApplyAddForm: function() {
    },
    form: {}
};
AddDataService.propTypes = {
    hideApplyAddForm: PropTypes.func,
    form: PropTypes.object,
};
export default Form.create()(AddDataService);
