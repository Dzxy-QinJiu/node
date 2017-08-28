import UserDetail from "./user-detail";
import {RightPanel} from "../../../../components/rightPanel";
import LogVIew from "./user_audit_log";
var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/main-es_VE.scss");
}else if (language.lan() == "zh"){
    require("../css/main-zh_CN.scss");
}
const UserAuditLog = React.createClass({
    selectedUserId : '',
    showRightPanel : false,
    getInitialState: function () {
        return {
            selectedUserId : this.selectedUserId,
            showRightPanel : this.showRightPanel
        };
    },
    closeRightPanel : function() {
        $(this.refs.wrap).find(".current_row").removeClass("current_row");
        this.selectedUserId = '';
        this.showRightPanel = false;
        this.setState({
            selectedUserId : '',
            showRightPanel : false
        });
    },
    componentWillMount: function () {
        emitter.on("user_detail_close_right_panel" , this.closeRightPanel);
    },
    
    componentDidMount : function() {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on("click" , "td.click-show-user-detail" , function() {
            $(this).closest("tr").siblings().removeClass("current_row");
            var $tr = $(this).closest("tr");
            var $user_id_hidden = $tr.find(".user_id_hidden");
            var user_id = $user_id_hidden.val();
            if($user_id_hidden[0]) {
                if (user_id){
                    $tr.addClass("current_row");
                    _this.selectedUserId = user_id;
                    _this.showRightPanel = true;
                    _this.setState({
                        selectedUserId : user_id,
                        showRightPanel : _this.showRightPanel
                    });
                }
            }
        });
    },

    componentWillUnmount: function () {
        this.selectedUserId = '';
        this.showRightPanel = false;
        emitter.removeListener("user_detail_close_right_panel" , this.closeRightPanel);
    },
   
    render: function () {
        return (
            <div>
                <div className="user-audit-log-wrap" ref="wrap">
                    <LogVIew />
                </div>
                <RightPanel className="app_user_manage_rightpanel white-space-nowrap"
                            showFlag={this.state.showRightPanel}>
                    {
                        this.state.selectedUserId ? (
                            <UserDetail userId={this.state.selectedUserId}/>
                        ) : null
                    }
                </RightPanel>
            </div>

        );
    }
});
module.exports = UserAuditLog;
