/**
 * 列表面板组件
 *
 * 用于在右侧面板上展示列表内容，如客户列表或用户列表
 */

require('./style.less');
import TopNav from 'CMP_DIR/top-nav';
import rightPanelUtil from 'CMP_DIR/rightPanel';
import {listPanelEmitter} from 'PUB_DIR/sources/utils/emitters';

const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;

class ListPanel extends React.Component {
    static defaultProps = {
        //列表类型
        listType: '',
        //子组件
        children: null
    };

    static propTypes = {
        listType: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.element])
    };

    constructor(props) {
        super(props);

        this.state = {
            isShow: false
        };
    }

    componentDidMount() {
        listPanelEmitter.on(listPanelEmitter.SHOW, this.show);
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
        listPanelEmitter.removeListener(listPanelEmitter.SHOW, this.show);
    }

    show = paramObj => {
        if (this.props.listType === paramObj.listType) {
            this.setState({
                isShow: true
            });
        }
    }

    hide = () => {
        this.setState({
            isShow: false
        });
    }

    render() {
        return (
            <div className='list-panel'>
                <RightPanel
                    showFlag={this.state.isShow}
                >
                    <TopNav>
                        <RightPanelClose
                            title={Intl.get('common.app.status.close', '关闭')}
                            onClick={this.hide}
                        />
                    </TopNav>
                    <div className="panel-content">
                        {this.state.isShow ? this.props.children : null}
                    </div>
                </RightPanel>
            </div>
        );
    }
}

export default ListPanel;
