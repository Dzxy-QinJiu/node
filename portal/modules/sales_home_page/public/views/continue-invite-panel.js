/**
 * Created by hzl on 2019/3/4
 */

var React = require('react');
const PropTypes = require('prop-types');
import { Button } from 'antd';
import RightPanelModal from 'CMP_DIR/right-panel-modal';

class ContinueInvitePanel extends React.Component {
    showInviteMemberPane = () => {
        this.props.showInviteMemberPanel();
        console.log('showInviteMemberPane');
    };
    renderContinueInviteContent() {
        if (this.props.isContinueInvitePanel) {
            return (
                <div className="continue-btn-invite-member" onClick={this.showInviteMemberPane}>
                    <Button
                        className='invite-button'
                        type='primary'
                    >
                        {Intl.get('sales.home.invite.continue.btn', '继续邀请')}
                    </Button>
                </div>
            );
        }
    }

    render() {
        return (
            <RightPanelModal
                className="member-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.props.closeRightPanel}
                title={Intl.get('sales.home.invite.member', '邀请成员')}
                content={this.renderContinueInviteContent()}
            />
        );
    }
}
ContinueInvitePanel.propTypes = {
    isContinueInvitePanel: PropTypes.bool,
    closeRightPanel: PropTypes.func,
    showInviteMemberPanel: PropTypes.func,
};
module.exports = ContinueInvitePanel;


