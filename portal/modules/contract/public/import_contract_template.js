var React = require('react');
var Button = require('antd').Button;
var rightPanelUtil = require('../../../components/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var ContractImport = require('./import');
import Trace from 'LIB_DIR/trace';

class ImportContractTemplate extends React.Component {
    handleCancel = (e) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击取消导入合同按钮');
        e.preventDefault();
        this.props.closeContractTemplatePanel();
    };

    render() {
        return (
            <div className="import-contract-template-panel">
                <RightPanel
                    showFlag={this.props.showFlag}
                >
                    <RightPanelClose onClick={this.props.closeContractTemplatePanel} />
                    <div>
                        <div className="import-tips">
                            <p>
                                    1.<ReactIntl.FormattedMessage
                                    id="common.download.template"
                                    defaultMessage={'点击下载{template}'}
                                    values={{
                                        'template': <a href="/rest/sale_contract/download_template"
                                            data-tracename="点击下载导入销售合同模板"
                                        >{Intl.get('contract.190', '《销售合同模板》')}</a>
                                    }}
                                />
                            </p>

                            <p>
                                    2.<ReactIntl.FormattedMessage
                                    id="common.download.template"
                                    defaultMessage={'点击下载{template}'}
                                    values={{
                                        'template': <a href="/rest/purchase_contract/download_template"
                                            data-tracename="点击下载导入采购合同模板"
                                        >{Intl.get('contract.191', '《采购合同模板》')}</a>
                                    }}
                                />
                            </p>

                            <p>
                                    3.{Intl.get('common.write.template', '填写模板文件后，选择文件并导入')}
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
}

module.exports = ImportContractTemplate;
