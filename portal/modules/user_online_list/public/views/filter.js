import OnlineUserFilterStore from "../store/filter";
import OnlineUserFilterAction from "../action/filter";
import OnlineUserListStore from "../store/list";
import OnlineUserListAction from "../action/list";
import { Select, Input, Icon, Button } from "antd";
import SearchInput from "../../../../components/searchInput";
import SelectFullWidth from "../../../../components/select-fullwidth";
var ShareObj = require("../../../app_user_manage/public/util/app-id-share-util");
import Trace from "LIB_DIR/trace";
import RefreshButton from 'CMP_DIR/refresh-button';

//应用下拉选项
let appOptions = [];

//类型下拉选项
let typeOptions = [];

//状态下拉选项
let statusOptions = [];

//搜索字段列表
const searchFields = [
    {
        name: Intl.get("common.username", "用户名"),
        field: "user_name",
    },
    {
        name: Intl.get("common.nickname", "昵称"),
        field: "nick_name",
    },
];

if(!Oplate.hideSomeItem) {
    searchFields.push( {
        name: Intl.get("common.ip.location", "IP归属地"),
        field: "ip_address"
    });
}

//构造组件
const OnlineUserFilter = React.createClass({
    getInitialState: function () {
        return OnlineUserFilterStore.getState();
    },
    componentWillMount: function () {
        OnlineUserFilterStore.listen(this.onStoreChange);

        if (_.isArray(this.props.typeList)) {
            //生成用户类型下拉选项
            typeOptions = this.props.typeList.map(function (value, index) {
                return (<Option value={value.value} key={index}>{value.name}</Option>);
            });
        }

        if (_.isArray(this.props.statusList)) {
            //生成用户状态下拉选项
            statusOptions = this.props.statusList.map(function (value, index) {
                return (<Option value={value.value} key={index}>{value.name}</Option>);
            });
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (_.isArray(nextProps.appList)) {
            //生成应用下拉选项
            nextProps.appList.forEach(function (value, index) {
                appOptions.push( (<Option value={value.app_id} key={index}>{value.app_name}</Option>) );
            });
        }
    },
    componentWillUnmount: function () {
        ShareObj.share_online_app_id = "";
        OnlineUserFilterStore.unlisten(this.onStoreChange);
    },
    onStoreChange: function () {
        this.setState(OnlineUserFilterStore.getState());
    },
    search: function () {
        const _this = this;
        setTimeout(function () {
            const pageSize = OnlineUserListStore.getState().pageSize;
            const pageNum = 1;
            //删除不需要的搜索字段
            _.each(searchFields , (obj) => {
                delete _this.state.condition[obj.field];
            });
            _.extend(_this.state.condition , _this.refs.searchInput.state.formData);
            OnlineUserListAction.setPageNum(pageNum);
            OnlineUserListAction.getOnlineUserList(pageSize, pageNum, _this.state.condition);
        });
    },
    appSelected: function (app) {
        ShareObj.share_online_app_id = app;
        OnlineUserFilterAction.setCondition({client_id: app});
        //选中某个应用后，再打开右侧详情的变更记录时，默认展示此应用
        this.props.appSelected({client_id: app});
        Trace.traceEvent($(this.getDOMNode()).find(".search-select .ant-select"),"根据应用筛选");
        this.search();
    },
    typeSelected: function (type) {
        OnlineUserFilterAction.setCondition({tag: type});
        Trace.traceEvent($(this.getDOMNode()).find(".search-select .ant-select"),"根据类型筛选");
        this.search();
    },
    statusSelected: function (status) {
        OnlineUserFilterAction.setCondition({is_expire: status});
        Trace.traceEvent($(this.getDOMNode()).find(".search-select .ant-select"),"根据状态筛选");
        this.search();
    },
    handleRefresh: function () {
        OnlineUserListAction.handleRefresh();
        setTimeout(() => {
            this.search();
        });

    },
    render: function () {
        ShareObj.share_online_app_id = this.state.condition.client_id;
        return (
            <div className="block search-input-select-block" data-tracename="搜索在线用户">
                <div className="search-select">
                    <SelectFullWidth
                        showSearch
                        value={this.state.condition.client_id}
                        onChange={this.appSelected}
                        optionFilterProp="children"
                        notFoundContent={!appOptions.length? Intl.get("my.app.no.app", "暂无应用"):Intl.get("user.no.related.app", "无相关应用")}
                    >
                        {appOptions}
                    </SelectFullWidth>
                    { !Oplate.hideSomeItem && <SelectFullWidth value={this.state.condition.tag} onChange={this.typeSelected}>
                        {typeOptions}
                    </SelectFullWidth> }
                    <SelectFullWidth value={this.state.condition.is_expire}
                            onChange={this.statusSelected}
                    >
                        {statusOptions}
                    </SelectFullWidth>
                </div>
                <SearchInput
                    ref="searchInput"
                    type="select"
                    searchFields={searchFields}
                    searchEvent={this.search}
                />
                <RefreshButton handleRefresh={this.handleRefresh}/>
            </div>
        );
    }
});

module.exports = OnlineUserFilter;
