const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
// 添加版本升级日志信息
import {Form, Input, Button, Checkbox, message, Icon} from 'antd';
const FormItem = Form.Item;
import FieldMixin from "../../../../components/antd-form-fieldmixin";
var Markdown = require("../../../../components/markdown");
var VersionUpgradeLogAction = require("../action/version-upgrade-log-action");
const autosize = require("autosize");
var Alert = require("antd").Alert;
var inputStyle = require("bootstrap-filestyle");
var versionAjax = require("../ajax/version-upgrade-log-ajax");
import Trace from "LIB_DIR/trace";

const UPLOAD_ERROR_TIPS = Intl.get("common.upload.error", "上传失败，请重试!");

var VersionUpgradeForm = React.createClass({
    mixins: [FieldMixin],
    getInitialState: function(){
        return {
            formData: {
                version: "",
                content: "",
                apk: "",
                forced: false
            },
            status: {
                version: {},
                content: {}
            },
            isPreview: false,
            errorMessage: "",
            isLoading: false
        };
    },
    componentDidMount: function() {
        $(":file").filestyle({icon: false,buttonText: "上传应用"});
    },

    // 提交添加版本记录数据
    handleSubmit: function(e){
        this.setState({
            isLoading: true
        });
        e.preventDefault();
        Trace.traceEvent(e,"保存添加版本升级记录");
        $("#uploadVersionUpgrade").attr("disabled", "disabled");
        var validation = this.refs.validation;
        validation.validate((valid) => {
            if(!valid){
                return;
            } else {
                if(this.state.formData.apk == ""){ // 只上传版本号和内容时
                    var newContent = {
                        application_id: this.props.appId,
                        version: this.state.formData.version,
                        content: this.state.formData.content
                    };
                    versionAjax.addAppVersion(newContent).then( () => {
                        this.setState({
                            isLoading: false
                        });
                        VersionUpgradeLogAction.hideForm();
                        setTimeout( this.getData(),2000);
                    }, (errorMessage) => {
                        this.setState({
                            errorMessage: errorMessage || UPLOAD_ERROR_TIPS,
                            isLoading: false
                        });
                    });
                }else {
                    var formData = new FormData($("#add-version-upgrade-form")[0]);
                    formData.delete('forced');
                    formData.append("application_id",this.props.appId);
                    if(this.state.formData.forced == false){
                        formData.append("forced","false");
                    } else {
                        formData.append("forced","true");
                    }
                    if(this.state.isPreview) {
                        formData.append('content', this.state.formData.content);
                    }
                    versionAjax.addUploadVersion(formData).then( (result) => {
                        VersionUpgradeLogAction.hideForm();
                        setTimeout( this.getData(),2000);
                    }, (errorMessage) => {
                        this.setState({
                            errorMessage: errorMessage || UPLOAD_ERROR_TIPS,
                            isLoading: false
                        });
                    });
                }

            }
        });
    },

    // 添加版本记录后，重新获取版本记录列表
    getData: function(){
        VersionUpgradeLogAction.resetState();
        var searchObj = {
            appId: this.props.appId,
            page: 1,
            pageSize: 20
        };
        VersionUpgradeLogAction.getAppRecordsList(searchObj);
    },

    // 添加版本记录，失败的错误处理
    saveDataErrorHandle: function(){
        var _this = this;
        // 3s后错误提示消失，保存按钮可点击
        setTimeout(function(){
            _this.setState({
                errorMessage: ""
            });
            $("#uploadVersionUpgrade").removeAttr("disabled");
        },3000);
        return <div className="alert-wrap">
            <Alert
                message={this.state.errorMessage}
                type="error"
                showIcon={true}
            />
        </div>;
    },

    handleCancel: function(e){
        e.preventDefault();
        Trace.traceEvent(e,"取消添加版本升级记录");
        VersionUpgradeLogAction.hideForm();
    },

    handleChange: function(event){
        var formData = this.state.formData;
        formData.apk = event.target.value;
        this.setState({
            formData: formData
        });
    },

    togglePreview: function(){
        this.setState({isPreview: !this.state.isPreview}, () => {
            autosize($('#add-version-upgrade-content'));
        });
    },

    handleCheckBox(event) {
        var formData = this.state.formData;
        formData.forced = event.target.checked;
        this.setState({
            formData: formData
        });
    },

    render: function(){
        var status = this.state.status;
        return (
            <div className="add-version-upgrade-style">
                <Form horizontal className="form" autoComplete="off" id="add-version-upgrade-form" enctype="multipart/form-data">
                    <div className="app-form-scroll">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                wrapperCol={{span: 22}}
                                validateStatus={this.renderValidateStyle('version')}
                                help={status.version.isValidating ? '正在校验中..' : (status.version.errors && status.version.errors.join(','))}
                            >
                                <Validator rules={[{required: true,message: '请填写升级版本号'}]}>
                                    <Input
                                        name="version"
                                        id="version"
                                        placeholder="版本（必填项）"
                                        value={this.state.formData.version}
                                        onChange={this.setField.bind(this, "version")}
                                    />
                                </Validator>

                            </FormItem>

                            <FormItem
                                wrapperCol={{span: 22}}
                                validateStatus={this.renderValidateStyle('content')}
                                help={status.content.isValidating ? '正在校验中..' : (status.content.errors && status.content.errors.join(','))}
                            >
                                {!this.state.isPreview ? (
                                    <div>
                                        <Validator rules={[{required: true,message: '请填写升级内容'}]}>
                                            <Input
                                                type="textarea"
                                                name="content"
                                                id="add-version-upgrade-content"
                                                rows="3"
                                                placeholder="升级内容（必填项，支持Markdown格式）"
                                                value={this.state.formData.content}
                                                onChange={this.setField.bind(this, "content")}
                                            />
                                        </Validator>
                                    </div>
                                ) :
                                    <Markdown
                                        title="双击退出预览"
                                        source={this.state.formData.content}
                                        onDoubleClick={this.togglePreview}
                                    />
                                }
                            </FormItem>

                            <FormItem
                                wrapperCol={{span: 22}}
                            >
                                <Input
                                    type="file"
                                    accept=".apk"
                                    name="apk"
                                    onChange={this.handleChange}
                                    className="filestyle"
                                    data-icon="false"
                                    data-buttonText="上传应用"
                                />
                            </FormItem>

                            {this.state.formData.apk != '' ? (
                                <FormItem
                                    wrapperCol={{span: 22}}
                                >
                                    < Checkbox
                                        name="forced"
                                        value={this.state.formData.forced}
                                        onChange={this.handleCheckBox}
                                    />
                                    <span style={{"fontSize": "14px","color": "#5d5d5d"}}>
                                            客户端强制升级
                                    </span>
                                </FormItem>
                            ) : null}

                            <FormItem
                                wrapperCol={{span: 22}}
                            >
                                <div className="version-form-button">
                                    {this.state.errorMessage != '' ? (
                                        this.saveDataErrorHandle()
                                    ) : null}
                                    {!this.state.isPreview && this.state.formData.content != "" ? (
                                        <Button
                                            type="primary"
                                            onClick={this.togglePreview}
                                        >
                                            预览
                                        </Button>
                                    ) : null}
                                    <Button
                                        type="primary"
                                        onClick={this.handleSubmit}
                                        id="uploadVersionUpgrade"
                                    >
                                        保存{this.state.isLoading ? <Icon type="loading" style={{marginLeft: 12}}/> : null}
                                    </Button>
                                    <Button
                                        type="ghost"
                                        onClick={this.handleCancel}
                                    >
                                        取消
                                    </Button>
                                </div>
                            </FormItem>
                        </Validation>
                    </div>
                </Form>
            </div>
        );
    }
});

module.exports = VersionUpgradeForm;
