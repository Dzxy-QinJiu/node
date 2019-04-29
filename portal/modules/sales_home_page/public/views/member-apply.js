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
        salesHomeAjax.approveMemberApplyPassOrReject(submitData).then((data) => {

        }, (errorMsg) => {

        });
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
            <div>
                <div>{applicantName}的邀请</div>
                <div className="apply-info-content">
                    <div>{Intl.get('common.name', '姓名')}: {nickname}</div>
                    <div>{Intl.get('common.email', '邮箱')}: {email}</div>
                    {
                        teamId ? (
                            <div>{Intl.get('common.belong.team', '所属团队')}: {teamName}</div>
                        ) : null
                    }
                    <div>{Intl.get('common.role', '角色')}: {roleName}</div>
                </div>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.applyResult === 'error' ? this.state.applyResultMsg : ''}
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
    pendingInfo: PropTypes.object
};

export default MemberApply;