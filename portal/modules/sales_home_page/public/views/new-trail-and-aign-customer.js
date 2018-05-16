var GeminiScrollbar = require("CMP_DIR/react-gemini-scrollbar");
import { Button, Spin, Alert } from "antd";
import { AntcTable } from "antc";
const Spinner = require("CMP_DIR/spinner");
import CustomerNewList from './customer-new-list';
const DEFAULT_TABLE_PAGESIZE = 10;
import rightPanelUtil from "CMP_DIR/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;

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
    handleStageNumClick(item, type) {
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
                            onClick={this.handleStageNumClick.bind(this, item, "试用")}>{text}</span>
                    );
                }
            }, {
                title: Intl.get("sales.stage.signed", "签约"),
                dataIndex: "signed",
                key: "signed",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "签约")}>{text}</span>
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

        return (
            <div
                className="chart-holder new-customer-statistic stage-change-customer-container scrollbar-container"
                data-tracename="新开试用、签约客户数统计"
                style={{ maxHeight: (result.data.length == 0) ? "initial" : "540px" }}
            >
                <GeminiScrollbar>
                    <div className="title">
                        {Intl.get("crm.sales.newTrailCustomer", "新开试用、签约客户数统计")}
                    </div>
                    {renderErr()}
                    {renderSpiner()}
                    <div className={hideTable ? "hide" : ""}>
                        <AntcTable
                            util={{ zoomInSortArea: true }}
                            dataSource={result.data}
                            pagination={false}
                            columns={columns}
                        />
                    </div>
                </GeminiScrollbar>
                <RightPanel
                    className="customer-stage-table-wrapper"
                    showFlag={this.state.isShowCustomerTable}
                >
                    {
                        this.state.isShowCustomerTable ?
                            <CustomerNewList
                                params={{
                                    type: this.state.type,
                                    startTime: this.props.params.startTime,
                                    endTime: this.props.params.endTime
                                }}
                                onClose={this.showCustomerTable.bind(this, false)}
                            />
                            : null
                    }
                </RightPanel>
            </div >
        );


    }
}
export default NewTrailCustomerTable;