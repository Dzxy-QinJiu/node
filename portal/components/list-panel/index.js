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
            //是否显示
            isShow: false,
            //参数对象
            paramObj: null
        };
    }

    componentDidMount() {
        listPanelEmitter.on(listPanelEmitter.SHOW, this.show);
    }

    componentWillUnmount() {
        listPanelEmitter.removeListener(listPanelEmitter.SHOW, this.show);
    }

    show = paramObj => {
        //组件属性里的列表类型和事件参数里的列表类型相匹配时才显示面板
        if (this.props.listType === paramObj.listType) {

            delete paramObj.listType;

            this.setState({
                isShow: true,
                paramObj
            });
        }
    }

    hide = () => {
        this.setState({
            isShow: false
        });
    }

    render() {
        let childrenWithProps = null;
        const { children } = this.props;

        if (children) {
            //为子组件添加属性
            //以实现通过属性控制子组件的展示
            childrenWithProps = React.cloneElement(children, {
                listPanelParamObj: this.state.paramObj
            });
        }

        return (
            <div className='list-panel'>
                <RightPanel
                    showFlag={this.state.isShow}
                    className='panel-wrap'
                >
                    <TopNav>
                        <RightPanelClose
                            title={Intl.get('common.app.status.close', '关闭')}
                            onClick={this.hide}
                        />
                    </TopNav>

                    <div className='panel-content'>
                        {this.state.isShow ? childrenWithProps : null}
                    </div>
                </RightPanel>
            </div>
        );
    }
}

export default ListPanel;
