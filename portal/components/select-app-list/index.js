/**
 * 选择应用组件
 */
require('./style.less');
import { Checkbox, Icon } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const PropTypes = React.PropTypes;

class SelectAppList extends React.Component {
    static defaultProps = {
        appList: [],
        getSelectAppList: function() {},
    };

    static propTypes = {
        appList: PropTypes.array,
        getSelectAppList: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isAppListShow: false,
            appList: _.cloneDeep(this.props.appList),
            selectedAppIds: [],
        };
    }
    componentWillReceiveProps(nexProps) {
        this.setState({appList: nexProps.appList});
    }
    handleChange = selectedAppIds => {
        this.setState({selectedAppIds});
    }
    renderAppList() {
        return (
            <div className='select-app-content'>
                <Checkbox.Group onChange={this.handleChange}>
                    {this.state.appList.map( (appItem) => {
                        return (
                            <Checkbox value={appItem.client_id} key={appItem.client_id}>
                                {
                                    appItem.client_image ? (
                                        <span className='app-self-image'><img src={appItem.client_image} /></span>
                                    ) : (
                                        <span className='app-default-image'>
                                            <i className='iconfont icon-app-default'></i>
                                        </span>
                                    )
                                }
                                <span className='app-name'>{appItem.client_name}</span>
                            </Checkbox>
                        );
                    } )}
                </Checkbox.Group>
            </div>
        );
    }
    showAppListPanel = (event) => {
        //        Trace.traceEvent(event, '点击添加应用');
        this.setState({
            isAppListShow: true,
        });
    }
    handleSureBtn = (event) => {
        //        Trace.traceEvent(event, '点击保存');
        let appList = _.cloneDeep(this.state.appList);

        const selectedAppIds = _.clone(this.state.selectedAppIds);

        appList = _.filter(appList, app => selectedAppIds.indexOf(app.client_id) === -1);

        this.setState({
            appList,
            selectedAppIds: [],
            isAppListShow: false,
        }, () => {
            this.props.getSelectAppList(selectedAppIds);
        });
    }
    handleCancelBtn = (event) => {
        //        Trace.traceEvent(event, '点击取消');
        this.setState({
            selectedAppIds: [],
            isAppListShow: false
        });
    }
    render() {
        return (
            <div className='app-select-list'>
                <div className='add-btn' onClick={this.showAppListPanel}>
                    <Icon type='plus'/>
                    <span className='add-title'>{Intl.get('common.app', '应用')}</span>
                </div>
                {this.state.isAppListShow ? (
                    <div className='app-select-list-wrap'>
                        <div className='select-app-wrap'>
                            <GeminiScrollbar>
                                {this.renderAppList()}
                            </GeminiScrollbar>
                        </div>
                        <div className='sure-cancel-btn' data-tracename="应用选择面板">
                            <span className='sure-btn' onClick={this.handleSureBtn}>{Intl.get('common.confirm', '确认')}</span>
                            <span className='cancel-btn' onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</span>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default SelectAppList;
