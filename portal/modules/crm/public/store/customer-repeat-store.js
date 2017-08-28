let CustomerRepeatAction = require("../action/customer-repeat-action");
let CrmStore = require("./crm-store");

let PAGE_SIZE = 20;//一页展示的客户个数

function CustomerRepeatStore() {
    this.originCustomerList = [];//后台返回的重复客户列表
    this.repeatCustomerList = [];//转换为界面使用的重复客户列表
    this.selectedCustomers = [];//选择的客户
    this.delModalShow = false;//是否展示删除客户的提示
    this.rightPanelIsShow = false;//是否展示右侧面板
    this.curCustomer = {};//当前要展示的客户
    this.repeatCustomersSize = 0;//重复客户的总数
    this.isLoadingRepeatCustomer = false;//是否正在加载重复客户
    this.errorMsg = "";//获取重复客户列表失败的提示信息
    this.listenScrollBottom = true;//是否监听下拉加载
    this.page = 1;//当前获取的是第几页的数据
    this.mergePanelIsShow = false;//是否展示客户合并面板
    this.mergedCustomer = {};//合并后保存的客户
    this.nameSearchIsShow = false;//是否展示客户名的搜索框
    this.userNameSearchIsShow = false;//是否展示负责人的搜索框
    this.remarksSearchIsShow = false;//是否展示备注的搜索框
    this.filterObj = {};//搜索对象
    this.bindActions(CustomerRepeatAction);
}

CustomerRepeatStore.prototype.editBasicSuccess = function (newBasic) {
    if (newBasic && newBasic.id) {
        let updateCustomer = _.find(this.originCustomerList, customer=>customer.id == newBasic.id);
        for (var key in newBasic) {
            if (newBasic[key] || newBasic[key] == "") {
                updateCustomer[key] = newBasic[key];
            }
        }
        this.repeatCustomerList = CrmStore.processForList(this.originCustomerList);
    }
};
//重置页数
CustomerRepeatStore.prototype.resetPage = function () {
    this.page = 1;
};
//搜索内容的设置
CustomerRepeatStore.prototype.setFilterObj = function (filterObj) {
    this.filterObj = filterObj;
};
//搜索框的展示隐藏
CustomerRepeatStore.prototype.toggleSearchInput = function (keyObj) {
    this.filterObj = {};
    switch (keyObj.key) {
        case "name":
            this.nameSearchIsShow = keyObj.isShow;
            if (keyObj.isShow) {
                //展示客户搜索时，关闭其他搜索
                this.userNameSearchIsShow = false;
                this.remarksSearchIsShow = false;
            }
            break;
        case "user_name":
            this.userNameSearchIsShow = keyObj.isShow;
            if (keyObj.isShow) {
                //展示客户搜索时，关闭其他搜索
                this.nameSearchIsShow = false;
                this.remarksSearchIsShow = false;
            }
            break;
        case "remarks":
            this.remarksSearchIsShow = keyObj.isShow;
            if (keyObj.isShow) {
                //展示客户搜索时，关闭其他搜索
                this.nameSearchIsShow = false;
                this.userNameSearchIsShow = false;
            }
            break;
    }
};

//合并重复客户后的处理
CustomerRepeatStore.prototype.afterMergeRepeatCustomer = function (mergeObj) {
    //合并后保存的客户的id也放入要删除的客户id列表中
    if (_.isObject(mergeObj.customer) && mergeObj.customer.id) {
        if (_.isArray(mergeObj.delete_ids) && mergeObj.delete_ids.length > 0) {
            mergeObj.delete_ids.push(mergeObj.customer.id);
        } else {
            mergeObj.delete_ids = [mergeObj.customer.id];
        }
    }
    //过滤掉合并的重复客户
    this.delRepeatCustomer(mergeObj.delete_ids);
};

//是否展示客户合并面板的设置
CustomerRepeatStore.prototype.setMergePanelShow = function (flag) {
    this.mergePanelIsShow = flag;
};
//是否正在加载重复客户列表的设置
CustomerRepeatStore.prototype.setRepeatCustomerLoading = function (flag) {
    this.isLoadingRepeatCustomer = flag;
};
//获取重复的客户列表
CustomerRepeatStore.prototype.getRepeatCustomerList = function (data) {
    this.isLoadingRepeatCustomer = false;
    if (_.isString(data)) {
        this.errorMsg = data;
    } else if (_.isObject(data) && data.result) {
        this.errorMsg = "";
        this.repeatCustomersSize = data.total || 0;
        if (data.code === 0) {
            var data_list = data.result;
            if (!_.isArray(data_list)) {
                data_list = [];
            }
            if (this.page === 1) {
                //加载首页
                this.originCustomerList = data_list;
                this.repeatCustomerList = CrmStore.processForList(data_list);
            } else {
                //累加
                this.originCustomerList = this.originCustomerList.concat(data_list);
                this.repeatCustomerList = this.repeatCustomerList.concat(CrmStore.processForList(data_list));
            }
            this.page++;
        }
        //是否监听下拉加载的处理
        if (_.isArray(this.repeatCustomerList) && this.repeatCustomerList.length < this.repeatCustomersSize) {
            this.listenScrollBottom = true;
        } else {
            this.listenScrollBottom = false;
        }
        //当前客户列表的展示
        if (_.isObject(this.curCustomer) && this.curCustomer.id) {
            this.setCurCustomer(this.curCustomer.id);
        }
    }
};
//刷新客户列表
CustomerRepeatStore.prototype.refreshRepeatCustomer = function (data) {
    if (data) {
        _.some(this.originCustomerList, (customer, index)=> {
            if (customer.id == data.id) {
                this.originCustomerList[index] = data;
                return true;
            }
        });
        this.repeatCustomerList = CrmStore.processForList(this.originCustomerList);
        if (data.id == this.curCustomer.id) {
            this.setCurCustomer(data.id);
        }
    }
};
//删除重复的客户
CustomerRepeatStore.prototype.delRepeatCustomer = function (delCustomerIds) {
    //删除成功后的处理
    if (_.isArray(delCustomerIds) && delCustomerIds.length > 0) {
        this.originCustomerList = _.filter(this.originCustomerList, customer=> delCustomerIds.indexOf(customer.id) === -1);
        this.repeatCustomerList = _.filter(this.repeatCustomerList, customer=> delCustomerIds.indexOf(customer.id) === -1);
        this.selectedCustomers = [];
        this.repeatCustomersSize -= delCustomerIds.length;//重复客户的总数去掉删除的客户数
    }
};
//设置选中的客户
CustomerRepeatStore.prototype.setSelectedCustomer = function (selectRows) {
    this.selectedCustomers = selectRows;
};
//设置是否展示删除客户的确认框
CustomerRepeatStore.prototype.setDelModalShow = function (flag) {
    this.delModalShow = flag;
};
//设置是否展示右侧面板
CustomerRepeatStore.prototype.setRightPanelShow = function (flag) {
    this.rightPanelIsShow = flag;
};
//设置当前要展示的客户
CustomerRepeatStore.prototype.setCurCustomer = function (id) {
    this.curCustomer = _.find(this.originCustomerList, customer => customer.id === id);
};
module.exports = alt.createStore(CustomerRepeatStore, 'CustomerRepeatStore');
