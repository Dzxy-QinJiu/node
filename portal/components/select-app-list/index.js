/**
 * 选择应用组件
 */
require('./index.less');
import { Checkbox } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const PropTypes = React.PropTypes;

class SelectAppList extends React.Component {
    constructor(props) {
        super(props);
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
    render() {
        return (
            <div className='select-app-wrap'>
                <GeminiScrollbar>
                    {this.appList()}
                </GeminiScrollbar>
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