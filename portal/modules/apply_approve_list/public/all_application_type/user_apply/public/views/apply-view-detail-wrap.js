/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/9/20.
 */

import ApplyViewDetail from './apply-view-detail';
class ApplyViewDetailWrap extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ApplyViewDetail {...this.props}/>
        );
    }
}
ApplyViewDetailWrap.defaultProps = {
};
ApplyViewDetailWrap.propTypes = {
};
export default ApplyViewDetailWrap;

