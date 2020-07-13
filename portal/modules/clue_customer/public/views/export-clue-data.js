/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';

require('../css/export-data.less');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Radio, Checkbox} from 'antd';
import {exportClueItem} from '../utils/clue-customer-utils';
const RadioGroup = Radio.Group;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import DetailCard from 'CMP_DIR/detail-card';
const { getLocalWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
const FORMLAYOUT = {
    PADDINGTOTAL: 270
};
class ExportClueData extends React.Component {
    constructor(props) {
        super(props);
        const websiteConfig = getLocalWebsiteConfig() || {};
        let export_clue_feild = _.get(websiteConfig, oplateConsts.EXPORT_CLUE_FEILD, []);
        this.state = {
            checkedValues: _.isEmpty(export_clue_feild) ? _.map(exportClueItem,'value') : export_clue_feild
        };
    }

    renderClueExportRangeContent = () => {
        return <div>
            <div className='export-clue-item'>
                <span className='export-label'>
                    {Intl.get('contract.116', '导出范围')}：
                </span>
                {/*如果当前有选中的线索就提示导出选中的线索，如果没有就提示导出全部或者符合当前条件的线索*/}
                {this.props.hasSelectedClues ?
                    <span>{Intl.get('clue.customer.export.select.clue', '导出选中的线索')}
                    </span>
                    : <RadioGroup
                        value={this.props.exportRange}
                        onChange={this.props.onExportRangeChange}
                    >
                        <Radio key="all" value="all">
                            {Intl.get('common.all', '全部')}
                        </Radio>
                        <Radio key="filtered" value="filtered">
                            {Intl.get('contract.117', '符合当前筛选条件')}
                        </Radio>
                    </RadioGroup>}

            </div>
            <div className='export-clue-item'>
                <span className='export-label'>
                    {Intl.get('contract.118', '导出类型')}:
                </span>
                <Radio checked={true}>
                    Excel
                </Radio>
            </div>
        </div>;
    };
    handleCheckValue = (checkedValues) => {
        this.setState({
            checkedValues
        });
    };
    renderClueExportColumnContent = () => {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        let {checkedValues} = this.state;
        return <div style={{'height': divHeight}}>
            <GeminiScrollbar>
                <div className="export-clue-item">
                    <span className='export-label'>
                        {Intl.get('lead.export.clue.item', '导出字段')}:
                    </span>
                    <Checkbox.Group defaultValue={checkedValues} options={exportClueItem} onChange={this.handleCheckValue} />
                </div>
            </GeminiScrollbar>

        </div>;
    };
    renderClueExportRange = () => {
        return <DetailCard
            content={this.renderClueExportRangeContent()}
            className='clue-export-range'
        />;
    };
    renderClueExportColumn = () => {
        return <DetailCard
            content={this.renderClueExportColumnContent()}
            className='clue-export-column'
        />;
    };

    render() {
        let {checkedValues} = this.state;
        return (
            <div className="clue-export-show-panel">
                <RightPanel showFlag={true} data-tracename="导出线索" className="export-clue-container">
                    <span className="iconfont icon-close export-data-close-btn"
                        onClick={this.props.closeExportData}
                        data-tracename="关闭导出线索面板"></span>
                    <div className="export-data-wrap">
                        <BasicData
                            clueTypeTitle={Intl.get('clue.export.clue.list', '导出线索')}
                        />
                        <div className="clue-export-data">
                            {this.renderClueExportRange()}
                            {this.renderClueExportColumn()}
                            <SaveCancelButton
                                disabledBtn={_.isEmpty(this.state.checkedValues)}
                                handleSubmit={this.props.exportData.bind(this,checkedValues)}
                                okBtnText={Intl.get('common.export', '导出')}
                                hideCancelBtns={true}
                            />
                        </div>
                    </div>
                </RightPanel>
            </div>

        );
    }
}

ExportClueData.defaultProps = {
    closeExportData: function() {
    },
    exportData: function() {

    },
    hasSelectedClues: false,
    exportRange: '',//导出线索的类型
    onExportRangeChange: function() {

    }

};
ExportClueData.propTypes = {
    closeExportData: PropTypes.func,
    exportData: PropTypes.func,
    hasSelectedClues: PropTypes.bool,
    exportRange: PropTypes.string,//导出线索的类型
    onExportRangeChange: PropTypes.func,

};
export default ExportClueData;
