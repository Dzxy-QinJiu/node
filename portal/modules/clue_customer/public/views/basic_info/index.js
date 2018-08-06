/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
require('./index.less');
var BasicData = React.createClass({
    render: function() {
        return (
            <div className="basic-info-container">
                {this.props.showCloseIcon ? <span className="iconfont icon-close" onClick={this.props.closeRightPanel}></span> : null}
                <div className="clue-type-title">
                    {this.props.clueTypeTitle}
                </div>
            </div>
        );
    }
});
module.exports = BasicData;