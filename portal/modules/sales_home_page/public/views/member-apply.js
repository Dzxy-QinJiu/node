/**
 * Created by hzl on 2019/4/25.
 */
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import salesHomeAjax from '../ajax/sales-home-ajax';

class MemberApply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            applyResult: '',
            applyResultMsg: '',
        };
    }

    submitApprovalForm = (confirmType) => {
        let pendingMemberInfo = this.props.pendingInfo;
        // 提交的数据
        let submitData = {
            id: pendingMemberInfo.id,
            agree: confirmType
        };
        this.setState({
            loading: true
        });
        salesHomeAjax.approveMemberApplyPassOrReject(submitData).then((data) => {
            if (data) {
                this.setState({
                    loading: false,
                    applyResult: 'success',
                    applyResultMsg: ''
                });
                this.props.memberApprove(true);
            } else {
                this.setState({
                    loading: false,
                    applyResult: 'error',
                    applyResultMsg: Intl.get('fail.apply.approve.result','审批失败')
                });
            }
        }, () => {
            this.setState({
                loading: false,
                applyResult: 'error',
                applyResultMsg: Intl.get('fail.apply.approve.result','审批失败')
            });
        });
    };

    // 成员审批失败后的处理
    handleApproveFail = () => {
        this.props.memberApprove(true);
        this.setState({
            applyResult: '',
            applyResultMsg: ''
        });
    };

    renderApproveFailMsg = () => {
        return (
            <div className='approve-failed'>
                <span>{this.state.applyResultMsg},</span>
                <a onClick={this.handleApproveFail}>{Intl.get('member.apply.approve.failed.tips','稍后处理')}</a>
            </div>
        );
    };

    render() {
        let pendingMemberInfo = this.props.pendingInfo;
        let detail = _.get(pendingMemberInfo, 'detail');
        let nickname = _.get(detail, 'nickname', '');
        let email = _.get(detail, 'email', '');
        let teamId = _.get(detail, 'team.group_id', '');
        let teamName = _.get(detail, 'team.group_name', '');
        let roleName = _.get(detail, 'role.role_name', '');
        let applicant = _.get(pendingMemberInfo, 'applicant');
        let applicantName = _.get(applicant, 'nick_name');
        return (
            <div className='member-approve'>
                <div className='member-invite-title'>{Intl.get('member.apply.who.invite', '{who}的邀请', {who: applicantName})}</div>
                <div className="apply-info-content">
                    <div className='apply-item'>{Intl.get('common.name', '姓名')}: {nickname}</div>
                    <div className='apply-item'>{Intl.get('common.email', '邮箱')}: {email}</div>
                    {
                        teamId ? (
                            <div className='apply-item'>{Intl.get('common.belong.team', '所属团队')}: {teamName}</div>
                        ) : null
                    }
                    <div className='apply-item'>{Intl.get('common.role', '角色')}: {roleName}</div>
                </div>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.applyResult === 'error' ? this.renderApproveFailMsg() : ''}
                    handleSubmit={this.submitApprovalForm.bind(this, 'pass')}
                    handleCancel={this.submitApprovalForm.bind(this, 'reject')}
                    okBtnText={Intl.get('user.apply.detail.button.pass', '通过')}
                    cancelBtnText={Intl.get('common.apply.reject', '驳回')}
                />
            </div>
        );
    }
}

MemberApply.propTypes = {
    pendingInfo: PropTypes.object,
    memberApprove: PropTypes.func, // 处理成员审批
};

export default MemberApply;