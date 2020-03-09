/**
 * 自适应高度计算高阶组件
 *
 * 用于在初次加载或窗口大小变化时计算被包裹组件里指定元素除去其上偏移和底边距后的高度
 *
 * 多与滚动条组件配合使用，计算滚动条组件外层容器的高度
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
