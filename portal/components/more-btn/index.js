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
