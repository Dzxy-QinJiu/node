/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/17.
 * 带遮罩层和关闭按钮的右侧面板
 */
require('./index.less');
import classNames from 'classnames';
import { isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';

class RightPanelModal extends React.Component {
    render() {
        let {isWebMin} = isResponsiveDisplay();
        let panelClass = classNames('right-panel-modal', this.props.className, {
            'show-modal': this.props.isShowMadal,
            'right-panel-modal-mobile': isWebMin
        });
        return (
            <div className={panelClass} data-tracename={this.props.dataTracename || ''}>
                {this.props.isShowCloseBtn && !isWebMin ? (
                    <span className="iconfont icon-close close-modal-btn" onClick={this.props.onClosePanel} style={this.props.width ? {right: this.props.width} : null}/>) : null}
                <div className="right-panel-modal-content" style={this.props.width ? {width: this.props.width} : null}>
                    {this.props.isShowCloseBtn && isWebMin ? (
                        <span className="iconfont icon-close mobile-close-btn" onClick={this.props.onClosePanel}/>
                    ) : null}
                    {this.props.title ? (
                        <div className="right-panel-modal-title">
                            {this.props.title}
                        </div>
                    ) : null}
                    {this.props.content || ''}
                </div>
            </div>);
    }
}

RightPanelModal.propTypes = {
    className: PropTypes.string,
    //面板宽度
    width: PropTypes.number,
    //是否展示遮罩层
    isShowMadal: PropTypes.bool,
    //是否展示关闭按钮
    isShowCloseBtn: PropTypes.bool,
    //关闭面板的事件
    onClosePanel: PropTypes.func,
    //标题
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    //面板中展示的内容
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    //事件跟踪的描述
    dataTracename: PropTypes.string
};
export default RightPanelModal;
