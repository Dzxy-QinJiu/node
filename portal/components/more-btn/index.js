/**
 * Created by sunqingfeng on 2019/10/15.
 */
import './index.less';
import {Button, Dropdown} from 'antd';

class MoreButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Dropdown overlay={this.props.topBarDropList()} placement="bottomRight"
                overlayClassName='responsive-top-bar-dropDown' >
                <Button className='more-btn'>
                    <i className="iconfont icon-more"></i>
                </Button>
            </Dropdown>
        );
    }
}
MoreButton.defaultProps = {
    topBarDropList: function() {},
};
MoreButton.propTypes = {
    topBarDropList: PropTypes.func,
};

module.exports = MoreButton;
