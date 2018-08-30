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
    render(){
        if(this.props.showAddBtn){
            return (
                <div className="no-data-intro">
                    <i className="iconfont icon-no-data"></i>
                    <div className="no-data-container">
                        <p className="no-data-tip">{this.props.noDataAndAddBtnTip}</p>
                        {_.isFunction(this.props.renderAddAndImportBtns) ? this.props.renderAddAndImportBtns() : null}
                    </div>
                </div>
            );
        }else{
            return (
                <div className="no-data">
                    <i className="iconfont icon-no-data"></i>
                    <p className="abnornal-status-tip">{this.props.noDataTip}</p>
                </div>
            );
        }
    }
}
NoDataIntro.defaultProps = {
    showAddBtn: false,
    noDataAndAddBtnTip: '',
    renderAddAndImportBtns: function() {

    },
    noDataTip: ''

};
NoDataIntro.propTypes = {
    showAddBtn: React.PropTypes.bool,
    noDataAndAddBtnTip: React.PropTypes.string,
    renderAddAndImportBtns: React.PropTypes.func,
    noDataTip: React.PropTypes.string,
};
export default NoDataIntro;