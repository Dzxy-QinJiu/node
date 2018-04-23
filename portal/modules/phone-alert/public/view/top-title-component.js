/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
require("../css/top-title-cmp.less");
class TopTitle extends React.Component{
    constructor(props) {
        super(props);
    }
    render(){
        return (
            <div className="top-title-container">
                <span className="topic-title">{this.props.titleText}</span>
            </div>
        );
    }

}
TopTitle.defaultProps = {
    titleText :""
};
export default TopTitle;