var PropTypes = require('prop-types');
var React = require('react');
/**
 * 详情中信息展示的卡片
 * Created by wangliping on 2018/3/27.
 */
require('./index.less');
import classNames from 'classnames';
import SaveCancelButton from './save-cancel-button';
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
        let className = classNames(this.props.className, 'detail-card-container', {
            'detail-card-edit-status': this.props.isEdit
        });
        let titleClass = classNames('detail-card-title', {
            'title-border-bottom-none': this.props.titleBottomBorderNone || this.props.isEdit//编辑状态下，title也没有下边框
        });
        //若果没有标题时，编辑状态的内容不显示border
        let contentCl = classNames('detail-card-content', {'card-content-edit-status': this.props.isEdit && this.props.title});
        return (
            <div className={className} style={{height: this.props.height || 'auto'}}>
                {this.props.title || this.props.titleDescr || this.props.titleRightBlock ? (
                    <div className={titleClass}>
                        {this.props.title}
                        {this.props.titleDescr ?
                            <span className="title-descr-style">{this.props.titleDescr}</span> : null}
                        {this.props.titleRightBlock ?
                            <span className="title-right-block">{this.props.titleRightBlock}</span> : null}
                    </div>) : null}
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
    //titleDescr和titleRightBlock可以单独传，如果样式不符合也可以自定义从title中传进来
    titleDescr: null,//标题后面的灰色描述（像‘暂无xxx’的提示）
    titleRightBlock: null,//标题右侧的操作区（像编辑、添加、删除等按钮）
    titleBottomBorderNone: false,//标题是否没有下边框, 默认有
    content: null,//卡片张展示的内容(string|ReactNode)
    bottom: null,//卡片底部的信息(string|ReactNode)
    className: '',//自定义类
    isEdit: false,//是否是编辑状态,编辑状态会展示阴影
    loading: false,//是否正在保存
    okBtnText: '',//保存按钮上的描述
    cancelBtnText: '',//取消按钮上的描述
    height: 'auto',//高度的设置
    handleSubmit: function() {
    },//保存的处理
    handleCancel: function() {
    },//取消的处理
    renderHandleSaveBtns: function() {
    },//渲染自定义的处理保存的按钮
    saveErrorMsg: ''//保存的错误提示
};
DetailCard.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleDescr: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleRightBlock: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleBottomBorderNone: PropTypes.bool,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    bottom: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    className: PropTypes.string,
    isEdit: PropTypes.bool,
    loading: PropTypes.bool,
    okBtnText: PropTypes.string,
    cancelBtnText: PropTypes.string,
    height: PropTypes.number,
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    renderHandleSaveBtns: PropTypes.func,
    saveErrorMsg: PropTypes.string
};
export default DetailCard;