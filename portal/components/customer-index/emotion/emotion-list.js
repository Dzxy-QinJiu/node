/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */
import './css/emotion-list.less';
import EfLoadMore from 'CMP_DIR/ef-components/load-more';
import EmotionItem from './emotion-item';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

class EmotionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemSize: 24,
            borderWidth: 2,
            marginWidth: 8,
            panelInfo: [],
            bodyHeight: 0,
            offsetMargin: 0,
            bodyWidth: 0
        };
    }

    componentDidMount() {
        this.getPanelInfo();
    }

    getPanelInfo() {
        let { emotionArray, emotionTypes, panelIndex} = this.props;
        this.setState({
            panelInfo: emotionArray[emotionTypes[panelIndex]]
        });
    }

    handleClick = (msg) => {
        customerServiceEmitter.emit(customerServiceEmitter.CLICK_EMOTION_IMAGE, msg);
    };

    render() {
        return (
            <div className="inner-marquee-body">
                <div className="body">
                    <div className="inner-marquee-content">
                        <EfLoadMore ref="loadMore">
                            {this.state.panelInfo.map(item => (
                                <EmotionItem
                                    key={item.name}
                                    itemSize={this.state.itemSize}
                                    item={item}
                                    borderWidth={this.state.borderWidth}
                                    marginWidth={this.state.marginWidth}
                                    offsetMargin={this.state.offsetMargin}
                                    handleClick={this.handleClick.bind(this, item.shortname)}
                                />
                            ))}
                        </EfLoadMore>
                    </div>
                </div>
            </div>
        );
    }
}

EmotionList.defaultProps = {
    emotionTypes: [],
    panelIndex: 0,
    rows: 4,
    emotionArray: {},
    btnType: '',
};
EmotionList.propTypes = {
    emotionTypes: PropTypes.array,
    panelIndex: PropTypes.number,
    rows: PropTypes.number,
    emotionArray: PropTypes.object,
    btnType: PropTypes.string,
};
export default EmotionList;