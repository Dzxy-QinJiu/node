import PositionActions from '../action/index';

class PositionStore {
    constructor(){
        this.realmList = []; // 安全域列表
        this.nick_name = ''; // 昵称
        this.phone_order = ''; // 座席号
        this.sortField = 'phone_order.raw'; // 排序字段
        this.sortOrder = 'ascend'; //排序方向
        this.resetState();
        this.bindActions(PositionActions);
    }
    resetState(){
        // 座席号列表
        this.positionList = {
            loading: true, // loading
            data: [], //数据列表
            errMsg: '', // 获取失败的提示
            sortId: '' // 当前数据最后一条数据的id
        };
        // 未绑定座席号的成员数据
        this.unbindMember = {
            data: [], //数据列表
            errMsg: '' // 获取失败的提示
        };
        // 下拉加载
        this.listenScrollBottom = true;
        this.pageSize = 20;
    }
    // 获取电话座席号列表
    getPhoneOrderList(result) {
        this.positionList.loading = result.loading;
        if (result.error) {
            this.positionList.errMsg = result.errMsg;
        } else {
            this.positionList.errMsg = '';
            if (_.isArray(result.resData) && result.resData.length) {
                this.positionList.data = this.positionList.data.concat(result.resData);
                let length = this.positionList.data.length;
                this.positionList.sortId = length > 0 ? this.positionList.data[length - 1].id : '';
                if (result.resData.length < 20) {
                    this.listenScrollBottom = false;
                }
            }
        }
    }
    // 获取未绑定座席号的成员列表 
    getUnbindMemberList(result) {
        if (result.error) {
            this.unbindMember.errMsg = result.errMsg;
        } else {
            this.unbindMember.errMsg = '';
            this.unbindMember.data = _.isArray(result.resData) && result.resData || [];
        }
    }
    // 添加座席号，保存成功后，要同步到界面上
    addPosition(addPosition) {
        this.positionList.data.unshift(addPosition);
    }
    // 修改座席号，成功后，同步到界面上
    editPosition(queryObj) {
        _.each(this.positionList.data, (item) => {
            if (item.id == queryObj.user_id ) {
                item.phone_order = queryObj.phone_order;
            }
        });
    }
    // 修改地域，成功后，同步到界面上
    editLocation(queryObj) {
        _.each(this.positionList.data, (item) => {
            if (item.id == queryObj.id) {
                item.phone_order_location = queryObj.phone_order_location;
            }
        });
    }
    // 修改用户，成功后，同步到界面上
    editBindMember(queryObj) {
        _.each(this.positionList.data, (position) => {
            if (position.id == queryObj.id ) {
                let selectMember = _.find(this.unbindMember.data, (unbindMember) => {
                    return unbindMember.user_id == queryObj.user_id;
                });
                position.nick_name = selectMember.nick_name;
            }
        });
    }
    // 绑定用户，成功后，同步到界面上
    bindMember(queryObj) {
        _.each(this.positionList.data, (position) => {
            if (position.id == queryObj.id) {
                if (queryObj.user_id) { // 绑定用户
                    let organizationList = this.realmList;
                    let organizationObj = _.find(organizationList, (organizationItem) => {
                        return organizationItem.realm_id == queryObj.realm;
                    });
                    position.realm_name = organizationObj.realm_name;

                    let selectMember = _.find(this.unbindMember.data, (unbindMember) => {
                        return unbindMember.user_id == queryObj.user_id;
                    });
                    position.nick_name = selectMember.nick_name;
                } else { // 组织和用户解绑定
                    position.realm_name = '';
                    position.nick_name = '';
                    position.user_id = '';
                }

            }
        });
    }
    // 安全域列表
    getRealmList(result) {
        if (result && result.error) {
            this.realmList = [];
        } else {
            this.realmList = result && result.list || [];
        }
    }

    // 设置排序参数
    setSort(sorter) {
        this.sortField = sorter && sorter.sortField;
        this.sortOrder = sorter && sorter.sortOrder;
    }

    // 搜索
    search(searchObj) {
        this.nick_name = searchObj && searchObj.nick_name || '';
        this.phone_order = searchObj && searchObj.phone_order || '';
    }
}

//使用alt导出store
export default alt.createStore(PositionStore , "PositionStore");