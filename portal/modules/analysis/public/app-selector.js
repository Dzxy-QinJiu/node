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
        //在loacalStorage中存储选中的应用id的键名
        storedAppIdKey: '',
        //外部条件默认值
        defaultValue: '',
        //外部条件初始值
        initialValue: '',
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
        initialValue: PropTypes.string,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        //组件装载时设置外部条件为默认值
        appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, this.props.defaultValue);
    }

    componentWillUnmount() {
        //组件卸载时让外部条件恢复初始值
        appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, this.props.initialValue);
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
