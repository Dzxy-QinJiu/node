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
        this.state = {
            isExpandDetail: _.get(props, 'isExpandDetail', false), //是否展开详情
        };
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

    toggleDetail() {
        if (this.props.isShowToggleBtn) {
            this.setState((prevState, props) => ({
                isExpandDetail: _.get(prevState, 'isExpandDetail') ? !prevState.isExpandDetail : !props.isExpandDetail
            }), () => {
                this.props.handleToggleDetail(this.state.isExpandDetail);
            });
        }
    }

    render() {
        let isExpandDetail = this.state.isExpandDetail;
        // 同时渲染多个卡片，并且需要显示展示收起按钮时，使用传过过来的属性
        if (this.props.isShowToggleBtn && this.props.isMutipleCard) {
            isExpandDetail = this.props.isExpandDetail;
        }
        let className = classNames(this.props.className, 'detail-card-container', {
            'detail-card-edit-status': this.props.isEdit
        });
        let titleClass = classNames('detail-card-title', {
            'title-click-block': this.props.isShowToggleBtn, // 是否有收起展开操作
            'title-border-bottom-none': this.props.titleBottomBorderNone ||
                                        this.props.isEdit//编辑状态下，title也没有下边框
        });
        const expandIconCls = classNames('title-right-block toggle-detail iconfont', {
            'icon-down-twoline handle-btn-item': !isExpandDetail,
            'icon-up-twoline handle-btn-item': isExpandDetail,
        });
        const expandIconTip = isExpandDetail ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');
        //若果没有标题时，编辑状态的内容不显示border
        let contentCl = classNames('detail-card-content', {
            'card-content-edit-status': this.props.isEdit && this.props.title,
            'content-no-padding': this.props.contentNoPadding
        });
        return (
            <div className={className} style={{height: this.props.height || 'auto'}}>
                {
                    this.props.title || this.props.titleDescr || this.props.titleRightBlock ? (
                        <div className={titleClass} onClick={this.toggleDetail.bind(this)}>
                            {this.props.title}
                            {
                                this.props.titleDescr ? (
                                    <span className="title-descr-style">
                                        {this.props.titleDescr}
                                    </span>
                                ) : null
                            }
                            {
                                this.props.isShowToggleBtn ? (
                                    <span className={expandIconCls} title={expandIconTip} />
                                ) : null
                            }
                            {
                                this.props.titleRightBlock ? (
                                    <span className="title-right-block">
                                        {this.props.titleRightBlock}
                                    </span>
                                )
                                    : null
                            }
                        </div>) : null
                }
                {
                    this.props.content ? (
                        <div className={contentCl}>
                            {this.props.content}
                            {this.renderButtonsBlock()}
                        </div>) : null
                }
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
    saveErrorMsg: '',//保存的错误提示
    isExpandDetail: false, // 是否展示详情，默认不展示
    isShowToggleBtn: false, // 是否显示展示收起按钮，默认false
    isMutipleCard: false, // 是否一次显示多个卡片
    contentNoPadding: false,//卡片内容展示区是否有默认的16px的padding
    handleToggleDetail: function() {
    }
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
    saveErrorMsg: PropTypes.string,
    isShowToggleBtn: PropTypes.bool,
    isExpandDetail: PropTypes.bool,
    handleToggleDetail: PropTypes.func,
    isMutipleCard: PropTypes.bool, // 是否同时显示多个卡片
    contentNoPadding: PropTypes.bool,
};
export default DetailCard;