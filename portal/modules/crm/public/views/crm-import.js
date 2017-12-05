import { Upload, Icon, message } from "antd";
import { crmEmitter } from "OPLATE_EMITTER";
import Trace from "LIB_DIR/trace";

var CrmImport = React.createClass({
    getInitialState() {
        return {
            isLoading: false
        };
    },
    handleChange(info) {
        this.setState({isLoading: true});
        if (info.file.status === "done") {
            const response = info.file.response;
            Trace.traceEvent(this.getDOMNode(),"点击导入按钮");
            if (_.isArray(response) && response.length) {
                crmEmitter.emit(crmEmitter.IMPORT_CUSTOMER, response);
                this.props.closeCrmTemplatePanel();
            } else {
                message.error(Intl.get("crm.99", "导入客户失败，请重试!"));
            }

            this.setState({isLoading: false});
        }
    },
    render: function () {
        var _this = this;
        var props = {
            name: 'customers',
            action: '/rest/crm/customers',
            showUploadList: false,
            onChange: this.handleChange
        };
        return (
            <Upload {...props} className="import-crm">
                {Intl.get("common.import", "导入")} {this.state.isLoading? <Icon type="loading" style={{marginLeft: 8}}/> : null}
            </Upload>
        );
    }
});

module.exports = CrmImport;
