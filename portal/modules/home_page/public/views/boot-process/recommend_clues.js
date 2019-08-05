/** Created by 2019-07-31 21:43 */
import RecommendCustomerCondition from 'MOD_DIR/clue_customer/public/views/recomment_clues/recommend_customer_condition';
import bootProcessAjax from '../../ajax/boot-process';
import clueCustomerAjax from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ExtractClues from './extract-clue';
import { Button } from 'antd';
import { deleteEmptyProperty } from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';

// 提取线索的步骤
const EXTRACT_CLUE_STEPS = {
    SET_RECOMMEND: 'set_recommend',//设置推荐客户
    EXTRACT_CLUE: 'extract_clue',// 提取线索
};

class RecommendClues extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            errMsg: '',
            settedCustomerRecommend: {}, // 已经设置过的
            recommendClueLists: [],
            step: EXTRACT_CLUE_STEPS.SET_RECOMMEND,
            pageSize: 20,
        };
    }

    componentDidMount() {
        //获取个人线索推荐保存设置
        this.getSettingCustomerRecomment();
    }

    //获取个人线索推荐保存配置
    getSettingCustomerRecomment() {
        this.setState({loading: true});
        clueCustomerAjax.getSettingCustomerRecomment().then((list) => {
            let data = _.get(list, '[0]', {});
            deleteEmptyProperty(data);
            this.setState({loading: false, settedCustomerRecommend: data});
        }, () => {
            this.setState({loading: false});
        });
    }

    //保存成功后需要获取数据,以及展示下一步
    saveRecommedConditionsSuccess = (saveCondition) => {
        deleteEmptyProperty(saveCondition);
        this.setState({
            settedCustomerRecommend: saveCondition,
            step: EXTRACT_CLUE_STEPS.EXTRACT_CLUE
        }, () => {
            this.getRecommendClueLists();
        });
    };

    getRecommendClueLists = () => {
        var conditionObj = _.cloneDeep(_.get(this, 'state.settedCustomerRecommend'));
        //去掉一些不用的属性
        delete conditionObj.id;
        delete conditionObj.user_id;
        delete conditionObj.organization;
        conditionObj.load_size = this.state.pageSize;
        //去掉为空的数据
        this.setState({loading: true});
        bootProcessAjax.getRecommendClueData(conditionObj).then((data) => {
            this.setState({
                loading: false,
                recommendClueLists: data,
                errMsg: ''
            });
        }, (errorMsg) => {
            this.setState({loading: false, errMsg: errorMsg});
        });
    };

    // 返回上一步，重新设置条件
    changeFilter = () => {
        this.setState({
            step: EXTRACT_CLUE_STEPS.SET_RECOMMEND,
            recommendClueLists: []
        });
    };

    renderBackBtn = () => {
        return (
            <Button
                type='primary'
                className='back-btn'
                onClick={this.changeFilter}
            >{Intl.get('clue.customer.condition.change', '修改条件')}</Button>
        );
    };

    renderStepBlock = () => {
        let {
            step,
            loading,
            errMsg,
            recommendClueLists
        } = this.state;
        if(step === EXTRACT_CLUE_STEPS.SET_RECOMMEND) {// 设置推荐客户
            if(loading) {
                return <Spinner/>;
            }
            return (
                <RecommendCustomerCondition
                    hasSavedRecommendParams={this.state.settedCustomerRecommend}
                    saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                />
            );
        }else if(step === EXTRACT_CLUE_STEPS.EXTRACT_CLUE) {// 提取线索
            if(loading) {
                return (
                    <div className="load-content">
                        <Spinner/>
                        <p className="loading-status-tip">{Intl.get('guide.extract.clue.loading', '获取线索中')}</p>
                    </div>
                );
            }else if(errMsg) {
                return (
                    <div className="errmsg-container">
                        <span className="errmsg-tip">{this.state.errMsg},</span>
                        <a className="retry-btn" onClick={this.getRecommendClueLists}>
                            {Intl.get('user.info.retry', '请重试')}
                        </a>
                    </div>
                );
            }else if(!_.get(recommendClueLists,'[0]')) {
                return (
                    <NoDataIntro
                        noDataAndAddBtnTip={Intl.get('clue.no.data.during.range.and.status', '没有符合条件的线索')}
                        renderAddAndImportBtns={this.renderBackBtn}
                        showAddBtn
                    />
                );
            }else {
                return (
                    <ExtractClues
                        hasShowBackBtn
                        handleBackClick={this.changeFilter}
                        recommendClueLists={this.state.recommendClueLists}
                        getRecommendClueLists={this.getRecommendClueLists}
                        afterSuccess={this.props.afterSuccess}
                        onClosePanel={this.props.onClosePanel}
                    />
                );
            }
        }
    };

    render() {
        return (
            <div className="extract-clue-container">
                {this.renderStepBlock()}
            </div>
        );
    }
}
RecommendClues.defaultProps = {
    onClosePanel: function() {},
    afterSuccess: function() {},
};
RecommendClues.propTypes = {
    onClosePanel: PropTypes.func,
    afterSuccess: PropTypes.func,

};

export default RecommendClues;