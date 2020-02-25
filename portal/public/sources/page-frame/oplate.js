//布局的对象
Oplate.layout = {
    'screen-md': 992,
    'sidebar-transition-time': 300
};
//未读数存储,会在nav-sidebar.js里面进行更新(注释掉的类型数据，暂时不需要了，以备后期再用所以没删)
Oplate.unread = {
    //客户提醒未读数
    // customer: 0,
    //申请消息未读数
    // apply: 0,
    //系统公告未读数
    // system: 0,
    //待审批数
    approve: 0,
    //线索中未处理的线索数量 管理员角色：待分配  销售： 待跟进  运营人员不展示
    unhandleClue: 0,
    // unhandleClueList: [],//获取的待处理的具体的线索列表
    //出差申请审批未读数
    unhandleCustomerVisit: 0,
    //销售机会申请未读数
    unhandleBusinessOpportunities: 0,
    //请假审批未读数
    unhandlePersonalLeave: 0,
    //舆情报送的审批未读数
    unhandleReportSend: 0,
    //文件撰写的审批未读数
    unhandleDocumentWrite: 0,
    //成员审批未读数
    unhandleMemberInivte: 0,
    //拜访审批未读数
    unhandleVisitApply: 0,
    //外出申请的待审批数
    unhandleBusinesstripAwhileApply: 0

};

Oplate.isCalling = false; //是否正在打电话，如果正在打电话，不可以继续打