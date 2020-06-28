/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/24.
 */
//自定义的进度条
import {leadRecommendEmitter} from 'OPLATE_EMITTER';
import {Progress} from 'antd';

class CustomProgress extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            percent: 0
        };
    }

    componentDidMount() {
        leadRecommendEmitter.on(leadRecommendEmitter.BATCH_EXTRACT_PRTOGRESS_PERCENT, this.setPercent);
    }

    componentWillUnmount() {
        leadRecommendEmitter.removeListener(leadRecommendEmitter.BATCH_EXTRACT_PRTOGRESS_PERCENT, this.setPercent);
    }

    setPercent = (percent) => {
        this.setState({percent});
    };

    render() {
        let props;
        if(_.has(this.props, 'percent')) {
            props = this.props;
        }else {
            props = _.omit(this.props, ['percent']);
            props.percent = this.state.percent;
        }

        return (
            <Progress {...props}/>
        );
    }
}
CustomProgress.propTypes = {
    percent: PropTypes.number,
};
export default CustomProgress;