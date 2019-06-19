/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/17.
 */
import './index.less';
class BottomTotalCount extends React.Component {
    render() {
        return (
            <div className="bottom-total-count">
                {this.props.totalCount}
            </div>);
    }
}
BottomTotalCount.propTypes = {
    //总计描述，例如：共xxx个客户
    totalCount: PropTypes.string,
};
export default BottomTotalCount;