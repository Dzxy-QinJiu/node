/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/2.
 */
import './style.less';
import React, {Component} from 'react';
import {AntcAreaSelection} from 'antc';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';


class MobileAreaSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            area: {
                provName: _.get(props, 'area.province', ''),
                cityName: _.get(props, 'area.city', ''),
                countyName: _.get(props, 'area.district', ''),
            }
        };
    }

    componentDidMount() {
        let tabContentEl = $('.ant-tabs-content');
        let divHeight = $(window).height();
        if(tabContentEl.length) {
            divHeight -= (tabContentEl.offset().top + oplateConsts.LAYOUT.BOTTOM_NAV);
            tabContentEl.css({height: divHeight});
        }
    }

    handleClose = () => {
        _.isFunction(this.props.handleClose) && this.props.handleClose();
    };

    //更新地址
    updateLocation = (addressObj) => {
        let area = _.pick(addressObj, ['provName', 'cityName', 'countyName']);
        this.setState({area});
    };

    handleSubmit = () => {
        _.isFunction(this.props.handleSubmit) && this.props.handleSubmit({...this.state.area});
        _.isFunction(this.props.handleClose) && this.props.handleClose();
    };

    isSetTabsContentHeight = () => {
        const { isWebMin } = isResponsiveDisplay();
        //手机端才需要手动设置，其他情况由组件自行设置tab高度
        return !isWebMin;
    };

    renderContent() {
        let {area} = this.state;
        return (
            <React.Fragment>
                <AntcAreaSelection
                    labelCol="0"
                    wrapperCol="24"
                    width="100%"
                    colon={false}
                    label={' '}
                    provName={area.provName}
                    cityName={area.cityName}
                    countyName={area.countyName}
                    updateLocation={this.updateLocation}
                    onAreaPanelHide={this.onAreaPanelHide}
                    showAllBtn
                    filterSomeNewArea
                    sortProvinceByFirstLetter
                    isSetTabsContentHeight={this.isSetTabsContentHeight}
                />
                <div className="confirm-btn-container" onClick={this.handleSubmit} data-tracename="点击确认按钮">
                    <span>{Intl.get('common.confirm', '确认')}</span>
                </div>
            </React.Fragment>
        );
    }

    render() {
        let title = Intl.get('clue.assignment.needs.region', '地域');
        const value = _.chain(this.state.area).values().filter(item => item).value();
        const traceTip = value.join('/') || '全部';
        title += ': ' + traceTip;

        return (
            <RightPanelModal
                isShowCloseBtn
                className="mobile-area-selector-container"
                title={title}
                content={this.renderContent()}
                onClosePanel={this.handleClose}
            />
        );
    }
}

MobileAreaSelector.propTypes = {
    area: PropTypes.object,
    handleClose: PropTypes.func,
    handleSubmit: PropTypes.func,
};
export default MobileAreaSelector;