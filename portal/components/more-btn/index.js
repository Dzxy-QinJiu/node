/**
 * Created by sunqingfeng on 2019/10/15.
 */
import './index.less';
import {Button, Dropdown} from 'antd';
import { isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';

class MoreButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { isWebMin } = isResponsiveDisplay();
        let trigger = ['hover'];
        if(isWebMin) {
            trigger = ['click'];
        }
        return (
            <Dropdown overlay={this.props.topBarDropList()} placement="bottomRight"
                title={Intl.get('crm.basic.more', '更多')}
                trigger={trigger}
                overlayClassName='responsive-top-bar-dropDown' >
                {this.props.isUseButton ? (
                    <Button className='more-btn'>
                        <i className="iconfont icon-more"/>
                    </Button>
                ) : <span className="more-btn">
                    <i className="iconfont icon-more"/>
                </span>}
            </Dropdown>
        );
    }
}
MoreButton.defaultProps = {
    topBarDropList: function() {},
    isUseButton: true
};
MoreButton.propTypes = {
    topBarDropList: PropTypes.func,
    isUseButton: PropTypes.bool
};

module.exports = MoreButton;
