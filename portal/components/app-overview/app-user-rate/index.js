/**
 * 应用中用户在今日、本周和本月的组件抽取
 * */
require('./index.scss');
import { Progress} from 'antd';
class AppUserRate extends React.Component {
    constructor(props) {
        super(props);
    }
    render () {
        let userRate = this.props.appUserRate;
        return (
            <div className="app-rate-item">
                <div className="item-number">{userRate.active}</div>
                <div className="item-info">
                    <span className="info-date">{userRate.date}</span>
                    <span className="info-rate">{(userRate.percent * 100).toFixed(2)}%</span>
                </div>
                <Progress percent={(userRate.percent * 100).toFixed(2)} showInfo={false} />
            </div>
        );
    }
}

export default AppUserRate;