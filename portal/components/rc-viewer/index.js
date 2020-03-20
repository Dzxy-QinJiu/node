/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/20.
 */
//图片放大组件
import Viewer from 'viewerjs';
import './style.less';

class RcViewer extends React.Component {
    constructor(props) {
        super(props);
        this.container = null;
        this.viewer = null;
    }
    componentDidMount() {
        this.viewerInit();
    }
    getViewer() {
        return {
            viewer: this.viewer,
            container: this.container
        };
    }
    componentDidUpdate() {
        if (!this.viewer || this.isIdentical()) return;
        this.viewerInit();
    }
    componentWillUnmount() {
        if (this.viewer) this.viewer.destroy();
    }
    isIdentical() {
        const imgarr = this.viewer.images || [];
        this.viewer.update();
        const imgarr2 = this.viewer.images || [];
        if (!imgarr.length && !imgarr2.length) return true;
        if (imgarr.length !== imgarr2.length) return false;
        return imgarr2.every((img, index) => imgarr[index] === img && img.src === imgarr[index].src);
    }
    viewerInit() {
        if (this.viewer) this.viewer.destroy();
        const { options = {}, children } = this.props;
        this.viewer = new Viewer(this.container, {
            navbar: !!(Array.isArray(children) && children.length),
            ...options
        });
    }
    render() {
        const { children, ...others } = this.props;
        return (
            <div ref={(container) => { this.container = container; }} {...others}>
                {children}
            </div>
        );
    }
}

RcViewer.defaultProps = {
    options: {}
};
RcViewer.propTypes = {
    children: PropTypes.element,
    options: PropTypes.object
};
export default RcViewer;