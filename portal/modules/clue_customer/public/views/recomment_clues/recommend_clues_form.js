/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/24.
 */
import RecommendCustomerCondition from './recommend_customer_condition';
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../../css/add-customer-recomment.less');
class RecommendCustomerRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onStoreChange = () => {

    };

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <RightPanel showFlag={true} data-tracename="添加关注的客户类型" className="add-focus-customer">
                <span className="iconfont icon-close add-focus-customer-btn"
                    onClick={this.props.hideFocusCustomerPanel}
                    data-tracename="关闭添加关注的客户类型面板"></span>
                <div className="add-focuse-customer-wrap">
                    <RecommendCustomerCondition
                        hasSavedRecommendParams={this.props.hasSavedRecommendParams}
                        saveRecommedConditionsSuccess={this.props.saveRecommedConditionsSuccess}
                    />
                </div>
            </RightPanel>

        );
    }
}
RecommendCustomerRightPanel.defaultProps = {
    hideFocusCustomerPanel: function() {
        
    },
    hasSavedRecommendParams: {},
    saveRecommedConditionsSuccess: function() {

    },
};
RecommendCustomerRightPanel.propTypes = {
    hideFocusCustomerPanel: PropTypes.func,
    hasSavedRecommendParams: PropTypes.object,
    saveRecommedConditionsSuccess: PropTypes.func,

};
module.exports = RecommendCustomerRightPanel;