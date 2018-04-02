/**
 * 详情中信息展示的卡片
 * Created by wangliping on 2018/3/27.
 */
require("./index.less");
import classNames from "classnames";
import {Button, Icon} from "antd";
class DetailCard extends React.Component {
    constructor(props) {
        super(props);
    };

    renderButtons() {
        if (!this.props.isEdit) return null;
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


    render() {
        let className = classNames(this.props.className, "detail-card-container", {"detail-card-edit-status": this.props.isEdit});
        //若果没有标题时，编辑状态的内容不显示border
        let contentCl = classNames("detail-card-content", {"card-content-edit-status": this.props.isEdit && this.props.title});
        return (
            <div className={className}>
                {this.props.title ? (<div className="detail-card-title">{this.props.title}</div>) : null}
                {this.props.content ? (
                    <div className={contentCl}>
                        {this.props.content}
                        {this.renderButtons()}
                    </div>) : null}
            </div>
        )
    }
}
DetailCard.defaultProps = {
    title: null,//卡片的标题(string|ReactNode)
    content: null,//卡片张展示的内容(string|ReactNode)
    className: "",//自定义类
    isEdit: false,//是否是编辑状态,编辑状态会展示阴影
    loading: false,//是否正在保存
    handleSubmit: function () {
    },//保存的处理
    handleCancel: function () {
    },//取消的处理
    saveErrorMsg: ""//保存的错误提示
};
export default DetailCard;