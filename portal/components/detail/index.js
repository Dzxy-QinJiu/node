/**
 * 详情组件
 */

require('./style.less');
import RightPanelModal from '../right-panel-modal';
import GeminiScrollBar from '../react-gemini-scrollbar';
import adaptiveHeightHoc from '../adaptive-height-hoc';
import ReactResizeDetector from 'react-resize-detector';
import { Tabs } from 'antd';
import { detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
const { TabPane } = Tabs;
const uuidv4 = require('uuid/v4');

class Detail extends React.Component {
    render() {
        return (
            <div>
                <RightPanelModal
                    className="detail-component"
                    isShowCloseBtn={true}
                    onClosePanel={this.hide}
                    title={this.props.title}
                    content={this.renderDetailContent()}
                />
            </div>
        );
    }

    renderDetailContent = () => {
        if (this.props.tabs) {
            return (
                <Tabs defaultActiveKey="0">
                    {_.map(this.props.tabs, (tab, index) => (
                        <TabPane tab={tab.title} key={index}>
                            {this.renderContent(tab.content)}
                        </TabPane>
                    ))}
                </Tabs>
            );
        } else {
            return this.renderContent(this.props.content);
        }
    }

    renderContent = (content) => {
        const gemiBarRefName = 'gemiBar_' + uuidv4();

        return (
            <div className="detail-content" style={{height: this.props.adaptiveHeight}}>
                <GeminiScrollBar ref={refInstance => this[gemiBarRefName] = refInstance}>
                    <div className='content-wrapper'>
                        {content}
                        <ReactResizeDetector handleHeight onResize={this.onContentWrapperResize.bind(this, gemiBarRefName)} />
                    </div>
                </GeminiScrollBar>
            </div>
        );
    }

    onContentWrapperResize(gemiBarRefName) {
        this[gemiBarRefName].update();
    }

    hide = () => {
        detailPanelEmitter.emit(detailPanelEmitter.HIDE);
    }
}

export default adaptiveHeightHoc(Detail, '.detail-content', 10);
