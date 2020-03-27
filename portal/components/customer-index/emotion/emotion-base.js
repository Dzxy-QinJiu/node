/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */
import './css/emotion-base.less';
import EmotionMarquee from './emotion-marquee';
import EmotionMarqueeContent from './emotion-marquee-content';
import EmotionList from './emotion-list';

class EmotionBase extends React.Component {
    render() {
        return (
            <div className="emotion-base">
                <EmotionMarquee ref="emotionMarquee">
                    {this.props.emotionTypes.map((item, index) => (
                        <EmotionMarqueeContent key={index + 1} parent={this}>
                            <EmotionList
                                panelIndex={index}
                                emotionTypes={this.props.emotionTypes}
                                emotionArray={this.props.emotionArray}
                                rows={this.props.rows}
                            />
                        </EmotionMarqueeContent>
                    ))}
                </EmotionMarquee>
            </div>
        );
    }
}

EmotionBase.defaultProps = {
    nums: 4,
    rows: 4,
    emotionTypes: [],
    emotionArray: {},
};
EmotionBase.propTypes = {
    nums: PropTypes.number,
    emotionTypes: PropTypes.array,
    emotionArray: PropTypes.object,
    rows: PropTypes.number,
};
export default EmotionBase;