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
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
require('../css/nickname-show-edit-field.less');

class NicknameShowEditField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSavingNickName: false, //是否正在修改邮箱
            nicknameSaveErroMsg: '', //邮箱存储错误
            nicknameShowType: 'show',//展示类型：show,edit
        };
    }

    //昵称编辑状态
    setNicknameEditable(e) {
        Trace.traceEvent(e, '修改昵称');
        this.setState({
            nicknameShowType: 'edit',
        });
    }

    //重置昵称状态
    nicknameResetState(nickname) {
        let initState = {
            isSavingNickName: false,
            nicknameSaveErroMsg: '',
            nicknameShowType: 'show',
        };
        if (nickname) {
            initState.nickname = nickname;
        }
        this.setState(initState);
    }

    //昵称提交handler
    handleSubmit(e) {
        Trace.traceEvent(e, '保存昵称的修改');
        this.props.form.validateFields((error, value) => {
            if(error) {
                return;
            } else {
                this.setState({isSavingNickName: true});
                let userInfo = _.extend(this.props.userInfo, nickname);
                delete userInfo.phone;
                UserInfoAction.editUserInfo(userInfo, (errorMsg) => {
                    //保存后的处理
                    this.setState({isSavingNickName: false, nicknameSaveErroMsg: errorMsg});
                    if(_.isEmpty(errorMsg)){
                        this.nicknameResetState(userInfo.nickName);
                    }
                });
            }
        });
    }

    handleCancel(e) {
        Trace.traceEvent(e, '取消编辑昵称');
        this.nicknameResetState();
    }

    //渲染昵称
    renderNicknameShowWrap() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        let curNickname = _.get(this.props.userInfo, 'nickName');
        return (
            <div className="nickname-show-wrap">
                <span className="nickname-show-text">
                    {curNickname}
                </span>
                {curNickname ? (
                    <i className="inline-block iconfont icon-update"
                        title={Intl.get('common.update', '修改')}
                        onClick={(e) => this.setNicknameEditable(e)}/> ) : null}
            </div>

        );
    }

    //渲染input修改昵称
    renderNicknameEditWrap(){
        const {getFieldDecorator, getFieldValue} = this.props.form;
        return (
            <Form>
                <FormItem>
                    {getFieldDecorator('nickName', {
                        initialValue: _.get(this.props.userInfo, 'nickName'),
                        rules: [nameLengthRule]
                    })(
                        <Input type="text" placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}/>
                    )}
                </FormItem>
                <FormItem>
                    <SaveCancelButton loading={this.state.isSavingNickName}
                        saveErrorMsg={this.state.nicknameSaveErroMsg}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </FormItem>
            </Form>);
    }

    render(){
        return (
            <div className="nickname-show-edit-wrap">
                { this.state.nicknameShowType === 'show' ? this.renderNicknameShowWrap() : this.renderNicknameEditWrap()}
            </div>
        );
    }
}

NicknameShowEditField.propTypes = {
    userInfo: PropTypes.object,
    form: PropTypes.object
};
export default Form.create()(NicknameShowEditField);