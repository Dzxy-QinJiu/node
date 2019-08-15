/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/29.
 */
import PropTypes from 'prop-types';
require('./index.less');
class NoDataIntro extends React.Component {
    constructor(props) {
        super();
        this.state = {};
    }

    render() {
        if (this.props.showAddBtn) {
            return (
                <div className="no-data-intro">
                    <div className="no-data-container-warp">
                        <div className="add-data-wrap">
                            <div className="add-data-tip">
                                {this.props.renderAddDataContent()}
                            </div>
                            <span className="add-data-background"></span>
                        </div>
                        <div className="import-data-wrap">
                            <span className="import-data-background"></span>
                            <div className="import-data-tip">
                                {this.props.renderImportDataContent()}
                            </div>

                        </div>
                    </div>
                    <div className="add-other-operation">
                        {this.props.renderOtherOperation()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="no-data">
                    <i className="iconfont icon-no-data"></i>
                    <p className="abnornal-status-tip">{this.props.noDataTip}</p>
                    <div className="add-other-operation">
                        {this.props.renderOtherOperation()}
                    </div>
                </div>
            );
        }
    }
}

NoDataIntro.defaultProps = {
    showAddBtn: false,
    noDataTip: '',
    renderAddDataContent: function() {

    },
    renderImportDataContent: function() {

    },
    renderOtherOperation: function(){

    }

};
NoDataIntro.propTypes = {
    showAddBtn: PropTypes.bool,
    noDataTip: PropTypes.string,
    renderAddDataContent: PropTypes.func,
    renderImportDataContent: PropTypes.func,
    renderOtherOperation: PropTypes.func,
};
export default NoDataIntro;