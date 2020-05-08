/**
 * 蚁坊域客户经理信息高阶组件
 *
 * 用于为包裹的组件提供蚁坊域客户经理信息
 */

import { isEefungCustomerManager } from 'PUB_DIR/sources/utils/common-method-util';
import { getUserPosition } from 'PUB_DIR/sources/utils/common-data-util';

export default function(WrappedComponent) {
    return class extends React.Component {
        state = {
            isEefungCustomerManager: isEefungCustomerManager(),
        }

        componentDidMount() {
            getUserPosition(() => {
                this.setState({
                    isEefungCustomerManager: isEefungCustomerManager()
                });
            });
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state} />;
        }
    };
}
