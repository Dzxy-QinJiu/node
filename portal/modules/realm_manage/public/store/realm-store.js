var RealmActions = require("../action/realm-actions");
var _ = require("underscore");
var emptyRealm = {
    id: '',
    realmName: "",
    company: "",
    image: "",
    phone: "",
    email: "",
    location: "",
    detailAddress: "",
    profession: "",
    startTime: "",
    endTime: "",
    comment: ""
};


function RealmStore() {
    //在 编辑/添加 状态的时候realmFormShow为true
    this.realmFormShow = false;
    this.ownerFormShow = false;
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //域列表的长度
    this.realmListSize = 0;
    //当前页域列表
    this.curRealmList = [];
    // 编辑/添加 状态时，需要提交的域对象
    this.currentRealm = emptyRealm;
    //当前选择的安全域
    this.selectRealms = [];
    //当前正在展示的是第几页的数据
    this.curPage = 1;
    this.pageSize = 0;
    //安全域详细信息的展示
    this.realmInfoShow = false;
    //查询内容
    this.searchContent = "";
    //查询时间
    this.startTime = "";
    this.endTime = "";
    //加载数据中。。。
    this.isLoading = true;
    //右侧面板的开关
    this.rightPanelShow = false;
    //安全域详信息获取中。。。
    this.realmIsLoading = false;
    //表单的类型：添加/修改
    this.formType = "add";
    //获取安全域列表时，错误/暂无（符合条件的）数据的提示
    this.realmListTipMsg = "";

    this.bindActions(RealmActions);
}
//推送任务完成后更改相应的属性
RealmStore.prototype.createRealms = function (result) {
     var detail = result[0];
    // 找到当前正在创建的安全域
    var realm = _.find(this.curRealmList, realm=>realm.taskId && realm.taskId == detail.taskId);
    if (detail.failed == 0) {
        //创建成功后，把推送过来的id加到有对应taskId的安全域中，并修改该安全域的status，createMsg属性
        if (detail.tasks.length>0){
            realm.id = detail.tasks[0].taskDetail.realmId;
            realm.status = 1;
            realm.createMsg = "success";
        }
    } else {
        //创建失败后，修改createMsg属性
        realm.createMsg = "error";
    }
};
 //在页面上删除创建失败的安全域
RealmStore.prototype.removeFailRealm = function (realmtaskId) {
        this.curRealmList= _.filter(this.curRealmList,function (item) {
            return item.taskId!==realmtaskId;
        });
};

//点击安全域查看详情时，先设置已有的详情信息
RealmStore.prototype.setCurRealm = function (realmId) {
    var curRealm = _.find(this.curRealmList, function (realm) {
        if (realm.id == realmId) {
            return true;
        }
    });
    this.currentRealm = curRealm || emptyRealm;
};

RealmStore.prototype.getCurRealmById = function (realm) {
    this.currentRealm = realm;
    var curRealmList = this.curRealmList;
    for (var i = 0, len = curRealmList.length; i < len; i++) {
        if (curRealmList[i].id == realm.id) {
            this.curRealmList[i] = this.currentRealm;
        }
    }
    this.realmIsLoading = false;
};
//监听Action的getCurRealmList方法
RealmStore.prototype.getCurRealmList = function (realmListObj) {
    this.isLoading = false;
    if (_.isString(realmListObj)) {
        //错误提示的赋值
        this.realmListTipMsg = realmListObj;
        this.curRealmList = [];
        this.realmListSize = 0;
    } else {
        var curRealmList = realmListObj.data;
        this.realmListSize = realmListObj.list_size;
        //确保返回的是个数组
        if (!_.isArray(curRealmList)) {
            curRealmList = [];
        }
        if (curRealmList.length > 0) {
            //清空提示
            this.realmListTipMsg = "";
        } else {
            //无数据时的处理
            if (this.searchContent) {
                this.realmListTipMsg = Intl.get("realm.no.match.realm", "没有符合条件的安全域!");
            } else {
                this.realmListTipMsg = Intl.get("realm.no.realm", "暂无安全域!");
            }
        }

        if (this.curPage == 1) {
            this.curRealmList = [];
        }
        // 每次加载数据的长度
        var getCurRealmListLength = curRealmList.length;
        // 已经加载的数据长度
        var getTotalRealmListLength = this.curRealmList.length;
        // 去重
        if (getTotalRealmListLength < (this.pageSize)) {
            this.curRealmList = curRealmList;
        } else {
            var rest = getTotalRealmListLength % (this.pageSize);
            if (rest == 0) {
                this.curRealmList = this.curRealmList.concat(curRealmList);
            } else {
                for (var j = rest; j < getCurRealmListLength; j++) {
                    this.curRealmList = this.curRealmList.concat(curRealmList[j]);
                }
            }
        }
    }
};

