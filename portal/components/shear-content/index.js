/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 9.17
*/
require("./index.less");
import shear from "shear.js";
var classNames = require('classnames');
class ShearContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetail: false
        }

    }
    componentDidMount() {
        const $rootDOM = $(ReactDOM.findDOMNode(this));
        this.$contentDOM = $rootDOM.find(".cut-content");
        console.log(this.$contentDOM)
        if (this.$contentDOM.length) {
            //转换成dom对象
            this.handleShear(this.$contentDOM[0]);
        }
        this.$contentDOM.on('click', '.shear-expand-btn', this.showDetail.bind(this, true));
    }
    handleShear($dom) {
        shear($dom, this.props.lineNumber,
            `<span class='append-btn-bar'>
        ...<span class="append-icon shear-expand-btn">展开</span>
        </span>`)
    }
    showDetail(isShow) {
        this.setState({
            showDetail: isShow
        }, () => {
            // this.$contentDOM.find('.append-btn-bar').toggle();

        })
    }
    componentWillReceiveProps() {
        if (this.$contentDOM.length) {
            this.handleShear(this.$contentDOM[0]);
        }
    }
    componentWillUnMount() {
    }
    render() {
        const hideCls = classNames('cut-content', {
            'hide': this.state.showDetail
        })
        const showCls = classNames('cut-content', {
            'hide': !this.state.showDetail
        })
        return (
            <span className="shear-content-container">
                <div className={hideCls}>
                    {this.props.children}
                </div>
                <div className={showCls}>
                    {this.props.children}<span onClick={this.showDetail.bind(this, false)} className="append-icon">收起</span>
                </div>
            </span>
        )
    }
}
ShearContent.defaultProps = {
    lineNumber: 3,
    children: null,
    jsx: null
};
ShearContent.PropTypes = {
    lineNumber: PropTypes.number,
    children: PropTypes.object,
    jsx: PropTypes.element
}
export default ShearContent;