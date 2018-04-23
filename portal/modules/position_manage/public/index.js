require("./css/index.less");
import TopNav from 'CMP_DIR/top-nav'; //顶部导航
import { Button, Table} from 'antd';
import { RightPanel } from 'CMP_DIR/rightPanel';
import PositionStore from './store/index';
import PositionAction from './action/index';
import AddPositionForm from './views/position-form';
import PositionInfo from './views/position-info';
import Spinner from 'CMP_DIR/spinner';
const AntTableCommon = require('CMP_DIR/antd-table-pagination');  // 调整表格的head和body对齐
import ScrollLoad from "CMP_DIR/scroll-load";
import { topNavEmitter } from 'OPLATE_EMITTER';
import * as  LANGLOBAL  from './consts';
import SearchInput from "CMP_DIR/searchInput";
//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 70
};
//搜索字段列表
const searchFields = [
    {
        name: Intl.get("common.username", "用户名"),
        field: "nick_name"
    },
    {
        name: LANGLOBAL.POSITION.number,
        field: "phone_order"
    }
];
const PositionManage = React.createClass({
    getInitialState() {
        return {
            isShowAddRightPanel: false, // 批量添加右侧面板
            isShowDetailRightPanel: false, // 座席号详情面板
            clickRowPhoneOrder: '', // 点击查看详情那一行的座席号
            selectedRowIndex: null, // 点击的行索引
            ...PositionStore.getState()
        };
    },
    onStoreChange() {
        this.setState(PositionStore.getState());
    },
    // 获取座席号列表
    getPhoneOrderList(queryParams) {
        let reqObj = {
            page_size: this.state.pageSize,  // 每次加载的条数
            sort_field: queryParams && queryParams.sort_field || this.state.sortField,
            order: queryParams && queryParams.order || this.state.sortOrder
        };
        // 日志信息的id
        var id =  queryParams && 'id' in queryParams ? queryParams.id : this.state.positionList.sortId;
        let nick_name = queryParams && queryParams.nick_name || this.state.nick_name;
        let phone_order = queryParams && queryParams.phone_order || this.state.phone_order;
        if ( nick_name) {
            reqObj.nick_name = nick_name;
        } else if (phone_order) {
            reqObj.phone_order = phone_order;
        }
        if(id){
            reqObj.id = id;
        }
        PositionAction.getPhoneOrderList(reqObj); // 获取座席号列表
    },
    componentDidMount() {
        $("body").css("overflow", "hidden");
        PositionStore.listen(this.onStoreChange);
        AntTableCommon.zoomInSortArea(this.refs.positionListTable);
        PositionAction.getRealmList(); // 获取安全域列表
        this.getPhoneOrderList();
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    },
    componentWillUnmount() {
        $("body").css("overflow", "auto");
        PositionStore.unlisten(this.onStoreChange);
    },
    // 打开详情面板
    showRightPanel(phoneOrder) {
        this.setState({
            isShowDetailRightPanel: true,
            clickRowPhoneOrder: phoneOrder,
            isShowAddRightPanel: false
        });
    },
    // 关闭右侧详情面板
    closeRightDetailPanel() {
        $("tr").removeClass("current-row");
        this.setState({
            isShowDetailRightPanel: false
        });
    },
    handleAddPosition(){
        this.setState({
            isShowAddRightPanel: true
        });
    },
    // 座席号表格列
    getPositionColumns(){
        return [
            {
                title: LANGLOBAL.POSITION.number, // 座席号
                dataIndex: 'phone_order',
                key: 'phone_order',
                className: 'has-filter',
                width: '20%',
                sorter: true,
                render: (text) => {
                    return (
                        <div className="phone_order">
                            {text}
                        </div>
                    );
                }
            }, {
                title: LANGLOBAL.CITY.area, // 地域
                dataIndex: 'phone_order_location',
                width: '20%',
                key: 'phone_order_location',
                render: (text) => {
                    return (
                        <div>
                            {text == 'jinan' && LANGLOBAL.CITY.jn || text == 'changsha' && LANGLOBAL.CITY.cs || text == 'beijing' && LANGLOBAL.CITY.bj}
                        </div>
                    );
                }
            }, {
                title: LANGLOBAL.ORGANIZATION.organ, // 组织
                dataIndex: 'realm_name',
                width: '30%',
                key: 'realm_name'
            }, {
                title: LANGLOBAL.USER.user, // 用户
                dataIndex: 'nick_name',
                width: '30%',
                key: 'nick_name'
            }
        ];
    },
    //右侧面板的关闭
    closeRightPanel() {
        this.setState({
            isShowAddRightPanel: false
        });
    },
    getRowClickData(record) {
        this.setState({
            isShowDetailRightPanel: true
        });
    },
    handleTableChange(pagination, filters, sorter) {
        const sortOrder = sorter.order || this.state.sortOrder;
        const sortField = sorter.field + '.raw' || this.state.sortField;
        PositionAction.setSort({sortField, sortOrder});
        setTimeout( () => {
            PositionAction.resetState();
            this.getPhoneOrderList({
                sort_field: sortField,
                order: sortOrder,
            });
        } );

    },
    handleScrollBottom() {
        this.getPhoneOrderList({
            id: this.state.positionList.sortId
        });
    },
    showNoMoreDataTip() {
        return !this.state.positionList.isLoading &&
            this.state.positionList.data.length >= 10 && !this.state.listenScrollBottom;
    },
    handleRowClick(record, index, event) {
        this.setState({
            selectedRowIndex: index
        });
        this.showRightPanel(record.phone_order);
    },
    handleRowClassName(record, index) {
        if ((index == this.state.selectedRowIndex) && this.state.isShowDetailRightPanel) {
            return "current-row";
        }
        else {
            return "";
        }
    },
    renderTableContent() {
        let columns = this.getPositionColumns();
        let isLoading = this.state.positionList.isLoading;
        let doNotShow = false;
        if (isLoading && this.state.positionList.sortId === '') {
            doNotShow = true;
        }
        let tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        return (
            <div
                className="user-list-table-wrap scroll-load"
                id="new-table"
                style={{display : doNotShow ? 'none' : 'block'}}
            >
                <div className="position-list-table-wrap " ref="table" style={{height:tableHeight}} >
                    <ScrollLoad
                        listenScrollBottom={this.state.listenScrollBottom}
                        handleScrollBottom={this.handleScrollBottom}
                        selector="div.ant-table-body"
                        loading={isLoading}
                        showNoMoreDataTip={this.showNoMoreDataTip()}
                    >
                        <Table
                            dataSource={this.state.positionList.data}
                            columns={columns}
                            onChange={this.handleTableChange}
                            onRowClick={this.handleRowClick}
                            rowClassName={this.handleRowClassName}
                            locale={{ emptyText: Intl.get("common.no.data", "暂无数据") }}
                            scroll={{ y: tableHeight}}
                            pagination={false}
                        />
                    </ScrollLoad>
                </div>
            </div>
        );
    },
    search() {
        let queryParam = this.refs.searchInput.state.formData;
        PositionAction.search(queryParam);
        setTimeout( () => {
            PositionAction.resetState();
            this.getPhoneOrderList(queryParam);
        } );
    },
    render() {
        return (
            <div className="position_manage_page" ref="positionListTable" >
                <TopNav>
                    <TopNav.MenuList />
                    <div className="search-input-add-block">
                        <SearchInput
                            ref="searchInput"
                            type="select"
                            searchFields={searchFields}
                            searchEvent={this.search}
                        />
                        <div className="add-position-btn">
                            <Button type="ghost" onClick={this.handleAddPosition}>
                                {Intl.get("user.add.position", "添加座席号")}
                            </Button>
                        </div>
                    </div>
                </TopNav>
                <div>
                    {this.renderTableContent()}
                    {this.state.positionList.loading && <Spinner />}
                </div>
                <RightPanel className="white-space-nowrap" showFlag={this.state.isShowAddRightPanel}>
                    <AddPositionForm
                        closeRightPanel={this.closeRightPanel}
                    />
                </RightPanel>
                { this.state.isShowDetailRightPanel && <PositionInfo
                    showFlag={this.state.isShowDetailRightPanel}
                    positionList={this.state.positionList.data}
                    closeRightPanel={this.closeRightDetailPanel}
                    clickRowPhoneOrder={this.state.clickRowPhoneOrder}
                /> }
            </div>
        );
    }
});

module.exports = PositionManage;