var GeminiScrollbar = require("CMP_DIR/react-gemini-scrollbar");
import { Button, Spin, Alert } from "antd";
import { AntcTable } from "antc";
const Spinner = require("CMP_DIR/spinner");
const DEFAULT_TABLE_PAGESIZE = 10;
import rightPanelUtil from "CMP_DIR/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;
const CrmList = require("../../../crm/public/crm-list");
import { RightPanelClose } from "CMP_DIR/rightPanel/index";

class NewTrailCustomerTable extends React.Component {
    constructor(props) {
        super();
        this.state = {
            type: "",
            isShowCustomerTable: false
        };
    }
    showCustomerTable(isShow) {
        this.setState({
            isShowCustomerTable: isShow
        })
    }
    handleStageNumClick(num, type) {
        //客户数为0时不打开客户列表面板
        if (!num || num === "0") {
            return
        }
        this.setState({
            type,
            isShowCustomerTable: true
        });
    }
    render() {
        const { result, getDataFromSelect, dataResultFromSelect } = this.props;
        const columns = [
            {
                title: Intl.get("common.trial", "试用"),
                dataIndex: "trial",
                key: "trial",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, text, "试用")}>{text}</span>
                    );
                }
            }, {
                title: Intl.get("sales.stage.signed", "签约"),
                dataIndex: "signed",
                key: "signed",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, text, "签约")}>{text}</span>
                    );
                }
            }
        ];
        const loading = result.loading;
        const renderErr = () => {
            if (result.errorMsg) {
                return (
                    <div className="alert-container">
                        <Alert
                            message={result.errorMsg}
                            type="error"
                            showIcon
                        />
                    </div>
                );
            }
        };
        const renderSpiner = () => {
            if (loading) {
                return (
                    <Spinner />
                );
            }
        };
        const hideTable = result.errorMsg || loading;
        const params = {
            queryObj: {                
            },
            rangParams: [{
                from: this.props.params.startTime,
                to: this.props.params.endTime,
                type: "time",
                name: "start_time"
            }],
            condition: {
                customer_label: this.state.type,
                term_fields: ["customer_label"],                
            }
        };
        if (this.props.params.teamId) {
            params.condition.sales_team_id = this.props.params.teamId;
        }
        if (this.props.params.memberId) {
            params.queryObj.user_id = this.props.params.memberId;
        }
        return (
            <div
                className="chart-holder new-customer-statistic stage-change-customer-container scrollbar-container"
                data-tracename="新开客户数统计"
                style={{ maxHeight: (result.data.length == 0) ? "initial" : "540px" }}
            >
                <GeminiScrollbar>
                    <div className="title">
                        {Intl.get("crm.sales.newTrailCustomer", "新开客户数统计")}
                    </div>
                    {renderErr()}
                    {renderSpiner()}
                    {hideTable ? null :
                        <AntcTable
                            util={{ zoomInSortArea: true }}
                            dataSource={result.data}
                            pagination={false}
                            columns={columns}
                        />}
                </GeminiScrollbar>
                <RightPanel
                    className="customer-stage-table-wrapper"
                    showFlag={this.state.isShowCustomerTable}
                >
                    {
                        this.state.isShowCustomerTable ?
                            <div className="customer-table-close topNav">
                                <RightPanelClose
                                    title={Intl.get("common.app.status.close", "关闭")}
                                    onClick={this.showCustomerTable.bind(this, false)}
                                />
                                <CrmList
                                    location={{ query: "" }}
                                    fromSalesHome={true}
                                    params={params}
                                />
                            </div> : null
                    }
                </RightPanel>
            </div >
        );


    }
}
export default NewTrailCustomerTable;