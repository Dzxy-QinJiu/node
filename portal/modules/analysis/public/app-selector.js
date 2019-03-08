/**
 * 应用选择器
 */

import { storageUtil } from 'ant-utils';
import Store from './store';
import {DEFERRED_ACCOUNT_ANALYSIS_TITLE} from './consts';
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
        //当前页
        currentPage: {}
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
        currentPage: PropTypes.object,
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
        storageUtil.local.set(this.props.storedAppIdKey, appIdStr);
    };

    render() {
        let appList = _.cloneDeep(Store.appList);

        if (this.props.currentPage.title === DEFERRED_ACCOUNT_ANALYSIS_TITLE) {
            appList.splice(0, 1);
        }

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
