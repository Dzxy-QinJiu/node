var React = require('react');
import UserDetail from './user-detail';
import {RightPanel} from '../../../../components/rightPanel';
import OperationRecord from './user_audit_log';
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-audit-log-es_VE.less');
}else if (language.lan() === 'zh'){
    require('../css/user-audit-log-zh_CN.less');
}
var UserAuditLogStore = require('../store/user_audit_log_store');
const datePickerUtils = require('CMP_DIR/datepicker/utils');
// 默认的今天时间
const timeObj = datePickerUtils.getTodayTime();

class UserAuditLog extends React.Component {
    selectedUserId = '';
    isShowRightPanel = false;

    closeRightPanel = () => {
        $(this.refs.wrap).find('.current_row').removeClass('current_row');
        this.selectedUserId = '';
        this.isShowRightPanel = false;
        this.setState({
            selectedUserId: '',
            isShowRightPanel: false
        });
    };

    state = {
        selectedUserId: this.selectedUserId,
        isShowRightPanel: this.isShowRightPanel,
        operatorRecordDateSelectTime: {
            range: 'day',
            startTime: datePickerUtils.getMilliseconds(timeObj.start_time),
            endTime: datePickerUtils.getMilliseconds(timeObj.end_time, true)
        }
    };

    componentWillMount() {
        emitter.on('user_detail_close_right_panel' , this.closeRightPanel);
    }

    componentDidMount() {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on('click' , 'td.click-show-user-detail' , function() {
            $(this).closest('tr').siblings().removeClass('current_row');
            var $tr = $(this).closest('tr');
            var $user_id_hidden = $tr.find('.user_id_hidden');
            var user_id = $user_id_hidden.val();
            if($user_id_hidden[0]) {
                if (user_id){
                    $tr.addClass('current_row');
                    _this.selectedUserId = user_id;
                    _this.isShowRightPanel = true;
                    _this.setState({
                        selectedUserId: user_id,
                        isShowRightPanel: _this.isShowRightPanel
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        this.selectedUserId = '';
        this.isShowRightPanel = false;
        emitter.removeListener('user_detail_close_right_panel' , this.closeRightPanel);
    }

    setOperatorRecordSelectTime = (selectTimeObj) => {
        this.setState({
            operatorRecordDateSelectTime: selectTimeObj
        });
    };

    render() {
        let selectedAppId = UserAuditLogStore.getState().selectAppId;
        return (
            <div>
                <div className="user-audit-log-wrap" ref="wrap">
                    <OperationRecord
                        isShowRightPanel={this.state.isShowRightPanel}
                        setOperatorRecordSelectTime={this.setOperatorRecordSelectTime}
                    />
                </div>
                <RightPanel 
                    className="right-pannel-default app_user_manage_rightpanel white-space-nowrap right-panel detail-v3-panel"
                    showFlag={this.state.isShowRightPanel}>
                    {
                        this.state.selectedUserId ? (
                            <UserDetail 
                                userId={this.state.selectedUserId} 
                                selectedAppId={selectedAppId}
                                operatorRecordDateSelectTime={this.state.operatorRecordDateSelectTime}
                            />
                        ) : null
                    }
                </RightPanel>
            </div>

        );
    }
}

module.exports = UserAuditLog;

