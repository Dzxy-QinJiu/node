/**
 * 详情中信息展示的卡片
 * Created by wangliping on 2018/3/27.
 */
require("./index.less");
import classNames from "classnames";
import SaveCancelButton from "./save-cancel-button";
class DetailCard extends React.Component {
    constructor(props) {
        super(props);
    }

    renderButtonsBlock() {
        if (this.props.isEdit) {
            if (_.isFunction(this.props.renderHandleSaveBtns)) {
                return this.props.renderHandleSaveBtns();
            } else {
                return (<SaveCancelButton {...this.props}/>);
            }
        }
        return null;
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
                        {this.renderButtonsBlock()}
                    </div>) : null}
                {this.props.bottom ? (<div className="detail-card-bottom">{this.props.bottom}</div>) : null}
            </div>
        );
    }
}
DetailCard.defaultProps = {
    title: null,//卡片的标题(string|ReactNode)
    content: null,//卡片张展示的内容(string|ReactNode)
    bottom: null,//卡片底部的信息(string|ReactNode)
    className: "",//自定义类
    isEdit: false,//是否是编辑状态,编辑状态会展示阴影
    loading: false,//是否正在保存
    handleSubmit: function() {
    },//保存的处理
    handleCancel: function() {
    },//取消的处理
    renderHandleSaveBtns: function() {
    },//渲染自定义的处理保存的按钮
    saveErrorMsg: ""//保存的错误提示
};
export default DetailCard;