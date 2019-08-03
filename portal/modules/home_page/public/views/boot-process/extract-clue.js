/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/01.
 */
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import GuideAjax from 'MOD_DIR/common/public/ajax/guide';
import {Checkbox, Button} from 'antd';

const LAYOUT_CONSTANCE = {
    TITLE_HEIGHT: 70,// 顶部标题区域高度
    PADDING_TOP: 24,// 距离顶部标题区域高度
    BTN_PADDING: 45, //底部按钮区域高度
};

class ExtractClues extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            batchExtractLoading: false,
            saveErrorMsg: '',
            recommendClueLists: props.recommendClueLists,
            selectedRecommendClues: []
        };
    }

    handleSubmit = () => {
        let selectedIds = _.map(this.state.selectedRecommendClues,'id');
        if(_.isEmpty(selectedIds)) {
            return;
        }
        let submitObj = {
            companyIds: selectedIds
        };
        this.setState({batchExtractLoading: true});
        GuideAjax.batchExtractRecommendClues(submitObj).then((data) => {
            this.setState({
                batchExtractLoading: false,
                selectedRecommendClues: []
            });
            //todo 到这一步，提取线索的引导就完成了，需要更新引导流程状态
            this.props.afterSuccess();
        }, (errorMsg) => {
            this.setState({
                batchExtractLoading: false,
                saveErrorMsg: errorMsg || Intl.get('clue.extract.failed', '提取失败')
            });
        });
    };

    dealData = (obj) => {
        let str = '';
        // 所属行业
        let industry = _.get(obj, 'industry', '');
        // 省份
        let province = _.get(obj, 'province', '');
        // 处理人员规模
        let staffnum = '';
        let staffnumMin = _.get(obj, 'staffnumMin', '');
        let staffnumMax = _.get(obj, 'staffnumMax', '');
        if(staffnumMin && staffnumMax) {
            staffnum = Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: staffnumMin, max: staffnumMax});
        }else {
            // 以下
            if(!staffnumMin && staffnumMax) {
                staffnum = Intl.get('clue.customer.condition.staff.size', '{num}人以下', {num: staffnumMax});
            }
            // 以上
            if(staffnumMin && !staffnumMax) {
                staffnum = Intl.get('clue.customer.staff.over.num', '{num}人以上', {num: staffnumMin});
            }
        }

        // 资金规模
        let capital = _.get(obj, 'capital', '');
        // 企业性质
        let entType = _.get(obj, 'entType', '');

        if(industry && !_.isEqual(industry, '-')) {
            str += industry + ' / ';
        }
        if(province && !_.isEqual(province, '-')) {
            str += province + ' / ';
        }
        if(staffnum) {
            str += staffnum + ' / ';
        }
        if(capital && !_.isEqual(capital, '-')) {
            str += Intl.get('crm.149', '{num}万',{num: (capital / 10000)}) + ' / ';
        }
        if(entType && !_.isEqual(entType, '-')) {
            str += entType;
        }
        return str;
    };

    handleCheckChange = (item, e) => {
        let checked = e.target.checked;
        let selectedRecommendClues = this.state.selectedRecommendClues;
        if(checked) {
            selectedRecommendClues.push(item);
        }else {
            selectedRecommendClues = _.filter(selectedRecommendClues, recommend => {
                return recommend.id !== item.id;
            });
        }
        this.setState({
            selectedRecommendClues
        });
    };

    renderRecommendLists = () => {
        let {recommendClueLists} = this.state;
        return (
            <div className="extract-clue-panel-container">
                {
                    _.map(recommendClueLists, item => {
                        let str = this.dealData(item);

                        return (
                            <div className="extract-clue-item">
                                <Checkbox onChange={this.handleCheckChange.bind(this, item)}/>
                                <div className="extract-clue-text-wrapper">
                                    <div className="extract-clue-text__name" title={item.name}>{item.name}</div>
                                    <div className="extract-clue-text__filters">{str}</div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    };

    render() {
        const divHeight = $(window).height()
            - LAYOUT_CONSTANCE.PADDING_TOP
            - LAYOUT_CONSTANCE.TITLE_HEIGHT
            - LAYOUT_CONSTANCE.BTN_PADDING;

        return (
            <div className="extract-clues-wrapper">
                <div className="extract-clues-title-wrapper">
                    <div className="extract-clues-title">
                        <span>{Intl.get('clue.extract.clue', '提取线索')}</span>
                        <a className="float-r" style={{fontWeight: 400}} href="javascript:void(0);" onClick={this.props.getRecommendClueLists}>{Intl.get('clue.customer.refresh.list', '换一批')}</a>
                    </div>
                </div>
                <div className="extract-clues-content" style={{height: divHeight}}>
                    <GeminiScrollbar>
                        {this.renderRecommendLists()}
                    </GeminiScrollbar>
                </div>
                <div className="extract-btn-wrapper">
                    <Button className="back-btn" onClick={this.props.handleBackClick}>{Intl.get('user.user.add.back', '上一步')}</Button>
                    <SaveCancelButton
                        loading={this.state.batchExtractLoading}
                        saveErrorMsg={this.state.saveErrorMsg}
                        okBtnText={Intl.get('guide.extract.clue.now', '立即提取')}
                        handleSubmit={this.handleSubmit}
                        handleCancel={this.props.onClosePanel}
                    />
                </div>
            </div>
        );
    }
}

ExtractClues.defaultProps = {
    onClosePanel: function() {},
    recommendClueLists: [],
    hasShowBackBtn: false,
    handleBackClick: function() {},
    getRecommendClueLists: function() {},
    afterSuccess: function() {},
};
ExtractClues.propTypes = {
    onClosePanel: PropTypes.func,
    recommendClueLists: PropTypes.array,
    hasShowBackBtn: PropTypes.bool,
    handleBackClick: PropTypes.func,
    getRecommendClueLists: PropTypes.func,
    afterSuccess: PropTypes.func,
};

export default ExtractClues;