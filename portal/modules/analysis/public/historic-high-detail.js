/**
 * 试用合格客户统计历史最高值明细
 */

//require('./style.less');

class HistoricHighDetail extends React.Component {
    static defaultProps = {
    };

    static propTypes = {
    };

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    componentDidMount() {
        console.log(this.props);
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className='historic-high-detail'>
            </div>
        );
    }
}

export default HistoricHighDetail;
