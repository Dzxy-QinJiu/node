var Button = require('antd').Button;
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var ImportData = require('./app-role-authority-import');
import Trace from 'LIB_DIR/trace';

var ImportFile = React.createClass({

    handleCancel: function(e) {
        e.preventDefault();
        if (this.props.showRoleAuthType == 'role') {
            Trace.traceEvent(e,'取消导入角色文件');
        } else {
            Trace.traceEvent(e,'取消导入权限文件');
        }
        this.props.closeUploadFile();
    },

    render: function(){
        return (
            <div>
                <RightPanel
                    className="upload-role-auth-panel"
                    showFlag={this.props.showFlag}
                >
                    <RightPanelClose onClick={this.props.closeUploadFile} />
                    {this.props.showRoleAuthType == 'role' ? (
                        <div data-tracename="导入角色界面">
                            <div className="import-tips">
                                <p>
                                    1.<ReactIntl.FormattedMessage
                                        id="common.download.template"
                                        defaultMessage={'点击下载{template}'}
                                        values={{
                                            'template': <a href="/rest/my_app/role/download_template"
                                                data-tracename="下载角色模板"
                                            >{Intl.get('role.template', '《角色模板》')}</a>
                                        }}
                                    />
                                </p>
                                <p>
                                    2.{Intl.get('common.write.template', '填写模板文件后，选择文件并导入')}
                                </p>
                            </div>

                            <div className="import-file">
                                <ImportData
                                    type="role"
                                />
                                <Button
                                    type="ghost"
                                    onClick={this.handleCancel}
                                >
                                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div data-tracename="导入权限界面">
                            <div className="import-tips">
                                <p>
                                    1.<ReactIntl.FormattedMessage
                                        id="common.download.template"
                                        defaultMessage={'点击下载{template}'}
                                        values={{
                                            'template': <a href="/rest/my_app/auth/download_template"
                                                data-tracename="权限角色模板"
                                            >{Intl.get('authority.template', '《权限模板》')}</a>
                                        }}
                                    />
                                </p>
                                <p>
                                    2.{Intl.get('common.write.template', '填写模板文件后，选择文件并导入')}
                                </p>
                            </div>

                            <div className="import-file">
                                <ImportData
                                    type="authority"
                                />
                                <Button
                                    type="ghost"
                                    onClick={this.handleCancel}
                                >
                                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                </Button>
                            </div>
                        </div>
                    ) }

                </RightPanel>
            </div>
        );
    }
});

module.exports = ImportFile;