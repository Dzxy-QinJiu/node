/**
 * Created by hzl on 2019/2/28.
 */
import { Form, Input, Select, Icon } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
import InviteMemberAjax from '../ajax/invite-member-ajax';
import InviteMemberStore from '../store/invite-member-store';
import InviteMemberAction from '../action/invite-member-actions';
import {nameLengthRule, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import userData from 'PUB_DIR/sources/user-data';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

class InviteMemberForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            inviteBtnText: '邀请',
            ...InviteMemberStore.getState()
        };
    }
    onStoreChange = () => {
        this.setState(InviteMemberStore.getState());
    }

    componentDidMount() {
        InviteMemberStore.listen(this.onStoreChange);
    }
    componentWillUnmount() {
        InviteMemberStore.unlisten(this.onStoreChange);
    }
    //用户名只能由字母、数字、下划线组成
    checkUserName(rule, value, callback){
        if (this.state.userNameExist || this.state.userNameError) {
            InviteMemberAction.resetUserNameFlags();
        }
        value = _.trim(value);
        if (value) {
            if (!(/^[A-Za-z0-9]\w+$/).test(value)) {
                callback(new Error(Intl.get('member.check.member.name', '请输入数字、字母或下划线，首字母不能是下划线')));
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
    //验证所有者用户名的唯一性
    checkOnlyUserName = () => {
        let userName = _.trim(this.props.form.getFieldValue('name'));
        if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
            InviteMemberAction.checkOnlyUserName({username: userName});
        } else {
            InviteMemberAction.resetUserNameFlags();
        }
    };

    //用户名唯一性验证的展示
    renderUserNameMsg() {
        if (this.state.userNameExist) {
            return (
                <div className='phone-email-check'>
                    {Intl.get('common.is.existed', '用户名已存在！')}
                </div>);
        } else if (this.state.userNameError) {
            return (
                <div className='phone-email-check'>
                    {Intl.get('common.username.is.unique', '用户名唯一性校验出错！')}
                </div>);
        } else {
            return '';
        }
    }
    //邮箱唯一性验证
    checkOnlyEmail = () => {
        let email = _.trim(this.props.form.getFieldValue('email'));
        if (email && emailRegex.test(email)) {
            //所有者的邮箱唯一性验证
            InviteMemberAction.checkOnlyEmail({email: email});
        } else {
            InviteMemberAction.resetEmailFlags();
            InviteMemberAction.resetUserNameFlags();
        }
    }

    //邮箱唯一性验证的展示
    renderEmailMsg(){
        if (this.state.emailExist) {
            return (
                <div className='phone-email-check'>
                    {Intl.get('common.email.is.used', '邮箱已被使用！')}
                </div>);
        } else if (this.state.emailError) {
            return (
                <div className='phone-email-check'>
                    {Intl.get('common.email.validate.error', '邮箱校验失败！')}
                </div>);
        } else {
            return '';
        }
    }
    //渲染所属团队下拉列表
    renderTeamOptions() {
        //团队列表
        let teamOptions = '';
        let teamList = this.props.teamList;
        if (_.isArray(teamList) && teamList.length > 0) {
            teamOptions = teamList.map( (team) => {
                return (<Option key={team.group_id} value={team.group_id}>
                    {team.group_name}
                </Option>);

            });
        } else {
            teamOptions = <Option value=''>{Intl.get('member.no.groups', '暂无团队')}</Option>;
        }
        return teamOptions;
    }

    handleSubmit(event){
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            if (this.state.userNameExist || this.state.emailExist || this.state.userNameError || this.state.emailError) {
                err = true;
            }
            if (err) {
                return;
            } else {
                // 各项唯一性验证均不存在且没有出错再添加
                let member = _.extend({}, values);
                member.name = _.trim(_.get(member, 'name')); // 姓名信息
                member.email = _.trim(_.get(member, 'email')); // 邮箱信息
                member.role = _.get(userData.getUserData(),'role_infos[0].role_id'); // 角色信息
                InviteMemberAjax.inviteMember(member).then( (result) => {
                    if (true) {
                        this.setState({
                            inviteBtnText: '继续邀请'
                        });
                    }
                } );
            }
        });
    }

    handleCancel(event){
        event.preventDefault();
        InviteMemberAction.resetUserNameFlags();
        InviteMemberAction.resetEmailFlags();
        this.props.closeRightPanel();
    }

    // 邀请成员
    renderInviteMember(){
        let values = this.props.form.getFieldsValue();
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19}
        };
        // 是否显示团队信息，销售主管显示，运营人员不显示
        let isShowTeamInfo = userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) || false;
        return (
            <Form layout='horizontal' className='form' autoComplete='off'>
                <div className='invite-member-form'>
                    <div id='invite-member-id'>
                        <FormItem
                            label={Intl.get('common.name', '姓名')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: nameLengthRule
                                }]
                            })(
                                <Input name='name' id='name' type='text'
                                    placeholder={Intl.get('crm.90', '请输入姓名')}
                                    className={this.state.userNameExist || this.state.userNameError ? 'input-red-border' : ''}
                                    onBlur={this.checkOnlyUserName}
                                />
                            )}
                        </FormItem>
                        {this.renderUserNameMsg()}
                        <FormItem
                            label={Intl.get('common.email', '邮箱')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    required: true,
                                    type: 'email',
                                    message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                }]
                            })(
                                <Input name='email' id='email' type='text'
                                    placeholder={Intl.get('member.email.extra.tip', '邮箱会作为登录时的用户名使用')}
                                    className={this.state.emailExist || this.state.emailError ? 'input-red-border' : ''}
                                    onBlur={this.checkOnlyEmail}
                                />
                            )}

                        </FormItem>
                        {this.renderEmailMsg()}
                        {
                            isShowTeamInfo ? (
                                <FormItem
                                    label={Intl.get('common.belong.team', '所属团队')}
                                    {...formItemLayout}
                                >
                                    <Select name='team' id='team'
                                        placeholder={Intl.get('member.select.group', '请选择团队')}
                                        notFoundContent={Intl.get('member.no.group', '暂无此团队')}
                                        showSearch
                                        searchPlaceholder={Intl.get('member.search.group.by.name', '输入团队名称搜索')}
                                        optionFilterProp='children'
                                        defaultValue={_.get(userData.getUserData(),'team_name', '')}
                                    >
                                        {this.renderTeamOptions()}
                                    </Select>
                                </FormItem>
                            ) : null
                        }
                        <FormItem>
                            <SaveCancelButton
                                handleSubmit={this.handleSubmit.bind(this)}
                                handleCancel={this.handleCancel.bind(this)}
                                okBtnText={this.state.inviteBtnText}
                            />
                        </FormItem>
                    </div>
                </div>
            </Form>
        );
    }
    render() {
        return (
            <div className='invite-member-form'>
                {this.renderInviteMember()}
            </div>
        );
    }
}

InviteMemberForm.propTypes = {
    form: PropTypes.form,
    teamList: PropTypes.array,
    closeRightPanel: PropTypes.func
};

module.exports = Form.create()(InviteMemberForm);