const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
// 添加应用系统公告的信息
import {Form,Input, Radio,Icon} from 'antd';
var RadioGroup = Radio.Group;
var FormItem = Form.Item;
var Button = require("antd").Button;
import FieldMixin from "../../../../components/antd-form-fieldmixin";
var NoticeAjax = require("../ajax/app-notice-ajax");
var AppNoticeAction = require("../action/app-notice-action");
var AlertTimer = require("../../../../components/alert-timer");
import Trace from "LIB_DIR/trace";

var AppNoticeForm = React.createClass({
    mixins:[FieldMixin],
    getInitialState: function(){
        return {
            formData: {
                value: "upgrade-notice",
                content: ""
            },
            status: {
                content:{}
            },
            errMsg: '',
            isLoading: false
        };
    },

    handleSubmit : function(e){
        e.preventDefault();
        Trace.traceEvent(e,"保存添加公告信息");
        var _this = this;
        this.setState({
            isLoading: true
        });
        $("#appNoticeSaveBtn").attr("disabled", "disabled");
        var validation = this.refs.validation;
        validation.validate(function(valid){
            if(!valid){
                return;
            } else {
                var newContent = {
                    application_id: _this.props.appId,
                    type:_this.state.formData.value,
                    content: _this.state.formData.content
                };
                NoticeAjax.addAppNotice(newContent).then(function(){
                    _this.setState({
                        isLoading: false
                    });
                    AppNoticeAction.hideForm();
                    setTimeout( _this.getData(),1000);
                },function(errMsg){
                    _this.setState({
                        errMsg: errMsg,
                        isLoading: false
                    });
                });

            }
        });
    },
    
    handleCancel : function(e){
        e.preventDefault();
        Trace.traceEvent(e,"取消添加公告信息");
        AppNoticeAction.hideForm();
    },

    changeChoiceNoticeType : function(e) {
        this.state.formData.value = e.target.value;
        this.setState({
            formData: this.state.formData
        });
    },

    // 添加系统公告，重新获取版本系统公告
    getData : function(){
        AppNoticeAction.resetState();
        var searchObj = {
            appId: this.props.appId,
            page: 1,
            pageSize:20
        };
        AppNoticeAction.getAppNoticeList(searchObj);
    },
    // 添加系统公告,失败的处理
    handleSaveFail: function(){
        var hide = () => {
            this.setState({
                errMsg: ''
            });
            $("#appNoticeSaveBtn").removeAttr("disabled");
        };
        return (
            <div className="add-notice-fail-tips">
                <AlertTimer
                    time={3000}
                    message={this.state.errMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>

        );
    },

    render : function(){
        var status = this.state.status;
        return (
            <div className="add-app-notice">
                <Form horizontal className="form" autoComplete="off">
                    <div className="app-form-scroll">
                        <Validation ref="validation"  onValidate={this.handleValidate}>

                            <FormItem
                                label="公告类型："
                                labelCol={{span: 5}}
                                wrapperCol={{span: 17}}
                            >
                                <RadioGroup 
                                    value={this.state.formData.value} 
                                    onChange={this.changeChoiceNoticeType}
                                >
                                    <Radio value="upgrade-notice">升级</Radio>
                                    <Radio value="maintain-notice">维护</Radio>
                                    <Radio value="fault-notice">故障</Radio>
                                    <Radio value="system-notice">系统通知</Radio>
                                </RadioGroup>
                            </FormItem>

                            <FormItem
                                label="内容"
                                labelCol={{span: 3}}
                                wrapperCol={{span: 19}}
                                validateStatus={this.renderValidateStyle('content')}
                                help={status.content.isValidating ? '正在校验中..' :
                                    (status.content.errors && status.content.errors.join(','))
                                }
                            >
                                <Validator rules={[{required: true,message: '请填写系统公告'}]}>
                                    <Input
                                        type="textarea"
                                        name="content"
                                        id="add-app-notice-content"
                                        rows="3"
                                        placeholder="必填项"
                                        value={this.state.formData.content}
                                        onChange={this.setField.bind(this, "content")}
                                    />
                                </Validator>
                            </FormItem>

                            <FormItem
                                wrapperCol={{span: 22}}
                            >
                                <div className="app-notice-form-button">
                                    {this.state.errMsg == '' ? null : this.handleSaveFail()}
                                    <Button
                                        type="primary"
                                        onClick={this.handleSubmit}
                                        id="appNoticeSaveBtn"
                                    >
                                        保存{this.state.isLoading? <Icon type="loading" style={{marginLeft: 12}}/> : null}
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

module.exports = AppNoticeForm;
