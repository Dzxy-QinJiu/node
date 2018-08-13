/**
 * 选择应用组件
 */
require('./index.less');
import { Checkbox, Icon } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const PropTypes = React.PropTypes;

class SelectAppList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAppListShow: false
        };
    }
    appList() {
        return (
            <div className='select-app-content'>
                <Checkbox.Group onChange={this.props.getSelectAppList}>
                    {this.props.appList.map( (appItem) => {
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
        //        let unSelectedAppList = this.getUnselectAppList();
        this.setState({
            isAppListShow: true,
            //            appList: unSelectedAppList
        });
    }
    render() {
        return (
            <div className='app-select-list'>
                <div className='product-info' onClick={this.showAppListPanel}>
                    <Icon type='plus'/>
                    <span className='add-title'>{Intl.get('common.app', '应用')}</span>
                </div>
                {this.state.isAppListShow ? (
                    <div className='app-select-list-wrap'>
                        <div className='select-app-wrap'>
                            <GeminiScrollbar>
                                {this.appList()}
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

SelectAppList.defaultProps = {
    appList: [],
    getSelectAppList: function() {},
};

SelectAppList.propTypes = {
    appList: PropTypes.array,
    getSelectAppList: PropTypes.func,
};

export default SelectAppList;
