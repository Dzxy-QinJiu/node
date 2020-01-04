/** Created by 2019-07-31 21:43 */
import 'MOD_DIR/home_page/public/css/recommend-clues.less';
import RecommendCustomerCondition from 'MOD_DIR/clue_customer/public/views/recomment_clues/recommend_customer_condition';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var clueCustomerStore = require('MOD_DIR/clue_customer/public/store/clue-customer-store');
import Spinner from 'CMP_DIR/spinner';
import ExtractClues from './extract-clue';
import OperateSuccessTip from 'CMP_DIR/operate-success-tip';
import { Button } from 'antd';
import userData from 'PUB_DIR/sources/user-data';
import history from 'PUB_DIR/sources/history';
import {
    ADD_INDUSTRY_ADDRESS_CLUE_CONDITION,
    checkClueCondition
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';

// 提取线索的步骤
const EXTRACT_CLUE_STEPS = {
    SET_RECOMMEND: 'set_recommend',//设置推荐客户
    EXTRACT_CLUE: 'extract_clue',// 提取线索
    FINISHED: 'finished', // 完成提取
};

class RecommendClues extends React.Component {
    constructor(props) {
        super(props);
        let clueState = clueCustomerStore.getState();
        this.state = {
            recommendClueLists: [],
            step: this.props.currentStep,
            pageSize: 20,
            ...clueState,
        };
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        this.getSalesManList();
        clueCustomerStore.listen(this.onStoreChange);
        //获取个人线索推荐保存设置
        this.getSettingCustomerRecomment();
    }

    componentWillUnmount = () => {
        clueCustomerStore.unlisten(this.onStoreChange);
    };

    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };

    // 获取销售列表
    getSalesManList() {
        // 管理员，运营获取所有人
        if(userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
            clueCustomerAction.getAllSalesUserList();
        }
        // 销售领导获取所在团队及其下级团队的销售
        else {
            clueCustomerAction.getSalesManList();
        }
    }

    //获取个人线索推荐保存配置
    getSettingCustomerRecomment() {
        let settedCustomerRecommend = this.state.settedCustomerRecommend;
        this.setState({
            settedCustomerRecommend: _.extend(settedCustomerRecommend, {loading: true})
        });
        clueCustomerAction.getSettingCustomerRecomment((condition) => {
            let isShowRecommendSettingPanel = this.isShowRecommendSettingPanel({obj: condition});
            if(!isShowRecommendSettingPanel) {
                this.setState({
                    step: EXTRACT_CLUE_STEPS.EXTRACT_CLUE
                }, () => {
                    //获取推荐的线索
                    this.getRecommendClueLists(condition);
                });
            }
        });
    }

    isShowRecommendSettingPanel = (settedCustomerRecommend) => {
        var hasCondition = checkClueCondition(ADD_INDUSTRY_ADDRESS_CLUE_CONDITION, _.get(settedCustomerRecommend,'obj'));
        return (!settedCustomerRecommend.loading && !hasCondition) && !this.state.closeFocusCustomer;
    };

    getSearchCondition = (condition) => {
        var conditionObj = _.cloneDeep(condition || _.get(this, 'state.settedCustomerRecommend.obj'));
        //去掉一些不用的属性
        delete conditionObj.id;
        delete conditionObj.user_id;
        delete conditionObj.organization;
        conditionObj.load_size = this.state.pageSize;
        return conditionObj;
    };
    getRecommendClueLists = (condition) => {
        if(this.state.canClickMoreBatch === false) return;
        var conditionObj = this.getSearchCondition(condition);
        //去掉为空的数据
        if(this.state.hasExtraRecommendList){
            conditionObj = {
                'sortvalues': this.state.sortvalues,
                ...conditionObj
            };
        }
        clueCustomerAction.getRecommendClueLists(conditionObj);
    };

    //保存成功后需要获取数据,以及展示下一步
    saveRecommedConditionsSuccess = (saveCondition) => {
        clueCustomerAction.saveSettingCustomerRecomment(saveCondition);
        this.setState({
            step: EXTRACT_CLUE_STEPS.EXTRACT_CLUE
        }, () => {
            this.getRecommendClueLists();
        });
    };

    // 返回上一步，重新设置条件
    changeFilter = () => {
        this.setState({
            step: EXTRACT_CLUE_STEPS.SET_RECOMMEND
        });
    };

    afterSuccess = () => {
        this.props.afterSuccess();
        if(this.props.showSuccessPage) {
            this.setState({
                step: EXTRACT_CLUE_STEPS.FINISHED
            });
        }
    };

    //继续提取
    handleContinueExtractClue = () => {
        this.setState({
            step: EXTRACT_CLUE_STEPS.SET_RECOMMEND
        }, () => {
            this.getRecommendClueLists();
        });
    };

    renderStepBlock = () => {
        let {
            step,
            settedCustomerRecommend,
        } = this.state;
        if(step === EXTRACT_CLUE_STEPS.SET_RECOMMEND) {// 设置推荐客户
            if(settedCustomerRecommend.loading) {
                return <Spinner className='home-loading'/>;
            }
            return (
                <RecommendCustomerCondition
                    hideFocusCustomerPanel={this.props.onClosePanel}
                    hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                    saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                />
            );
        }else if(step === EXTRACT_CLUE_STEPS.EXTRACT_CLUE) {// 提取线索
            return (
                <ExtractClues
                    hasShowBackBtn
                    salesManList={this.state.salesManList}
                    handleBackClick={this.changeFilter}
                    getRecommendClueLists={this.getRecommendClueLists}
                    afterSuccess={this.afterSuccess}
                    onClosePanel={this.props.onClosePanel}
                    showSuccessPage={this.props.showSuccessPage}
                />
            );
        }else if(step === EXTRACT_CLUE_STEPS.FINISHED){ // 完成提取
            return (
                <OperateSuccessTip
                    title={Intl.get('clue.extract.success', '提取成功')}
                    continueText={Intl.get('guide.continue.extract', '继续提取')}
                    goText={Intl.get('guide.see.clue', '查看线索')}
                    continueFn={this.handleContinueExtractClue}
                    goFn={() => {
                        history.push('/leads');
                    }}
                />
            );
        }
    };

    render() {
        return (
            <div className="extract-clue-container" data-tracename="提取线索">
                {this.renderStepBlock()}
            </div>
        );
    }
}
RecommendClues.defaultProps = {
    onClosePanel: function() {},
    afterSuccess: function() {},
    currentStep: EXTRACT_CLUE_STEPS.SET_RECOMMEND,
    showSuccessPage: true,//是否在提取后显示成功界面
};
RecommendClues.propTypes = {
    onClosePanel: PropTypes.func,
    afterSuccess: PropTypes.func,
    currentStep: PropTypes.string,
    showSuccessPage: PropTypes.bool,
};
RecommendClues.EXTRACT_CLUE_STEPS = EXTRACT_CLUE_STEPS;
export default RecommendClues;