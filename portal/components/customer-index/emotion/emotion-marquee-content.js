/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */
import './css/emotion-marquee-content.less';
import classNames from 'classnames';

class EmotionMarqueeContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: this.props.key
        };
    }

    getActive() {
        let {parent} = this.props;
        return _.get(parent.refs,'emotionMarquee.state.currentNumber') === this.state.key;
    }

    render() {
        let cls = classNames('emotion-marquee-content', {
            'active': this.getActive()
        });
        return (
            <div className={cls}>
                {this.props.children}
            </div>
        );
    }
}

EmotionMarqueeContent.defaultProps = {
    key: 1
};
EmotionMarqueeContent.propTypes = {
    children: PropTypes.element,
    key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    parent: PropTypes.object
};
export default EmotionMarqueeContent;