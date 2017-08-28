/**
 * 客户查重界面
 * Created by wangliping on 2016/12/29.
 */
import "../scss/customer-repeat.scss";
import {Table, Button,message,Tag,Icon,Input} from "antd";
import TopNav from"../../../../components/top-nav";
import Spinner from '../../../../components/spinner';
import GeminiScrollBar from '../../../../components/react-gemini-scrollbar';
import TableUtil from '../../../../components/antd-table-pagination';
import insertStyle from "../../../../components/insert-style";
import ModalDialog from "../../../../components/ModalDialog";
import userData from "../../../../public/sources/user-data";
import CustomerRepeatAction from "../action/customer-repeat-action";
import CustomerRepeatStore from "../store/customer-repeat-store";
import CrmRightPanel from "./crm-right-panel";
import CrmRightMergePanel from "./crm-right-merge-panel";
import Privilege from '../../../../components/privilege/checker';
let PrivilegeChecker = Privilege.PrivilegeChecker;
let hasPrivilege = Privilege.hasPrivilege;
import Trace from "LIB_DIR/trace";

let CONSTANTS = {
    PADDING_TOP: 96,
    PADDING_BOTTOM: 20,
    TABLE_HEAD_HEIGHT: 53,
    TOTAL_HEIGHT: 20,
    PAGE_SIZE: 20//一页展示的客户个数
};
let searchInputTimeOut = null;
const delayTime = 800;
let CustomerRepeat = React.createClass({
    getInitialState: function () {
        return {crmListHeight: this.getCrmListHeight(), ...CustomerRepeatStore.getState()};
    },
    onStoreChange: function () {
        this.setState(CustomerRepeatStore.getState());
    },
    componentDidMount: function () {
        CustomerRepeatStore.listen(this.onStoreChange);
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList({
            page_size: CONSTANTS.PAGE_SIZE,
            filterObj: JSON.stringify(this.state.filterObj)
        });
        $(window).resize(()=> {
            this.setState({crmListHeight: this.getCrmListHeight()});
        });
        let _this = this;
        //点击客户列表某一行时打开对应的详情
        $(this.refs.crmList).on("click", "tbody .has-filter", function () {
            var $tr = $(this).closest("tr");
            $tr.addClass("current-row").siblings().removeClass("current-row");
            Trace.traceEvent($(_this.getDOMNode()).find(".current-row"),"点击查看客户详情");
            var id = $tr.find(".record-id").text();
            _this.showRightPanel(id);
        });
    },
    componentDidUpdate: function () {
        let curCustomerId = _.isObject(this.state.curCustomer) ? this.state.curCustomer.id : "";
        if (curCustomerId && this.state.rightPanelIsShow) {
            $(".customer-repeat-container .record-id").each(function () {
                if ($(this).text() == curCustomerId) {
                    $(this).closest("tr").addClass("current-row").siblings().removeClass("current-row");
                    return false;
                }
            });
        }
    },
    componentWillUnmount: function () {
        CustomerRepeatStore.unlisten(this.onStoreChange);
    },
    getCrmListHeight: function () {
        return $(window).height() - CONSTANTS.PADDING_TOP - CONSTANTS.TABLE_HEAD_HEIGHT - CONSTANTS.TOTAL_HEIGHT - CONSTANTS.PADDING_BOTTOM;
    },
    //删除选中的重复的客户
    delRepeatCustomer: function () {
        let selectedCustomers = this.state.selectedCustomers;
        if (_.isArray(selectedCustomers) && selectedCustomers.length > 0) {
            Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"),"删除选中的客户");
            CustomerRepeatAction.delRepeatCustomer(_.pluck(selectedCustomers, 'id'), result=> {
                if (result.error) {
                    message.error(result.errorMsg);
                } else {
                    message.success(result.successMsg);
                }
            });
        }
    },
    //展示是否删除的提示框
    showDelModal: function () {
        let selectedCustomers = this.state.selectedCustomers;
        if (_.isArray(selectedCustomers) && selectedCustomers.length > 0) {
            Trace.traceEvent($(this.getDOMNode()).find(".customer-merge-btn"),"点击删除客户按钮");
            CustomerRepeatAction.setDelModalShow(true);
        }
    },
    //隐藏是否删除的提示框
    hideDelModal: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-cancel"),"取消删除选中的客户");
        CustomerRepeatAction.setDelModalShow(false);
    },
    //返回客户列表
    returnCustomerList: function (e) {
        Trace.traceEvent(e,"点击返回按钮回到客户列表页面");
        this.props.closeRepeatCustomer();
        //重置获取数据页数，保证下次进来获取第一页数据时界面的刷新
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setSelectedCustomer([]);
    },
    showRightPanel: function (id) {
        //舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        CustomerRepeatAction.setRightPanelShow(true);
        CustomerRepeatAction.setCurCustomer(id);
    },
    hideRightPanel: function () {
        CustomerRepeatAction.setRightPanelShow(false);
        $(".customer-repeat-container .ant-table-row").removeClass("current-row");
    },
    handleScrollBottom() {
        //下拉加载数据
        let queryParams = {
            page_size: CONSTANTS.PAGE_SIZE,
            filterObj: JSON.stringify(this.state.filterObj)
        }, repeatCustomerList = this.state.repeatCustomerList;
        if (_.isArray(repeatCustomerList) && repeatCustomerList.length > 0) {
            queryParams.id = repeatCustomerList[repeatCustomerList.length - 1].id;//最后一个客户的id
        }
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList(queryParams);
    },
    refreshRepeatCustomerList: function (customerId) {
        setTimeout(()=>CustomerRepeatAction.refreshRepeatCustomer(customerId), 1000);
    },
    //获取删除客户时的确认提示
    getModalContent: function () {
        let modalContent = Intl.get("crm.43", "确定要是删除选中的客户?"), selectedCustomers = this.state.selectedCustomers;
        if (_.isArray(selectedCustomers) && selectedCustomers.length > 0) {
            //只选中一个时的处理
            if (selectedCustomers.length == 1) {
                let selectCustomer = selectedCustomers[0];
                let userSize = selectCustomer.app_user_ids && selectCustomer.app_user_ids.length || 0;
                let deleteCustomer = Intl.get("crm.44", "该客户已开通{count}个用户，删除后用户的客户关系将丢失，确定要删除该客户吗？", {count: userSize})
                if (userSize > 0) {
                    modalContent = deleteCustomer;
                }
            } else {
                //选中多个客户时的处理
                let hasUser = _.some(selectedCustomers, selectCustomer=>selectCustomer.app_user_ids && selectCustomer.app_user_ids.length > 0);
                //选中的客户下有用户时
                if (hasUser) {
                    modalContent = Intl.get("crm.48", "删除后对应用户的客户关系将丢失，确定要是删除选中的客户？");
                }
            }
        }
        return modalContent;
    },
    showMergePanel: function () {
        if (_.isArray(this.state.selectedCustomers) && this.state.selectedCustomers.length > 0) {
            Trace.traceEvent($(this.getDOMNode()).find(".customer-merge-btn"),"点击合并按钮");
            CustomerRepeatAction.setMergePanelShow(true);
        }
    },
    hideMergePanel: function () {
        CustomerRepeatAction.setMergePanelShow(false);
    },

    showSearchInput: function (key) {
        CustomerRepeatAction.toggleSearchInput({key: key, isShow: true});
        if (key == "name"){
            Trace.traceEvent($(this.getDOMNode()).find(".repeat-customer-search-icon"),"点击按客户名称搜索按钮");
        }else if (key == "user_name"){
            Trace.traceEvent($(this.getDOMNode()).find(".repeat-customer-search-icon"),"点击按负责人搜索按钮");
        }else if (key == "remarks"){
            Trace.traceEvent($(this.getDOMNode()).find(".repeat-customer-search-icon"),"点击按备注搜索按钮");
        }
        //之前有搜索的内容时，先还原
        if (!_.isEmpty(this.state.filterObj)) {
            CustomerRepeatAction.resetPage();
            CustomerRepeatAction.setRepeatCustomerLoading(true);
            CustomerRepeatAction.getRepeatCustomerList({
                page_size: CONSTANTS.PAGE_SIZE,
                filterObj: JSON.stringify({})
            });
        }
    },
    //表头过滤框的内容修改的处理
    onChangeFilterObj: function (filterKey, event) {
        this.state.filterObj[filterKey] = event.target.value;
        if (!event.target.value) {
            //清空过滤框的内容，直接进行过滤
            this.filterRepeatCustomer(filterKey);
            delete this.state.filterObj[filterKey];
        }
        CustomerRepeatAction.setFilterObj(this.state.filterObj);
    },
    //获取过滤后的重复客户
    filterRepeatCustomer: function (filterKey) {
        if (this.state.filterObj[filterKey] == undefined) {
            return;
        }
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList({
            page_size: CONSTANTS.PAGE_SIZE,
            filterObj: JSON.stringify(this.state.filterObj)
        });
    },
    //清空过滤框中的内容
    clearFilterContent: function (filterKey) {
        this.state.filterObj[filterKey] = "";
        //清空过滤框的内容，直接进行过滤
        this.filterRepeatCustomer(filterKey);
        delete this.state.filterObj[filterKey];
        CustomerRepeatAction.setFilterObj(this.state.filterObj);
        CustomerRepeatAction.toggleSearchInput({key: filterKey, isShow: false});
        if (filterKey == "name") {
            Trace.traceEvent($(this.getDOMNode()).find(".anticon-cross-circle-o"), "关闭客户名称后的搜索框");
        }else if (filterKey == "user_name"){
            Trace.traceEvent($(this.getDOMNode()).find(".anticon-cross-circle-o"), "关闭负责人后的搜索框");
        }else{
            Trace.traceEvent($(this.getDOMNode()).find(".anticon-cross-circle-o"), "关闭备注后的搜索框");
        }
    },
    onSearchInputKeyUp: function (filterKey) {
        if (searchInputTimeOut) {
            clearTimeout(searchInputTimeOut);
        }
        searchInputTimeOut = setTimeout(()=> {
            this.filterRepeatCustomer(filterKey);
            if (filterKey == "name"){
                Trace.traceEvent($(this.getDOMNode()).find("input"),"跟据客户名称过滤");
            }else if (filterKey == "user_name"){
                Trace.traceEvent($(this.getDOMNode()).find("input"),"跟据负责人过滤");
            }else if (filterKey == "remarks"){
                Trace.traceEvent($(this.getDOMNode()).find("input"),"跟据备注过滤");
            }
        }, delayTime);

    },
    //filterKey:对应的过滤字段，columnLabel:该列的表头描述
    getSearchInput: function (filterKey, columnLabel) {
        const placeholder = Intl.get("sales.team.according", "根据") + columnLabel + Intl.get("crm.49", "过滤");
        let filterValue = this.state.filterObj[filterKey];
        return (<div className="filter-input-container">
            <Input placeholder={placeholder} value={filterValue||""}
                   onChange={this.onChangeFilterObj.bind(this,filterKey)}
                   onKeyUp={this.onSearchInputKeyUp.bind(this,filterKey)}
            />
            <Icon type="cross-circle-o" onClick={this.clearFilterContent.bind(this,filterKey)}/>
        </div>);
    },
    getColumnTitle: function (filterKey, columnLabel) {
        return ( <div>{columnLabel}<Icon type="search" onClick={this.showSearchInput.bind(this,filterKey)}
                                         className="repeat-customer-search-icon"/></div>);
    },
    render: function () {
        let column = [
            {
                title: this.state.nameSearchIsShow ? this.getSearchInput("name", Intl.get("crm.4", "客户名称")) : this.getColumnTitle("name", Intl.get("crm.4", "客户名称")),
                width: '10%',
                dataIndex: 'name',
                className: 'has-filter',
                render: function (text, record, index) {
                    var tagsArray = record.labels ? record.labels : [];
                    var tags = tagsArray.map(function (tag, index) {
                        return (<Tag key={index}>{tag}</Tag>);
                    });
                    return (
                        <span>
                            <div>{text}</div>
                            {tags.length ?
                                <div className="customer-list-tags">
                                    {tags}
                                </div>
                                : null}
                            <span className="hidden record-id">{record.id}</span>
                        </span>
                    );
                }
            },
            {
                title: Intl.get("call.record.contacts", "联系人"),
                width: '10%',
                dataIndex: 'contact',
                className: 'has-filter'
            },
            {
                title: Intl.get("crm.5", "联系方式"),
                width: '15%',
                dataIndex: 'contact_way',
                className: 'has-filter column-contact-way'
            },
            {
                title: Intl.get("user.apply.detail.order", "订单"),
                width: '10%',
                dataIndex: 'order',
                className: 'has-filter'
            },
            {
                title: this.state.userNameSearchIsShow ? this.getSearchInput("user_name", Intl.get("crm.6", "负责人")) : this.getColumnTitle("user_name", Intl.get("crm.6", "负责人")),
                width: '10%',
                dataIndex: 'user_name',
                className: 'has-filter'
            },
            {
                title: Intl.get("member.create.time", "创建时间"),
                width: '10%',
                dataIndex: 'start_time',
                className: 'has-filter'
            },
            {
                title: Intl.get("crm.7", "最后联系时间"),
                width: '10%',
                dataIndex: 'last_contact_time',
                className: 'has-filter'
            },
            {
                title: this.state.remarksSearchIsShow ? this.getSearchInput("remarks", Intl.get("common.remark", "备注")) : this.getColumnTitle("remarks", Intl.get("common.remark", "备注")),
                width: '15%',
                dataIndex: 'remarks',
                className: 'has-filter',
                render: function (text, record, index) {
                    if (!text) text = "";
                    var truncatedRemarks = text.substr(0, 40);
                    return (
                        <span title={text}>
                            {truncatedRemarks}
                            {text.length > truncatedRemarks.length ? " ......" : null}
                        </span>
                    );
                }
            }
        ];

        function rowKey(record, index) {
            return record.id;
        }

        //是否激活删除/合并按钮样式的处理
        let delClass = "customer-delete-btn", mergeClass = "customer-merge-btn";
        let selectedCustomers = this.state.selectedCustomers, selectCustomerIdArray = [];
        if (_.isArray(selectedCustomers) && selectedCustomers.length > 0) {
            delClass += " delete-active";
            selectCustomerIdArray = _.pluck(selectedCustomers, "id");
            if (selectedCustomers.length > 1) {
                mergeClass += " merge-active";
            }
        }
        let mergePanelIsShow = this.state.mergePanelIsShow;
        //只有有合并或删除客户的权限时，才展示选择框的处理
        let showSelectionFlag = hasPrivilege("CUSTOMER_MERGE_CUSTOMER") || hasPrivilege("CUSTOMER_DELETE");
        var _this = this;
        var rowSelection = showSelectionFlag ? {
            type: 'checkbox',
            selectedRowKeys: selectCustomerIdArray,
            onChange: function (selectedRowKeys, selectedRows) {
            },
            onSelect: function (record, selected, selectedRows) {
                Trace.traceEvent($(_this.getDOMNode()).find(".ant-checkbox-inner"),"选择或者取消对客户的选中");
                if (selectedRows.length > 20) {
                    //一次最多选择20条数据
                    message.warn(Intl.get("crm.202", "一次最多选择20条数据"));
                } else if (!mergePanelIsShow) {
                    //合并面板打开后，不再触发选择客户的事件
                    CustomerRepeatAction.setSelectedCustomer(selectedRows);
                }
            }
        } : null;
        let tableData = this.state.repeatCustomerList;
        let localeObj = {emptyText: this.state.errorMsg || Intl.get("common.no.data", "暂无数据")};
        const total = Intl.get("crm.14", "共{count}条记录", {count: this.state.repeatCustomersSize});
        return (<div className="customer-repeat-container" data-tracename="客户查重页面">
            <TopNav>
                <div className="return-btn-container" onClick={(e)=>{this.returnCustomerList(e)}}>
                    <span className="iconfont icon-return-btn"/>
                    <span className="return-btn-font"><ReactIntl.FormattedMessage id="crm.52"
                                                                                  defaultMessage="返回"/></span>
                </div>
                <PrivilegeChecker
                    check="CUSTOMER_DELETE"
                    className={delClass} onClick={this.showDelModal}
                >
                    <ReactIntl.FormattedMessage id="crm.53" defaultMessage="删除客户"/>
                </PrivilegeChecker>
                <PrivilegeChecker
                    check="CUSTOMER_MERGE_CUSTOMER"
                    className={mergeClass} onClick={this.showMergePanel}
                >
                    <ReactIntl.FormattedMessage id="crm.54" defaultMessage="合并"/>
                </PrivilegeChecker>
            </TopNav>
            <div className="content-block customer-repeat-table splice-table">
                <div className="repeat-customer-table-thead custom-thead" ref="thead">
                    <Table
                        rowSelection={rowSelection}
                        rowKey={rowKey}
                        columns={column}
                        pagination={false}
                    />
                </div>
                <div className="repeat-customer-table-tbody custom-tbody" style={{height:this.state.crmListHeight}}
                     ref="crmList">
                    <GeminiScrollBar
                        listenScrollBottom={this.state.listenScrollBottom}
                        handleScrollBottom={this.handleScrollBottom}
                        itemCssSelector=".ant-table-tbody .ant-table-row"
                    >
                        <Table
                            rowSelection={rowSelection}
                            rowKey={rowKey}
                            columns={column}
                            dataSource={tableData}
                            pagination={false}
                            locale={localeObj}
                            bordered
                        />
                    </GeminiScrollBar>
                </div>
                {tableData.length > 0 ? (<div className="total">{total}</div>) : null}
                {this.state.page == 1 && this.state.isLoadingRepeatCustomer ? (
                    <div className="table-loading-wrap">
                        <Spinner />
                    </div>
                ) : null}
            </div>
            {this.state.mergePanelIsShow ? (<CrmRightMergePanel
                showFlag={this.state.mergePanelIsShow}
                originCustomerList={this.state.originCustomerList}
                mergeCustomerList={this.state.selectedCustomers}
                hideMergePanel={this.hideMergePanel}
                refreshCustomerList={this.refreshRepeatCustomerList}
            />) : this.state.rightPanelIsShow ? (
                <CrmRightPanel
                    isRepeat={true}
                    showFlag={this.state.rightPanelIsShow}
                    curCustomer={this.state.curCustomer}
                    hideRightPanel={this.hideRightPanel}
                    refreshCustomerList={this.refreshRepeatCustomerList}
                />
            ) : null}
            <ModalDialog modalContent={this.getModalContent()}
                         modalShow={this.state.delModalShow}
                         container={this}
                         hideModalDialog={this.hideDelModal}
                         delete={this.delRepeatCustomer}
            />
        </div>);
    }
});

module.exports = CustomerRepeat;
