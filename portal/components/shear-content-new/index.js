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
        lines: PropTypes.number
    };

    static defaultProps = {
        lines: 3,
        more: '展开',
        less: '收起'
    };

    constructor(...args) {
        super(...args);

        this.state = {
            expanded: false,
            truncated: false
        };

        this.handleTruncate = this.handleTruncate.bind(this);
        this.toggleLines = this.toggleLines.bind(this);
    }

    handleTruncate(truncated) {
        if (this.state.truncated !== truncated) {
            this.setState({
                truncated
            });
        }
    }

    toggleLines(event) {
        event.preventDefault();

        this.setState({
            expanded: !this.state.expanded
        });
    }

    render() {
        const {lines, more, less, children} = this.props;

        const {truncated, expanded} = this.state;

        return (
            <span>
                <Truncate
                    numberOfLines={!expanded && 3}
                    lineHeight={20}
                    ellipsis={
                        (<span>...{' '}<a href="#" onClick={this.toggleLines}>{more}</a></span>)
                    }
                    onTruncate={this.handleTruncate}
                >
                    <p style={{display: 'inline-block'}}>
                        {children}
                        {truncated && expanded && (
                            <span>
                                {' '}
                                <a href="#" onClick={this.toggleLines}>{less}</a>
                            </span> )}
                    </p>
                </Truncate>
            </span>
        );
    }
}
// ShearContent.defaultProps = {
//     rowsNum: 3,
//     children: null,
//     jsx: null
// };
ShearContent.propTypes = {
    rowsNum: PropTypes.number,
    children: PropTypes.object,
    jsx: PropTypes.element
};
export default ShearContent;
