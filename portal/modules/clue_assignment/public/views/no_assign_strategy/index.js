import './index.less';

class NoStrategy extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="no-strategy-intro">
                <div className="no-strategy-container">
                    <i className="iconfont icon-clue-assign-add"></i>
                    <p className="no-strategy-tip">{Intl.get('clue.assignment.no.strategy.tip', '您还没有线索分配策略')}</p>
                    {this.props.renderAddStrategyBtn()}
                </div>
            </div>
        );
    }
}

NoStrategy.propTypes = {
    renderAddStrategyBtn: PropTypes.func,
};
export default NoStrategy;