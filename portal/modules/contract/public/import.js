import { Upload, Icon, message } from "antd";
import routeList from "../common/route";

const route = _.find(routeList, route => route.handler === "uploadContractPreview");
const url = route.path;
import { contractEmitter } from "../../../public/sources/utils/emitters";
import Trace from "LIB_DIR/trace";

const ContractImport = React.createClass({
    getInitialState() {
        return {
            isLoading: false
        };
    },
    handleChange(info) {
        this.setState({isLoading: true});        
        if (info.file.status === "done") {
            Trace.traceEvent(this.getDOMNode(),"点击导入合同按钮");
            if (info.file.response.code === 0) {
                contractEmitter.emit(contractEmitter.IMPORT_CONTRACT, info.file.response.result);
                this.props.closeContractTemplatePanel();
            } else {
                message.error(Intl.get("contract.86", "导入合同失败") + ", " + Intl.get("user.info.retry", "请重试"));
            }

            this.setState({isLoading: false});
        }
    },
    render: function() {
        const _this = this;
        const props = {
            name: "contracts",
            action: url,
            showUploadList: false,
            onChange: this.handleChange
        };
        return (
            <Upload {...props} className="import-contract">
                {Intl.get("common.import", "导入")} {this.state.isLoading? <Icon type="loading" style={{marginLeft: 8}}/> : null}
            </Upload>
        );
    }
});

module.exports = ContractImport;
