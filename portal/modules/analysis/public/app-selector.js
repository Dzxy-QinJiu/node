/**
 * 应用选择器
 */

import { storageUtil } from 'ant-utils';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const emitters = require('PUB_DIR/sources/utils/emitters');
const appSelectorEmitter = emitters.appSelectorEmitter;

class AppSelector extends React.Component {
    static defaultProps = {
        //在loacalStorage中存储选中的应用id的键名
        storedAppIdKey: '',
        //外部条件默认值
        defaultValue: ['all'],
        //应用列表
        appList: [],
        //选择模式，默认多选
        selectMode: 'multiple'
    };

    static propTypes = {
        storedAppIdKey: PropTypes.string,
        defaultValue: PropTypes.string,
        appList: PropTypes.array,
        selectMode: PropTypes.string
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
         
        //如果选中值是数组，按数组处理
        if (_.isArray(appId)) {
            //如果清空了所有选中项
            if (_.isEmpty(appId)) {
                const firstAppId = _.get(this.props, 'appList[0].app_id');
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
        //否则，按字符串处理
        } else {
            selectedApp = [appId];
            appIdStr = appId;
        }

        this.setState({selectedApp}, () => {
            appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, appIdStr);
        });
        storageUtil.local.set(this.props.storedAppIdKey, appIdStr);
    };

    render() {
        const appList = this.props.appList;
        const selectMode = this.props.selectMode;
        let selectedValue = this.state.selectedApp;

        //单选模式下，需要将选中值由数组转成字符串
        if (selectMode === '' && _.isArray(selectedValue)) {
            selectedValue = selectedValue[0];
        }

        return (
            <div className='app-selector'>
                {_.isEmpty(appList) ? null : (
                    <AntcSelect
                        mode={selectMode}
                        value={selectedValue}
                        onChange={this.onAppChange}
                        dropdownMatchSelectWidth={false}
                    >
                        {_.map(appList, (item, index) => {
                            return <Option key={index} value={item.app_id}>{item.app_name}</Option>;
                        })}
                    </AntcSelect>
                )}
            </div>
        );
    }
}

export default AppSelector;
