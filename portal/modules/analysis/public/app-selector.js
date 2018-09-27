/**
 * 应用选择器
 */

import { storageUtil } from 'ant-utils';
import Store from './store';
import { Select} from 'antd';
const Option = Select.Option;
const emitters = require('PUB_DIR/sources/utils/emitters');
const appSelectorEmitter = emitters.appSelectorEmitter;

class AppSelector extends React.Component {
    static defaultProps = {
        storedAppIdKey: '',
        defaultValue: '',
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, this.props.defaultValue);
    }

    onAppChange = (appId) => {
        appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, appId);
        storageUtil.local.set(this.props.storedAppIdKey, appId);
    };

    render() {
        return (
            <div className='app-selector'>
                <Select
                    defaultValue={this.props.defaultValue}
                    onChange={this.onAppChange}
                    dropdownMatchSelectWidth={false}
                >
                    {_.map(Store.appList, (item, index) => {
                        return <Option key={index} value={item.app_id}>{item.app_name}</Option>;
                    })}
                </Select>
            </div>
        );
    }
}

export default AppSelector;
