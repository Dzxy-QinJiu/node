/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/3/15.
 */
require('./css/main.less');
var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../../../components/user_manage_components/css/right-panel-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../../../components/user_manage_components/css/right-panel-zh_CN.less');
}
require('../../app_user_manage/public/css/main-zh_CN.less');

var ApplyView = require('./views/apply-view');
import queryString from 'query-string';

class UserApply extends React.Component {
    render() {
        const query = queryString.parse(this.props.location.search);
        return (
            <div className="user_apply_page" data-tracename="用户审批">
                <ApplyView applyId={query && query.id} {...this.props}/>
            </div>
        );
    }
}
UserApply.defaultProps = {
    location: {},
};
UserApply.propTypes = {
    location: PropTypes.object,
};

module.exports = UserApply;

