var Button = require("antd").Button;
var rightPanelUtil = require("../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var ContractImport = require("./import");
import Trace from "LIB_DIR/trace";
var ImportContractTemplate = React.createClass({

    handleCancel: function(e) {
        Trace.traceEvent(this.getDOMNode(),"点击取消导入合同按钮");
        e.preventDefault();
        this.props.closeContractTemplatePanel();
    },

    render: function(){
        return (
            <div className="import-contract-template-panel">
                <RightPanel
                    showFlag={this.props.showFlag}
                >
                    <RightPanelClose onClick={this.props.closeContractTemplatePanel} />
                    <div>
                        <div className="import-tips">
                            <p>
                                    1、点击下载
                                <a data-tracename="点击下载导入销售合同模板" href="/rest/sale_contract/download_template">
                                        《导入销售合同模板》
                                </a>
                            </p>
                            <p>
                                    2、点击下载
                                <a data-tracename="点击下载导入采购合同模板" href="/rest/purchase_contract/download_template">
                                        《导入采购合同模板》
                                </a>
                            </p>
                            <p>
                                    3、填写模板文件选择文件，并开始导入
                            </p>
                        </div>

                        <div className="import-file">
                            <ContractImport
                                getContractList={this.props.getContractList}
                                closeContractTemplatePanel={this.props.closeContractTemplatePanel}
                            />
                            <Button
                                type="ghost"
                                onClick={this.handleCancel}
                            >
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                            </Button>
                        </div>
                    </div>
                </RightPanel>
            </div>
        );
    }
});

module.exports = ImportContractTemplate;