import onlineUserListAjax from "../ajax";
import { message } from "antd";

function OnlineUserListAction() {

    this.generateActions(
        //设置当前选中页码
        'setPageNum',
        'handleRefresh',//刷新列表
        'resetState',
    );

    //获取在线用户列表
    this.getOnlineUserList = function (pageSize, pageNum, condition) {
        const _this = this;
        _this.dispatch({loading:true});
        onlineUserListAjax.getOnlineUserList(pageSize, pageNum, condition).then(function (data) {
            _this.dispatch({data : data});
        }, function (errorMsg) {
            _this.dispatch({error : errorMsg});
        });
    };
    
    // 踢出用户下线
    this.kickUser = function(ids){
        onlineUserListAjax.kickUser(ids).then( (data)=>{
           if(data){
               message.success( Intl.get("user.online.kick.success", "踢出成功"));
               this.dispatch(ids);
           }
        }, (errMsg) => {
            message.error(errMsg || Intl.get("user.online.kick.error", "踢出失败"));
        });
    };
}

module.exports = alt.createActions(OnlineUserListAction);
