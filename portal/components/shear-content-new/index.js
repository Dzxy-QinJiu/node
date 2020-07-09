/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/8.
 */
require('./index.less');
var classNames = require('classnames');
import Truncate from 'react-truncated-component';
class ShearContent extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        more: PropTypes.string,
        less: PropTypes.string,
        text: PropTypes.node,
        lines: PropTypes.number,
        lineHeight: PropTypes.number,
        hasEditBtn: PropTypes.bool,
        editBtnChange: PropTypes.func
    };

    static defaultProps = {
        lines: 3,
        lineHeight: 20,
        more: Intl.get('shear.expand', '展开'),
        less: Intl.get('crm.contact.way.hide', '收起')
    };

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            truncated: false
        };
    }

    handleTruncate = (truncated) => {
        if (this.state.truncated !== truncated) {
            this.setState({
                truncated
            });
        }
    }

    toggleLines = (event) => {
        event.preventDefault();

        this.setState({
            expanded: !this.state.expanded
        });
    }
    onClickEdit = (event) => {
        _.isFunction(this.props.editBtnChange) && this.props.editBtnChange(event);
    }
    render() {
        const {lines,lineHeight, more, less, children} = this.props;

        const {truncated, expanded} = this.state;
        let editBtn = this.props.hasEditBtn ? (<i className='iconfont icon-edit-btn handle-btn-item' title={Intl.get('common.edit', '编辑')} onClick={this.onClickEdit} />) : null;
        return (
            <React.Fragment>
                {children ? (
                    <Truncate
                        numberOfLines={!expanded && lines}
                        lineHeight={lineHeight}
                        ellipsis={
                            (<span>
                                        ...
                                <a className="more-click" href="#" onClick={this.toggleLines}>{more}</a>
                                {/* {editBtn} */}
                            </span>)
                        }
                        onTruncate={this.handleTruncate}
                    >
                        <p className="less-container">
                            {children}
                            {/* {!truncated ? editBtn : null} */}
                            {truncated && expanded && (
                                <span>
                                    <a className="less-click" href="#" onClick={this.toggleLines}>{less}</a>
                                    {/* {editBtn} */}
                                </span>)}
                        </p>
                    </Truncate>) : null }
                {editBtn}
            </React.Fragment>
        );
    }
}
export default ShearContent;
