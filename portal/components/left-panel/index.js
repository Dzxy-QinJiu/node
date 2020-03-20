/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
//从左侧滑出的面板
import './style.less';
import classNames from 'classnames';

class LeftPanel extends React.Component {

    componentDidMount() {
        document.addEventListener('click', (e) => {
            if (this.refs.LeftPanel) {
                if (e.clientX > this.refs.LeftPanel.getBoundingClientRect().right) {
                    _.isFunction(this.props.handleHideLeftPanel) && this.props.handleHideLeftPanel();
                }
            }
        });
    }

    render() {
        let cls = classNames('ef-left-panel', {
            'open': this.props.isShow,
            'open-navigation': this.props.openNavigationIs
        });

        return (
            <div className={cls} ref="LeftPanel">
                <div className="ef-left-panel-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

LeftPanel.propTypes = {
    isShow: PropTypes.bool,
    openNavigationIs: PropTypes.bool,
    children: PropTypes.element,
    handleHideLeftPanel: PropTypes.func
};
export default LeftPanel;