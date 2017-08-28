/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/3/15.
 */
require("./css/main.scss");
var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../../../components/user_manage_components/scss/right-panel-es_VE.scss");
}else if (language.lan() == "zh"){
    require("../../../components/user_manage_components/scss/right-panel-zh_CN.scss");
}
require("../../app_user_manage/public/css/main-zh_CN.scss");

var ApplyView = require("./views/apply-view");
var UserApply = React.createClass({
    render:function () {
        return(
            <div data-tracename="用户审批">
                <div className="user_apply_page">
                  <div className="user_apply_contentwrap">
                        <ApplyView applyId={this.props.location.query && this.props.location.query.id}/>
                  </div>
                </div>

            </div>
        )
    }
});
module.exports = UserApply;
