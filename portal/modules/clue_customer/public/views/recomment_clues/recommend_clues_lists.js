/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/25.
 */
require('../../css/recommend_clues_lists.less');
import {Button,message} from 'antd';
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerStore = require('../../store/clue-customer-store');
import RecommendCluesForm from '../recomment_clues/recommend_clues_form';
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import {getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import userData from 'PUB_DIR/sources/user-data';
const LAYOUT_CONSTANTS = {
    TH_MORE_HEIGHT: 10
};
var classNames = require('classnames');
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
        var conditionObj = _.cloneDeep(_.get(this, 'state.settedCustomerRecommend.obj'));
        //去掉一些不用的属性
        delete conditionObj.id;
        delete conditionObj.user_id;
        delete conditionObj.organization;
        conditionObj.load_size = this.state.pageSize;
        //去掉为空的数据
        clueCustomerAction.getRecommendClueLists(conditionObj);
    }

    componentWillReceiveProps(nextProps) {

    }

    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onStoreChange);
    }

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
        });
    };
    hideFocusCustomerPanel = () => {
        this.setState({
            showEditConditionPanel: false
        });
    };
    //保存成功后需要获取数据
    saveRecommedConditionsSuccess = (saveCondition) => {
        clueCustomerAction.saveSettingCustomerRecomment(saveCondition);
        this.hideFocusCustomerPanel();
        this.getRecommendClueLists();
    };
    handleExtractRecommendClues = (record) => {
        var clueId = record.id;
        $.ajax({
            url: '/rest/clue/extract/recommend/clue',
            dataType: 'json',
            type: 'get',
            data: {
                id: clueId
            },
            success: (data) => {
                if (data){
                    //提取成功后，把该线索在列表中删除
                    message.success(Intl.get('clue.extract.success', '提取成功'));
                    clueCustomerAction.filterExtractClue(record);
                    //线索提取完后，会到待分配状态中
                }else{
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            },
            error: (xhr) => {
                message.error(Intl.get('clue.extract.failed', '提取失败'));
            }
        });

    };
    getRecommendClueTableColunms = () => {
        const column_width = '80px';
        let columns = [
            {
                title: Intl.get('clue.customer.recommend.clue.lists', '推荐线索'),
                dataIndex: 'name',
                width: '300px',
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'legalPerson',
                width: '300px',
            }, {
                title: Intl.get('common.phone', '电话'),
                dataIndex: 'telephones',
                width: '300px',
            },
            {
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'oprate_btn',
                width: '300px',
                render: (text, record, index) => {
                    return (
                        <div className="extract-recommend-lists">
                            <span onClick={this.handleExtractRecommendClues.bind(this, record)}>{Intl.get('clue.extract', '提取')}</span>

                        </div>
                    );
                }
            }
        ];
        return columns;
    };
    renderRecommendClueLists = () => {
        if (this.state.isLoadingRecommendClue) {
            return <Spinner/>;
        } else if (this.state.getRecommendClueErrMsg) {
            return (<div className="errmsg-container">
                <span className="errmsg-tip">{this.state.getRecommendClueErrMsg},</span>
                <a className="retry-btn" onClick={this.getRecommendClueLists}>
                    {Intl.get('user.info.retry', '请重试')}
                </a>
            </div>);
        } else {
            return (
                <AntcTable
                    rowKey={this.getRowKey}
                    dataSource={this.state.recommendClueLists}
                    pagination={false}
                    columns={this.getRecommendClueTableColunms()}
                    scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                />);
        }
    };
    getRowKey = (record, index) => {
        return index;
    };

    render() {
        return (
            <RightPanel showFlag={true} data-tracename="推荐线索列表类型" className="recommend-customer-list">
                <RightPanelClose onClick={this.closeRecommendCluePanel}/>
                <div className="recommend-clue-panel">
                    <TopNav>
                        <div className='recommend-customer-top-nav-wrap'>
                            <Button className="btn-item"
                                onClick={this.handleClickRefreshBtn}>{Intl.get('clue.customer.refresh.list', '换一批')}</Button>
                            <Button className="btn-item"
                                onClick={this.handleClickEditCondition}>{Intl.get('clue.customer.condition.change', '修改条件')}</Button>

                        </div>
                    </TopNav>
                    <div className="recommend-clue-content-container">
                        {this.renderRecommendClueLists()}
                    </div>

                </div>
                {this.state.showEditConditionPanel ? <RecommendCluesForm
                    hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                    hideFocusCustomerPanel={this.hideFocusCustomerPanel}
                    saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                /> : null}


            </RightPanel>

        );
    }
}

RecommendCustomerRightPanel.defaultProps = {
    hideFocusCustomerPanel: function() {

    },
    hasSavedRecommendParams: {},
    closeRecommendCluePanel: function() {

    },
};
RecommendCustomerRightPanel.propTypes = {
    hideFocusCustomerPanel: PropTypes.func,
    hasSavedRecommendParams: PropTypes.object,
    closeRecommendCluePanel: PropTypes.func,

};
module.exports = RecommendCustomerRightPanel;