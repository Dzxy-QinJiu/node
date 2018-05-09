/**
 * 详情中保存、取消按钮的组件（包括保存的等待、错误提示）
 * Created by wangliping on 2018/3/27.
 */
require("./index.less");
import {Button, Icon} from "antd";
class SaveCancelButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="button-container">
                <Button className="button-save" type="primary"
                        onClick={this.props.handleSubmit.bind(this)}>
                    {Intl.get("common.save", "保存")}
                </Button>
                <Button className="button-cancel" onClick={this.props.handleCancel.bind(this)}>
                    {Intl.get("common.cancel", "取消")}
                </Button>
                {this.props.loading ? (
                    <Icon type="loading" className="save-loading"/>) : this.props.saveErrorMsg ? (
                    <span className="save-error">{this.props.saveErrorMsg}</span>
                ) : null}
            </div>
        );
    }
}
SaveCancelButton.defaultProps = {
    loading: false,//是否正在保存
    saveErrorMsg: "",//保存的错误提示
    handleSubmit: function () {
    },//保存的处理
    handleCancel: function () {
    }//取消的处理
};
export default SaveCancelButton;