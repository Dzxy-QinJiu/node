import { AntcTable } from "antc";
var userData = require("PUB_DIR/sources/user-data");
const CrmAction = require("../../../crm/public/action/crm-actions");
const CrmStore = require("../../../crm/public/store/crm-store");
let CrmList = require("../../../crm/public/crm-list");
const ajax = require("../../../crm/public/ajax");
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
const column_width = "90px";
//具备舆情秘书权限
const hasSecretaryAuth = userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);
var rightPanelShow = false;
let UNKNOWN = Intl.get("user.unknown", "未知");
import {RightPanelClose} from "CMP_DIR/rightPanel/index";

class CustomerStageTable extends React.Component {
    constructor(props) {
        super(props);
        var originCustomerList = CrmStore.getCurPageCustomers();
        var list = CrmStore.processForList(originCustomerList);
        var originCustomerListForPagination = CrmStore.getlastCurPageCustomers();
        var listForPagination = CrmStore.processForList(originCustomerListForPagination);
        var _this = this;
        this.state = {
            isLoading: CrmStore.getState().isLoading,//正在获取客户列表
            getErrMsg: CrmStore.getState().getErrMsg,//获取客户列表失败时的提示
            customersSize: CrmStore.getCustomersLength(),
            pageSize: CrmStore.getState().pageSize,
            pageNum: CrmStore.getState().pageNum,
            nextPageNum: CrmStore.getState().nextPageNum,//下次点击的页码
            curPageCustomers: list,//将后端返回的数据转为界面列表所需的数据
            customersBack: listForPagination,//为了便于分页保存的上一次分页成功的数据
            pageNumBack: CrmStore.getState().pageNumBack,//为了便于分页记录上一次分页成功时的页码
            originCustomerList: originCustomerList,//后端返回的客户数据
            rightPanelIsShow: rightPanelShow,
            currentId: CrmStore.getState().currentId,
            curCustomer: CrmStore.getState().curCustomer,
            customerId: CrmStore.getState().customerId,
            isAddFlag: _this.state && _this.state.isAddFlag || false,
            batchChangeShow: _this.state && _this.state.batchChangeShow || false,
            sorter: _this.state && _this.state.sorter || {
                field: "start_time",
                order: "descend"
            },
            condition: _this.state && _this.state.condition || {},
            isScrollTop: _this.state && _this.state.isScrollTop || false,
            crmFilterValue: "",
            cursor: true,//向前还是向后翻页
            pageValue: 0,//两次点击时的页数差
        }
    }
    componentDidMount() {
        this.setState({ rangeParams: this.state.rangParams });
    }

    render() {

        return (
            <div>
                <RightPanelClose 
                    title={Intl.get("common.app.status.close", "关闭")}
                    onClick={this.props.onClose}
                    className="customer-table-close"
                />
                <CrmList
                    location={{ query: "" }}
                    fromSalesHome={true}
                    params={{
                        rangParams: [{
                            from: "123",
                            to: "321",
                            type: "time",
                            name: "start_time"
                        }]
                    }}
                />
            </div>
        )
    }
}
export default CustomerStageTable;