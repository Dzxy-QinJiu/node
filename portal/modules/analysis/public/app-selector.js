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
        defaultValue: ['all'],
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedApp: this.props.defaultValue,
        };
    }

    onAppChange = (appId) => {
        let selectedApp; 
        let appIdStr;
         
        if (_.last(appId) === 'all' || _.isEmpty(appId)) {
            selectedApp = ['all'];
            appIdStr = 'all';
        } else {
            selectedApp = _.filter(appId, id => id !== 'all');
            appIdStr = selectedApp.join(',');
        }

        this.setState({selectedApp}, () => {
            appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, appIdStr);
        });
        storageUtil.local.set(this.props.storedAppIdKey, appId);
    };

    render() {
        return (
            <div className='app-selector'>
                <Select
                    mode="multiple"
                    value={this.state.selectedApp}
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
