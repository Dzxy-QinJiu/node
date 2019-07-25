/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/25.
 */
require('../../css/recommend_clues_lists.less');
import {Button} from 'antd';
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerStore = require('../../store/clue-customer-store');
import RecommendCluesForm from '../recomment_clues/recommend_clues_form';
import {AntcTable} from 'antc';
class RecommendCustomerRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...clueCustomerStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        clueCustomerStore.listen(this.onStoreChange);
        //获取推荐的线索
        this.getRecommendClueLists();
    }
    getRecommendClueLists = () => {
        var conditionObj = _.cloneDeep(_.get(this,'state.settedCustomerRecommend.obj'));
        conditionObj.load_size = this.state.pageSize;
        clueCustomerAction.getRecommendClueLists(conditionObj);
    }

    componentWillReceiveProps(nextProps) {

    }

    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onStoreChange);
    };
    // 关闭提取线索界面
    closeRecommendCluePanel = () => {
        this.props.closeRecommendCluePanel();

    };
    handleClickRefreshBtn = () => {
        this.getRecommendClueLists();
    };
    handleClickEditCondition = () => {
        this.setState({
            showEditConditionPanel: true
        })
    };
    hideFocusCustomerPanel = () => {
        this.setState({
            showEditConditionPanel: false
        });
    };
    //保存成功后需要获取数据
    saveRecommedConditionsSuccess = () => {
        this.hideFocusCustomerPanel();
        this.getRecommendClueLists();
    };
    getRecommendClueTableColunms = () => {
        const column_width = '80px';
        let columns = [
           {
               title: Intl.get('clue.customer.recommend.clue.lists', '推荐线索'),
                dataIndex: 'trace_content',
                width: '300px',
                render: (text, salesClueItem, index) => {
                    return(
                        <div className="clue-foot" id="clue-foot">
                            {_.get(this,'state.isEdittingItem.id') === salesClueItem.id ? this.renderEditTraceContent(salesClueItem) :
                                this.renderShowTraceContent(salesClueItem)
                            }
                        </div>
                    );
                }
            }];
        return columns;
    };
    renderRecommendClueLists = () => {
        const dropLoadConfig = {
            loading: this.state.isLoadingRecommendClue,
        };
       return    <AntcTable
           // rowSelection={rowSelection}
           // rowKey={rowKey}
           dropLoad={dropLoadConfig}
           dataSource={this.state.recommendClueLists}
           pagination={false}
           columns={this.getRecommendClueTableColunms()}
           // rowClassName={this.setInvalidClassName}
           // scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
       />);
    };

    render() {
        return (
            <RightPanel showFlag={true} data-tracename="推荐线索列表类型" className="recommend-customer-list">
                <div className="recommend-clue-panel">
                    <div className='recommend-customer-top-nav-wrap'>
                        <RightPanelClose onClick={this.closeRecommendCluePanel}/>
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <Button className="btn-item" onClick={this.handleClickRefreshBtn}>{Intl.get('clue.customer.refresh.list', '换一批')}</Button>
                                <Button className="btn-item" onClick={this.handleClickEditCondition}>{Intl.get('clue.customer.condition.change', '修改条件')}</Button>

                            </div>
                        </div>
                    </div>
                    {this.renderRecommendClueLists()}
                </div>
                {this.state.showEditConditionPanel ? <RecommendCluesForm
                    hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                    hideFocusCustomerPanel={this.hideFocusCustomerPanel}
                    saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                /> : null}


            </RightPanel>

        );
    }
};
RecommendCustomerRightPanel.defaultProps = {
    hideFocusCustomerPanel: function () {

    },
    hasSavedRecommendParams: {},
    closeRecommendCluePanel: function () {

    },
}
RecommendCustomerRightPanel.propTypes = {
    hideFocusCustomerPanel: PropTypes.func,
    hasSavedRecommendParams: PropTypes.object,
    closeRecommendCluePanel: PropTypes.func,

};
module.exports = RecommendCustomerRightPanel;