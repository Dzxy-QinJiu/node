/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 9.17
*/
/**
 * https://github.com/jeffchan/truncate.js
 * 
 * ShearContent
 * params {
 *  rowsNum [number] 截断的行数，默认3行
 * }
 * eg:  用组件包裹要截断的文本
 * <ShearContent>
 *    {manyWords}
 * </ShearContent>
*/
require('./index.less');
import { Truncate } from 'truncate.js';
var classNames = require('classnames');
class ShearContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetail: false
        };
    }
    componentDidMount() {
        const $rootDOM = $(ReactDOM.findDOMNode(this));
        this.$contentDOM = $rootDOM.find('.cut-content');
        if (this.$contentDOM.length) {
            //转换成dom对象
            this.handleShear(this.$contentDOM[0]);
        }
        this.$contentDOM.on('click', '.expand-btn', this.showDetail.bind(this, true));
        //收起按钮使用Jq事件代理是为了拦截react的事件，防止在表格中点击收起触发点击单元格事件
        this.$contentDOM.on('click', '.collapse-btn', this.showDetail.bind(this, false));
    }
    handleShear($dom) {
        this.truncated = new Truncate($dom, {
            lines: this.props.rowsNum,
            showMore: `<span class="append-icon expand-btn"> ${Intl.get('shear.expand', '展开')}</span>`,
        });
        this.truncated.collapse();
    }
    showDetail(isShow, e) {
        if (!this.truncated) {
            return;
        }
        this.setState({
            showDetail: isShow
        }, () => {
            if (isShow) {
                this.truncated.expand();
            }
            else {
                this.truncated.collapse();
            }
        });
        e.stopPropagation();
    }
    render() {
        const hideCls = classNames('cut-content', {
            'hide': this.state.showDetail
        });
        const showCls = classNames('cut-content clearfix', {
            'hide': !this.state.showDetail
        });
        return (
            <span className="shear-content-container">
                <div className={hideCls}>
                    {this.props.children}
                </div>
                <div className={showCls}>
                    {this.props.children}<span className="append-icon collapse-btn handle-btn-item">{Intl.get('crm.contact.way.hide', '收起')}</span>
                </div>
            </span>
        );
    }

}
ShearContent.defaultProps = {
    rowsNum: 3,
    children: null,
    jsx: null
};
ShearContent.propTypes = {
    rowsNum: PropTypes.number,
    children: PropTypes.object,
    jsx: PropTypes.element
};
export default ShearContent;