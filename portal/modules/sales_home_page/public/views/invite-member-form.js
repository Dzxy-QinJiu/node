/**
 * Created by hzl on 2019/2/28.
 */
require('../css/invite-member.less');
import { Form, Input, Select, Button, Icon } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
import InviteMemberStore from '../store/invite-member-store';
import InviteMemberAction from '../action/invite-member-actions';
import {nameLengthRule, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import userData from 'PUB_DIR/sources/user-data';
import AlertTimer from 'CMP_DIR/alert-timer';

class InviteMemberForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            ...InviteMemberStore.getState()
        };
    }
    onStoreChange = () => {
        this.setState(InviteMemberStore.getState());
    };
    componentDidMount = () => {
        InviteMemberStore.listen(this.onStoreChange);
    };
    componentWillUnmount = () => {
        InviteMemberStore.unlisten(this.onStoreChange);
    };
    //验证姓名唯一性
    checkOnlyName = () => {
        let nickname = _.trim(this.props.form.getFieldValue('nickname'));
        if (nickname && (/^[A-Za-z0-9]\w+$/).test(nickname)) {
            InviteMemberAction.checkOnlyName(nickname);
        } else {
            InviteMemberAction.resetNameFlags();
        }
    };

    //姓名唯一性验证的展示
    renderNameMsg = () => {
        if (this.state.userNameExist) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.nickname.is.existed', '姓名已存在！')}
                </div>);
        } else if (this.state.userNameError) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.nickname.is.unique', '姓名唯一性校验出错！')}
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
            InviteMemberAction.checkOnlyEmail(email);
        } else {
            InviteMemberAction.resetEmailFlags();
            InviteMemberAction.resetUserNameFlags();
        }
    };

    //邮箱唯一性验证的展示
    renderEmailMsg = () => {
        if (this.state.emailExist || this.state.userNameExist) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.email.is.used', '邮箱已被使用！')}
                </div>);
        } else if (this.state.emailError || this.state.userNameError) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.email.validate.error', '邮箱校验失败！')}
                </div>);
        } else {
            return '';
        }
    };
    //渲染所属团队下拉列表
    renderTeamOptions = () => {
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

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let validateFlag = this.state.userNameExist || this.state.emailExist || this.state.nameExist ||
                this.state.userNameError || this.state.nameError || this.state.emailError;
            if (validateFlag) {
                err = true;
            }
            if (err) {
                return;
            } else {
                // 各项唯一性验证均不存在且没有出错再添加
                let reqData = _.extend({}, values);
                reqData.nickname = _.trim(_.get(reqData, 'nickname')); // 姓名信息
                reqData.email = _.trim(_.get(reqData, 'email')); // 邮箱信息
                let team = _.trim(_.get(reqData, 'team'));
                if (team) {
                    reqData.team = {
                        groupId: _.trim(_.get(reqData, 'team'))
                    };
                }
                InviteMemberAction.inviteMember(reqData, () => {

                });
            }
        });
    };
    hideSaveTooltip = () => {
        if (this.state.inviteResult === 'success') {
            //返回继续邀请界面
            //this.props.showContinueInviteButton();
        }
    };
    // 邀请成员
    renderInviteMember(){
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
                            {getFieldDecorator('nickname', {
                                rules: [{
                                    required: true,
                                    message: nameLengthRule
                                }]
                            })(
                                <Input
                                    name='nickname'
                                    id='nickname'
                                    type='text'
                                    placeholder={Intl.get('crm.90', '请输入姓名')}
                                    className={this.state.userNameExist || this.state.userNameError ? 'input-red-border' : ''}
                                    onBlur={this.checkOnlyName}
                                />
                            )}
                        </FormItem>
                        {this.renderNameMsg()}
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
                                <Input
                                    name='email'
                                    id='email'
                                    type='text'
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
                                    {getFieldDecorator('team', { initialValue: _.get(userData.getUserData(),'team_name', '')})(
                                        <Select
                                            name='team'
                                            id='team'
                                            placeholder={Intl.get('member.select.group', '请选择团队')}
                                            notFoundContent={Intl.get('member.no.group', '暂无此团队')}
                                            showSearch
                                            searchPlaceholder={Intl.get('member.search.group.by.name', '输入团队名称搜索')}
                                            optionFilterProp='children'
                                        >
                                            {this.renderTeamOptions()}
                                        </Select>
                                    )}
                                </FormItem>
                            ) : null
                        }
                        <FormItem>
                            <div className='invite-member-button'>
                                {this.state.loading ? (
                                    <Icon type='loading' className='loading'/>) : this.state.inviteMemberMsg ? (
                                    <span className='invite-tips'>{this.state.inviteMemberMsg}</span>
                                ) : null}
                                <Button
                                    className='invite-button'
                                    type='primary'
                                    onClick={this.handleSubmit}
                                    disabled={this.state.loading}
                                >
                                    {Intl.get('sales.home.invite.btn', '邀请')}
                                </Button>
                            </div>
                        </FormItem>
                        <FormItem>
                            <div className='indicator'>
                                {this.state.inviteResult === 'success' ?
                                    (
                                        <AlertTimer 
                                            time={3000}
                                            message={Intl.get('sales.home.invite.member.success', '邀请申请发送成功')}
                                            type= 'success'
                                            showIcon
                                            onHide={this.hideSaveTooltip}
                                        />
                                    ) : ''
                                }
                            </div>
                        </FormItem>
                    </div>
                </div>
            </Form>
        );
    }
    render() {
        return (
            <div className='invite-member-panel'>
                {this.renderInviteMember()}
            </div>
        );
    }
}

InviteMemberForm.propTypes = {
    form: PropTypes.form,
    teamList: PropTypes.array,
    closeRightPanel: PropTypes.func,
};

module.exports = Form.create()(InviteMemberForm);