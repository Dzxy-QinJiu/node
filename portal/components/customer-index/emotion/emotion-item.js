/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */

class EmotionItem extends React.Component {

    getUrl = () => {
        let emotionUrl = this.props.item.shortname.substring(1, this.props.item.shortname.length - 1) + '.svg';
        return require(`../../../static/images/emotion/${emotionUrl}`);
    };

    render() {
        return (
            <div className="item" onClick={this.props.handleClick}>
                <img src={this.getUrl()}/>
            </div>
        );
    }
}

EmotionItem.propTypes = {
    item: PropTypes.object,
    handleClick: PropTypes.func
};
export default EmotionItem;