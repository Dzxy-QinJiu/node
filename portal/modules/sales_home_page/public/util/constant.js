/**
 * Created by wangliping on 2016/11/20.
 */
//视图常量
exports.VIEW_CONSTANT = {
    CUSTOMER: "customer",
    USER: "user",
    PHONE: "phone"
};
//视图常量
exports.SHOW_TYPE_CONSTANT = {
    SALES_TEAM_LIST: "salesTeamList",
    SALES_MEMBER_LIST: "salesMemberList",
    SALESMAN: "salesman"
};

//布局常量
exports.LAYOUTS = {
    TOP_NAV_H: 65,//头部导航
    TOTAL_H: 92 + 20,//头部统计导航区的高度 + marginTop
    SELECT_TYPE_H: 30 + 10 + 12,//电话统计区选择框的的高度+marginTop+marginBottom
    TOP: 73 + 10,//73:topNav,10:paddingTop
    EXPIRE_TITLE_H: 40 + 20,//过期用户列表标题的高度 + marginTop
    LEFT_TOP: 65 + 10 + 58,//左侧过期用户列表布局上下需要减去的高度
    BOTTOM: 10,
    THEAD: 50,//表格TH的高度
    //统计图的padding
    CHART_PADDING: 10,
    TITLE_HEIGHT: 45//销售团队列表头部标题的高度
};
//更新页面的延迟时间
exports.DELAY = {
    TIMERANG: 800
};
