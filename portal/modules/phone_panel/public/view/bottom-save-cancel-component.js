/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
require("../css/bottom-save-cancel-cmp.less");
var AlertTimer = require("CMP_DIR/alert-timer");
import {Button,Icon,Alert} from "antd";
class BottomSaveCancel extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            submitResult: "",//保存数据后的状态，共三种,loading success error
            saveErrMsg: ""//保存失败后的提示信息
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            submitResult: nextProps.isAddingAppFeedback,
            saveErrMsg: nextProps.addAppFeedbackErrMsg
        });
    }
    render(){
        return (
            <div className="bottom-save-cancel-container">
                <Button type="primary" onClick={this.props.handleSubmit} disabled={this.state.submitResult == "loading"} data-tracename="点击保存按钮">
                    <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                    {this.state.submitResult == "loading" ? <Icon type="loading"/> : null}
                </Button>
                <Button onClick={this.props.handleCancel} data-tracename="点击取消按钮">
                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                </Button>
                {this.state.submitResult == "success" ? (<AlertTimer time={2000} message={Intl.get("common.save.success", "保存成功")} type="success" showIcon onHide={this.props.handleCancel}/>) : null}
                {this.state.submitResult == "error" ? (<div className="alert-timer">
                    <Alert message={this.state.saveErrMsg} type="error" showIcon />
                </div>) : null}
            </div>
        );
    }

}
BottomSaveCancel.defaultProps = {
    handleSubmit: function() {},
    handleCancel: function() {},
    isAddingAppFeedback: "",
};
export default BottomSaveCancel;