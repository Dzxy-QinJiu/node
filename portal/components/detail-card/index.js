/**
 * 详情中信息展示的卡片
 * Created by wangliping on 2018/3/27.
 */
require("./index.less");
import classNames from "classnames";
class DetailCard extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        let className = classNames("detail-card-container", {"detail-card-edit-status": this.props.isEdit});
        return (
            <div className={className}>
                {this.props.title ? (<div className="detail-card-title">{this.props.title}</div>) : null}
                {this.props.content ? (<div className="detail-card-content">{this.props.content}</div>) : null}
            </div>
        )
    }
}
DetailCard.defaultProps = {
    title: null,//卡片的标题(string|ReactNode)
    content: null,//卡片张展示的内容(string|ReactNode)
    isEdit: false//是否是编辑状态（boolean）,编辑状态会展示阴影
};
export default DetailCard;