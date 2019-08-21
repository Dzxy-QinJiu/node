/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/24.
 */
import RecommendCustomerCondition from './recommend_customer_condition';
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../../css/add-customer-recomment.less');
import classNames from 'classnames';
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
        var cls = classNames({
            'right-panel-modal show-modal recommend-list-wrap': this.props.showModal
        });
        return (
            <div className={cls}>
                <RightPanel showFlag={true} data-tracename="设置推荐线索条件表单" className="add-focus-customer">
                    <span className="iconfont icon-close add-focus-customer-btn"
                        onClick={this.props.hideFocusCustomerPanel}
                        data-tracename="关闭设置推荐线索条件表单"></span>
                    <div className="add-focuse-customer-wrap">
                        <RecommendCustomerCondition
                            hasSavedRecommendParams={this.props.hasSavedRecommendParams}
                            saveRecommedConditionsSuccess={this.props.saveRecommedConditionsSuccess}
                            hideFocusCustomerPanel={this.props.hideFocusCustomerPanel}
                        />
                    </div>
                </RightPanel>
            </div>

        );
    }
}
RecommendCustomerRightPanel.defaultProps = {
    hideFocusCustomerPanel: function() {
        
    },
    hasSavedRecommendParams: {},
    saveRecommedConditionsSuccess: function() {

    },
    showModal: true
};
RecommendCustomerRightPanel.propTypes = {
    hideFocusCustomerPanel: PropTypes.func,
    hasSavedRecommendParams: PropTypes.object,
    saveRecommedConditionsSuccess: PropTypes.func,
    showModal: PropTypes.boolean

};
module.exports = RecommendCustomerRightPanel;