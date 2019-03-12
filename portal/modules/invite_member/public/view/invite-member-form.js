/**
 * Created by hzl on 2019/3/11.
 */
import { Form, Input, Select } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import InviteMemberStore from '../store/index';
import InviteMemberAction from '../action/index';
import {nameLengthRule, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import userData from 'PUB_DIR/sources/user-data';
import AlertTimer from 'CMP_DIR/alert-timer';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

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
        }
    };
    resetNameFlags = () => {
        InviteMemberAction.resetNameFlags();
    };

    //姓名唯一性验证的展示
    renderNameMsg = () => {
        if (this.state.nameExist) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.nickname.is.existed', '姓名已存在！')}
                </div>);
        } else if (this.state.nameError) {
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
        }
    };
    resetEmailFlags = () => {
        InviteMemberAction.resetEmailFlags();
        InviteMemberAction.resetUserNameFlags();
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
                InviteMemberAction.inviteMember(reqData);
            }
        });
    };
    // 点击取消按钮，关闭右侧面板
    closeRightPanel = (event) => {
        event.preventDefault();
        InviteMemberAction.showInviteMemberPanel(false);
        this.props.closeRightPanel();
    };
    // 邀请成功3s后，返回到继续邀请面板
    hideSaveTooltip = () => {
        if (this.state.inviteResult === 'success') {
            setTimeout( () => {
                InviteMemberAction.showInviteMemberPanel(true);
            },0 );

        }
    };
    // 点击继续邀请按钮时，显示邀请成员面板
    closeContinueShowInvitePanel = () => {
        InviteMemberAction.showInviteMemberPanel(false);
    };
    renderContinueInviteMember = () => {
        return (
            <div className='continue-btn-invite-member'>
                <SaveCancelButton
                    handleSubmit={this.closeContinueShowInvitePanel.bind(this)}
                    handleCancel={this.closeRightPanel.bind(this)}
                    okBtnText={Intl.get('sales.home.invite.continue.btn', '继续邀请')}
                />
            </div>
        );
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
                                    onFocus={this.resetNameFlags}
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
                                    onFocus={this.resetEmailFlags}
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
                                    {getFieldDecorator('team', { initialValue: _.get(userData.getUserData(),'team_id', '')})(
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
                            <SaveCancelButton
                                loading={this.state.loading}
                                saveErrorMsg={this.state.inviteResult === 'error' ? this.state.inviteMemberMsg : ''}
                                handleSubmit={this.handleSubmit.bind(this)}
                                handleCancel={this.closeRightPanel.bind(this)}
                                okBtnText={Intl.get('sales.home.invite.btn', '邀请')}
                            />
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
                                            onHide={this.hideSaveTooltip()}
                                        />
                                    ) : null
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
            <RightPanelModal
                className='invite-member-panel'
                isShowModal={false}
                isShowCloseBtn={true}
                title={Intl.get('sales.home.invite.member', '邀请成员')}
                onClosePanel={this.props.closeRightPanel}
                content={ this.state.isShowContinueInvitePanel ? this.renderContinueInviteMember() : this.renderInviteMember()}
            />
        );
    }
}

InviteMemberForm.propTypes = {
    form: PropTypes.form,
    teamList: PropTypes.array,
    closeRightPanel: PropTypes.func,
};

module.exports = Form.create()(InviteMemberForm);
