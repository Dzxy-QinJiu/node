function OnlineUserFilterAction() {
    this.generateActions(
        //设置筛选条件
        'setCondition'
    );
}

module.exports = alt.createActions(OnlineUserFilterAction);
