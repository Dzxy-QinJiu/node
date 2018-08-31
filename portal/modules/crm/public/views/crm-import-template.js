var React = require('react');
var Button = require('antd').Button;
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var CrmImport = require('./crm-import');

class ImportCrmTemplate extends React.Component {
    handleCancel = (e) => {
        e.preventDefault();
        this.props.closeCrmTemplatePanel();
    };

    render() {
        return (
            <div className="import-crm-template-panel" data-tracename="导入客户面板">
                <RightPanel
                    showFlag={this.props.showFlag}
                >
                    <RightPanelClose onClick={this.props.closeCrmTemplatePanel} data-tracename="点击关闭导入客户面板"/>
                    <div>
                        <div className="import-tips">
                            <p>
                                1.<ReactIntl.FormattedMessage
                                    id="common.download.template"
                                    defaultMessage={'点击下载{template}'}
                                    values={{
                                        'template': <a data-tracename="点击导入客户模板" href="/rest/crm/download_template">{Intl.get('crm.34', '导入客户模板')}</a>
                                    }}
                                />
                            </p>
                            <p>
                               2.{Intl.get('common.write.template', '填写模板文件后，选择文件并导入')}
                            </p>
                            <p>
                                {Intl.get('crm.209', '注意：每次导入的客户数量不能超过300条')}
                            </p>
                        </div>

                        <div className="import-file">
                            <CrmImport
                                refreshCustomerList={this.props.refreshCustomerList}
                                closeCrmTemplatePanel={this.props.closeCrmTemplatePanel}
                            />
                            <Button
                                type="ghost"
                                onClick={this.handleCancel}
                                data-tracename="点击取消导入客户模板按钮"
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

module.exports = ImportCrmTemplate;

