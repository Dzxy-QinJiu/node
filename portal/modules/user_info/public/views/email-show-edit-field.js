/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/8/1.
 */
/**
 * 绑定邮箱的组件，可显示、编辑
 * 可切换状态
 */
import {Form, Input, message} from 'antd';
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import UserInfoAction from '../action/user-info-actions';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('../css/email-show-edit-field.less');

class EmailShowEditField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emailEnable: this.props.userInfo.emailEnable,
            email: this.props.userInfo.email,
            isSavingEmail: false, //是否正在修改邮箱
            emailSaveErrorMsg: '', //邮箱存储错误
            emailShowType: 'show',//展示类型：show,edit
        };
    }

    //邮箱编辑状态
    setEmailEditable(e) {
        Trace.traceEvent(e, '修改邮箱');
        this.setState({
            emailShowType: 'edit',
        });
    }

    //重置邮箱状态
    emailResetState(email) {
        let initState = {
            isSavingEmail: false,
            emailSaveErrorMsg: '',
            emailShowType: 'show',
        };
        if (email) {
            initState.email = email;
        }
        this.setState(initState);
    }

    //邮箱提交handler
    handleSubmit(e) {
        Trace.traceEvent(e, '保存邮箱的修改');
        const form = this.props.form;
        this.props.form.validateFields((error, value) => {
            if (error) return;
            let newEmail = value.email;
            if (this.state.email === newEmail) {
                this.emailResetState();
            } else {
                this.setState({isSavingEmail: true});
                let userInfo = _.extend(this.props.userInfo, value);
                delete userInfo.phone;
                UserInfoAction.editUserInfo(userInfo, (errorMsg) => {
                    //保存后的处理
                    this.setState({isSavingEmail: false, emailSaveErrorMsg: errorMsg});
                    if(_.isEmpty(errorMsg)){
                        //如果邮箱修改成功，邮箱设置为未激活状态
                        this.setState({
                            emailEnable: false
                        });
                        this.emailResetState(userInfo.email);
                    }
                });
            }
        });
    }

    handleCancel(e) {
        Trace.traceEvent(e, '取消编辑邮箱');
        this.emailResetState();
    }

    //未绑定邮箱时
    renderEmailShowWrap() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        let curEmail = _.get(this.props.userInfo, 'email');
        return (
            <div className="email-show-wrap">
                <span className="email-show-text">
                    {curEmail ? curEmail :
                        <span>
                            <ReactIntl.FormattedMessage
                                id="user.info.no.email"
                                defaultMessage={'您还没有绑定邮箱，{add-email}'}
                                values={{'add-email':
                                        <a
                                            data-tracename="点击绑定邮箱"
                                            onClick={(e) => this.setEmailEditable(e)}>
                                            {Intl.get('user.info.binding.email','绑定邮箱')}
                                        </a>,
                                }}/>
                        </span>}
                </span>
                {curEmail ? (
                    <i className="inline-block iconfont icon-update"
                        title={Intl.get('common.update', '修改')}
                        onClick={(e) => this.setEmailEditable(e)}/> ) : null}
                {curEmail ? (this.state.emailEnable ? <span>（
                    <ReactIntl.FormattedMessage id="common.actived" defaultMessage="已激活"/>）</span> :
                    <span>
                        （<ReactIntl.FormattedMessage
                            id="user.info.no.active"
                            defaultMessage={'未激活，请{active}'}
                            values={{
                                'active': <a onClick={this.activeUserEmail.bind(this)} data-tracename="激活">
                                    <ReactIntl.FormattedMessage id="user.info.active" defaultMessage="激活"/>
                                </a>
                            }}/>）
                    </span>) : null}
            </div>

        );
    }

    //绑定邮箱时
    renderEmailBindWrap(){
        const {getFieldDecorator, getFieldValue} = this.props.form;
        let curEmail = getFieldValue('email');
        return (
            <Form>
                <FormItem>
                    {getFieldDecorator('email', {
                        initialValue: _.get(this.props.userInfo, 'email'),
                        rules: [{
                            required: true, message: Intl.get('user.info.email.required', '邮箱不能为空')
                        },{
                            type: 'email', message: Intl.get('common.correct.email', '请输入正确的邮箱')
                        }]
                    })(
                        <Input type="text" placeholder={Intl.get('member.input.email', '请输入邮箱')}/>
                    )}
                </FormItem>
                <FormItem>
                    <SaveCancelButton loading={this.state.isSavingEmail}
                        saveErrorMsg={this.state.emailSaveErrorMsg}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </FormItem>
            </Form>);
    }

    //激活邮箱
    activeUserEmail() {
        if (this.state.emailEnable) {
            return;
        }
        UserInfoAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get('user.info.active.email', '激活邮件已发送至{email},请前往激活',{'email': _.get(this.props.userInfo, 'email')})
                );
            }
        });
    }

    render(){
        return (
            <div className="email-show-edit-wrap">
                { this.state.emailShowType === 'show' ? this.renderEmailShowWrap() : this.renderEmailBindWrap()}
            </div>
        );
    }
}

EmailShowEditField.propTypes = {
    userInfo: PropTypes.object,
    form: PropTypes.object
};
export default Form.create()(EmailShowEditField);