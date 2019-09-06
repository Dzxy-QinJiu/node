/**
 * Created by hzl on 2019/9/3.
 */
import { Button } from 'antd';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

const OPERATE_ZONE_WIDTH = 100; // 按钮操作区的宽度

class CustomerStageTimeLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerStage: props.customerStage
        };
    }

    render() {
        let customerStage = this.props.customerStage;
        let name = customerStage.name; // 阶段名称
        let description = customerStage.description;
        let contentZoneCls = classNames('customer-stage-content', {
            'no-description-content': !description});
        return (
            <div
                className="customer-stage-timeline-item-content"
                data-tracename="客户阶段列表"
            >
                <div className={contentZoneCls}>
                    <div className="customer-stage-content-name">
                        <span>{name}</span>
                    </div>
                    <div className="customer-stage-content-describe">
                        {description}
                    </div>
                </div>

            </div>
        );
    }
}

CustomerStageTimeLine.propTypes = {
    customerStage: PropTypes.object,

};

export default CustomerStageTimeLine;