RealmStore.prototype.closeAddPanel = function () {
    this.realmFormShow = false;
    this.ownerFormShow = false;
    this.rightPanelShow = false;
};

RealmStore.prototype.showOwnerForm = function (realm) {
    if (realm) this.currentRealm = realm;
    else this.formType = "";

    this.ownerFormShow = true;
};

RealmStore.prototype.infoPanel2OwnerForm = function () {
    this.realmInfoShow = false;
    this.formType = "edit";
};

RealmStore.prototype.updateRealmStatus = function (modifiedRealm) {
    if (_.isObject(modifiedRealm)) {
        var curRealmList = this.curRealmList;
        for (var j = 0, rLen = curRealmList.length; j < rLen; j++) {
            if (curRealmList[j].id == modifiedRealm.id) {
                this.curRealmList[j].status = modifiedRealm.status;
                break;
            }
        }
    }
};

RealmStore.prototype.afterEditRealm = function (modifiedRealm) {
    if (_.isObject(modifiedRealm)) {
        var curRealmList = this.curRealmList;
        for (var j = 0, rLen = curRealmList.length; j < rLen; j++) {
            if (curRealmList[j].id == modifiedRealm.id) {
                if (modifiedRealm.status) {
                    this.curRealmList[j].status = modifiedRealm.status;
                } else {
                    this.curRealmList[j].realmName = modifiedRealm.realmName;
                    this.curRealmList[j].image = modifiedRealm.image;
                    this.curRealmList[j].name = modifiedRealm.company;
                    this.curRealmList[j].phone = modifiedRealm.phone;
                    this.curRealmList[j].email = modifiedRealm.email;
                    this.curRealmList[j].location = modifiedRealm.location;
                    this.curRealmList[j].detailAddress = modifiedRealm.detailAddress;
                    this.curRealmList[j].profession = modifiedRealm.profession;
                    this.curRealmList[j].comment = modifiedRealm.comment;
                }
                //this.currentRealm = this.curRealmList[j];
                break;
            }
        }
    }
};

RealmStore.prototype.showRealmForm = function (type) {
    //type：“edit”/"add"
    if (type === "add") {
        this.currentRealm = emptyRealm;
    }
    this.formType = type;
    this.realmInfoShow = false;
    this.ownerFormShow = false;
    this.realmFormShow = true;
    this.rightPanelShow = true;
};

RealmStore.prototype.showModalDialog = function () {
    this.modalDialogShow = true;
};

RealmStore.prototype.hideModalDialog = function () {
    this.modalDialogShow = false;
};

RealmStore.prototype.handleUser = function (realmId, flag) {
    var curRealmList = this.curRealmList;
    for (var j = 0, rLen = curRealmList.length; j < rLen; j++) {
        if (curRealmList[j].id == realmId) {
            this.curRealmList[j].isStop = flag;
            break;
        }
    }
};

RealmStore.prototype.updateCurPage = function (curPage) {
    this.curPage = curPage;
};

RealmStore.prototype.updatePageSize = function (pageSize) {
    this.pageSize = pageSize;
};

RealmStore.prototype.showRealmInfo = function () {
    //this.currentRealm = realm;
    this.realmInfoShow = true;
    this.realmFormShow = false;
    this.ownerFormShow = false;
    this.rightPanelShow = true;
    this.realmIsLoading = true;
};

RealmStore.prototype.updateSearchContent = function (searchContent) {
    this.searchContent = searchContent;

};

RealmStore.prototype.expandRealmLists = function (newRealm) {
    //在安全域列表的前面加上新增的安全域
    this.curRealmList.unshift(newRealm);
    this.rightPanelShow = false;

};
RealmStore.prototype.closeRightPanel = function () {
    this.rightPanelShow = false;
};

RealmStore.prototype.returnInfoPanel = function () {
    this.realmInfoShow = true;
    this.realmFormShow = false;
    this.ownerFormShow = false;
};

module.exports = alt.createStore(RealmStore, 'RealmStore');
