import React, { Component } from 'react';
import DetailCard from 'CMP_DIR/detail-card';
const clueCustomerUtils = require('MOD_DIR/clue_customer/public/utils/clue-customer-utils');
require('./index.less');

//渲染申请试用卡片
export default class ApplyTryCard extends Component {
    state = {
        versionData: this.props.versionData,
    }
    renderApplyTryContent = () => {
        const versionData = _.get(this.state,'versionData');
        let applyTryContent = <div className='clue-info-item-apply-try'>
            <div className='clue-info-item-apply-try-content'>
                <div className='clue-info-item-apply-try-content-title'>{Intl.get('common.company','公司')}</div>
                <div className='clue-info-item-apply-try-content-value'>{versionData.applyTryCompany}</div>
            </div>
            <div className='clue-info-item-apply-try-content'>
                <div className='clue-info-item-apply-try-content-title'>{Intl.get('common.name','姓名')}</div>
                <div className='clue-info-item-apply-try-content-value'>{versionData.applyTryName}</div>
            </div>
            <div className='clue-info-item-apply-try-content'>
                <div className='clue-info-item-apply-try-content-title'>{Intl.get('common.apply.try.user.scales','使用人数')}</div>
                <div className='clue-info-item-apply-try-content-value'>{versionData.applyTryUserScales}</div>
            </div>
            <div className='clue-info-item-apply-try-content'>
                <div className='clue-info-item-apply-try-content-title'>{Intl.get('user.info.version','版本')}</div>
                <div className='clue-info-item-apply-try-content-value'>{clueCustomerUtils.VERSIONS[versionData.applyTryKind]}</div>
            </div>
            <div className='clue-info-item-apply-try-content'>
                <div className='clue-info-item-apply-try-content-title'>{Intl.get('common.login.time','时间')}</div>
                <div className='clue-info-item-apply-try-content-value'>{moment(versionData.applyTryTime).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT)}</div>
            </div>
        </div>;
        return (
            <DetailCard 
                title={`${Intl.get('login.apply.trial', '申请试用')}:`}
                content={applyTryContent}
                titleBottomBorderNone={false}
            />
        );
    }
    render() {
        let divCls = 'apply-try-card-wrapper' + this.props.divCls;
        return (
            <div className={divCls}>
                {!$.isEmptyObject(this.state.versionData) && this.renderApplyTryContent()}  
            </div>
        );
    }
}
ApplyTryCard.defaultProps = {
    versionData: {},
    divCls: ''
};
ApplyTryCard.propTypes = {
    versionData: PropTypes.object,
    divCls: PropTypes.string
};