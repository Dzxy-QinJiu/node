/**
 * 报告页面布局高阶组件
 *
 * 用于对报告页面进行整体布局，切分出顶部筛选区域、左侧导航和右侧内容区域
 *
 * 参数说明： ReportContent 报告内容，ReportFilter 顶部筛选器
 */
require('./style.less');
import {Row, Col} from 'antd';
import ReportLeftMenu from 'CMP_DIR/report-left-menu';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';

export default function(ReportContent, ReportFilter) {
    return class extends React.Component {
        render() {
            return (
                <div className="report-layout">
                    <ButtonZones>
                        <div className="btn-item-container">
                            <ReportFilter {...this.props} />
                        </div>
                    </ButtonZones>
                    <div className="report-content">
                        <Row>
                            <Col span={3}>
                                <ReportLeftMenu/>
                            </Col>
                            <Col span={21} >
                                <ReportContent {...this.props} />
                            </Col>
                        </Row>
                    </div>
                </div>
            );
        }
    };
}
