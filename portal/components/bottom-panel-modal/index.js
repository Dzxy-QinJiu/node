/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/3.
 */
import './style.less';
import classNames from 'classnames';

class BottomPanelModal extends React.Component {
    onClosePanel = () => {
        if(this.props.canClickMaskClosePanel) {
            this.props.onClosePanel();
        }
    };

    render() {
        let containerCls = classNames('bottom-panel-modal', this.props.className);
        return (
            <div className={containerCls} data-tracename={this.props.dataTracename || ''}>
                {this.props.isShowModal ? <div className="right-panel-modal-mask" onClick={this.onClosePanel}/> : null}
                <div className="bottom-panel-modal-content">
                    <div className="bottom-panel-modal-title">
                        <div className="bottom-panel-title-wrapper">{this.props.title}</div>
                        {this.props.isShowCloseBtn ? <span className="iconfont icon-close" onClick={this.props.onClosePanel}/> : null}
                    </div>
                    <div className="bottom-panel-content">
                        {this.props.content}
                    </div>
                </div>
            </div>
        );
    }
}

BottomPanelModal.defaultProps = {
    //是否可点击遮罩层关闭面板
    canClickMaskClosePanel: true,
    isShowCloseBtn: true,
};
BottomPanelModal.propTypes = {
    className: PropTypes.string,
    dataTracename: PropTypes.string,
    //标题
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    //面板中展示的内容
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    //是否展示遮罩层
    isShowModal: PropTypes.bool,
    //是否显示关闭按钮
    isShowCloseBtn: PropTypes.bool,
    canClickMaskClosePanel: PropTypes.func,
    //关闭面板的事件
    onClosePanel: PropTypes.func,
};
export default BottomPanelModal;