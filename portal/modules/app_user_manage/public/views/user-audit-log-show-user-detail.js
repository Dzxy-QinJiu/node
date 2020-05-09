import OperationRecord from './user_audit_log';
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-audit-log-es_VE.less');
}else if (language.lan() === 'zh'){
    require('../css/user-audit-log-zh_CN.less');
}
var UserAuditLogStore = require('../store/user_audit_log_store');
const datePickerUtils = require('antc/lib/components/datepicker/utils');
// 默认的今天时间
const timeObj = datePickerUtils.getTodayTime();
import {userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';

class UserAuditLog extends React.Component {
    isShowRightPanel = false;

    closeRightPanel = () => {
        $(this.refs.wrap).find('.current_row').removeClass('current_row');
        this.isShowRightPanel = false;
        this.setState({
            isShowRightPanel: false
        });
        //触发关闭用户详情面板
        userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);
    };

    state = {
        isShowRightPanel: this.isShowRightPanel,
        operatorRecordDateSelectTime: {
            range: 'day',
            startTime: datePickerUtils.getMilliseconds(timeObj.start_time),
            endTime: datePickerUtils.getMilliseconds(timeObj.end_time, true)
        }
    };

    componentWillMount() {
        // 关闭用户详情面板
        userDetailEmitter.on(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);
    }

    componentDidMount() {
        let $wrap = $(this.refs.wrap);
        let _this = this;
        $wrap.on('click' , 'td.click-show-user-detail' , function() {
            $(this).closest('tr').siblings().removeClass('current_row');
            var $tr = $(this).closest('tr');
            var $user_id_hidden = $tr.find('.user_id_hidden');
            var user_id = $user_id_hidden.val();
            if($user_id_hidden[0]) {
                if (user_id){
                    $tr.addClass('current_row');
                    let paramObj = {
                        selectedAppId: UserAuditLogStore.getState().selectAppId,
                        operatorRecordDateSelectTime: _this.state.operatorRecordDateSelectTime,
                        userId: user_id
                    };
                    //触发打开用户详情面板
                    userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, paramObj);
                    _this.isShowRightPanel = true;
                    _this.setState({
                        isShowRightPanel: _this.isShowRightPanel
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        this.isShowRightPanel = false;
        // 关闭用户详情面板
        userDetailEmitter.removeListener(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);
    }

    setOperatorRecordSelectTime = (selectTimeObj) => {
        this.setState({
            operatorRecordDateSelectTime: selectTimeObj
        });
    };

    render() {
        return (
            <div>
                <div className="user-audit-log-wrap" ref="wrap">
                    <OperationRecord
                        isShowRightPanel={this.state.isShowRightPanel}
                        setOperatorRecordSelectTime={this.setOperatorRecordSelectTime}
                    />
                </div>
            </div>

        );
    }
}

module.exports = UserAuditLog;

