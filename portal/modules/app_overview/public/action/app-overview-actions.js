import AppOverViewAjax from '../ajax/app-overview-ajax';

class AppOverViewActions {
    constructor() {
        this.generateActions(
            'resetData' // 切换应用时，重置
        );
    }
    //获取在线用户列表
    getOnlineUserList(pageSize, pageNum, condition) {
        this.dispatch({loading:true});
        AppOverViewAjax.getOnlineUserList(pageSize, pageNum, condition).then( (resData) =>{
            this.dispatch({resData : resData});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg});
        });
    }
    // 获取今日上线用户数
    getRecentLoginUsers(params) {
        this.dispatch({loading:true});
        AppOverViewAjax.getRecentLoginUsers(params).then( (resData) =>{
            this.dispatch({resData : resData});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg});
        });
    }
    // 获取用户类型统计（用户总数）
    getUserTypeStatistics (dataType,obj) {
        this.dispatch({loading:true,error:false,dataType:dataType});
        AppOverViewAjax.getUserTypeStatistics(dataType,obj).then( (data) => {
            this.dispatch({loading:false,error:false,data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    }
    
    // 新增用户
    getAddedUserTypeStatistics(dataType,obj) {
        this.dispatch({loading:true,error:false,dataType:dataType});
        AppOverViewAjax.getAddedUserTypeStatistics(dataType,obj).then( (data) => {
            this.dispatch({loading:false,error:false,data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    }

    //获取用户活跃度统计
    // 类型(数据类型 (总数)  数据类型 (日活、周活、月活) )
    getUserActiveNess (dataType,dateRange,obj) {
        this.dispatch({loading:true, error:false, dataType: dataType, dateRange: dateRange});
        AppOverViewAjax.getUserActiveNess(dataType,dateRange,obj).then((data) => {
            this.dispatch({loading:false,error:false,data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    }

    //获取新增用户的团队统计
    getAddedTeam(dateRange, obj) {
        this.dispatch({loading:true, error:false, dateRange: dateRange});
        AppOverViewAjax.getAddedTeam(obj).then((data) =>{
            this.dispatch({loading:false, error:false, data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false, error:true, errorMsg:errorMsg});
        });
    }

    //获取新增用户的地域统计
    getAddedZone(dateRange, obj) {
        this.dispatch({loading:true, error:false, dateRange: dateRange});
        AppOverViewAjax.getAddedZone(obj).then( (data) => {
            this.dispatch({loading:false, error:false, data:data});
        } , (errorMsg) =>{
            this.dispatch({loading:false, error:true, errorMsg:errorMsg});
        });
    }

    //获取总用户的地域统计
    getTotalZone(dateRange, obj) {
        this.dispatch({loading:true, error:false, dateRange: dateRange});
        AppOverViewAjax.getTotalZone(obj).then( (data) => {
            this.dispatch({loading:false, error:false, data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false, error:true, errorMsg:errorMsg});
        });
    }

    // 获取当前应用的在线用户的地域数据
    getOnLineUserZone(dateRange, obj) {
        this.dispatch({loading:true, error:false, dateRange: dateRange});
        AppOverViewAjax.getOnLineUserZone(obj).then( (data) => {
            this.dispatch({loading:false, error:false, data:data});
        } , (errorMsg) => {
            this.dispatch({loading:false, error:true, errorMsg:errorMsg});
        });
    }
    //获取应用列表
    getAppList() {
        AppAjax.getAppList().then( (data) =>{
            this.dispatch(data);
        },  (errorMsg) => {
            this.dispatch(errorMsg);
        });
    }
}

export default alt.createActions(AppOverViewActions);