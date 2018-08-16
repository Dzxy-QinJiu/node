//布局的对象
Oplate.layout = {
    'screen-md': 992,
    'sidebar-transition-time': 300
};
//未读数存储,会在nav-sidebar.js里面进行更新
Oplate.unread = {
    //客户提醒未读数
    customer: 0,
    //申请消息未读数
    apply: 0,
    //系统公告未读数
    system: 0,
    //待审批数
    approve: 0,
    //线索中未处理的线索数量 管理员角色：待分配  销售： 待跟进  运营人员不展示
    unhandleClue: 0
};