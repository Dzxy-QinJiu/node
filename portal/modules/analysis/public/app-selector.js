/**
 * 应用选择器
 */

import { storageUtil } from 'ant-utils';
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
        //应用列表
        appList: []
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
        appList: PropTypes.array,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedApp: this.props.defaultValue,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultValue !== this.props.defaultValue) {
            this.setState({
                selectedApp: nextProps.defaultValue,
            });
        }
    }

    onAppChange = (appId) => {
        let selectedApp; 
        let appIdStr;
         
        //如果清空了所有选中项
        if (_.isEmpty(appId)) {
            const firstAppId = this.props.appList[0].app_id;
            //默认选中第一个应用
            selectedApp = [firstAppId];
            appIdStr = firstAppId;
        //如果选择了全部应用
        } else if (_.last(appId) === 'all') {
            selectedApp = ['all'];
            appIdStr = 'all';
        } else {
            selectedApp = _.filter(appId, id => id !== 'all');
            appIdStr = selectedApp.join(',');
        }

        this.setState({selectedApp}, () => {
            appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, appIdStr);
        });
        storageUtil.local.set(this.props.storedAppIdKey, appIdStr);
    };

    render() {
        const appList = this.props.appList;

        return (
            <div className='app-selector'>
                <Select
                    mode="multiple"
                    value={this.state.selectedApp}
                    onChange={this.onAppChange}
                    dropdownMatchSelectWidth={false}
                >
                    {_.map(appList, (item, index) => {
                        return <Option key={index} value={item.app_id}>{item.app_name}</Option>;
                    })}
                </Select>
            </div>
        );
    }
}

export default AppSelector;
