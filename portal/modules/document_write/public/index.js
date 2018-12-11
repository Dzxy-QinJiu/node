/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/11.
 */
class DocumentWriteApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加出差申请面板
        teamTreeList: [],
        // ...BusinessApplyStore.getState()
    };

    onStoreChange = () => {
        // this.setState(BusinessApplyStore.getState());
    };

    componentDidMount() {}
    render(){
        return(
            <div>dkjfhdsjf</div>
        );
    }
}
DocumentWriteApplyManagement.defaultProps = {
    location: {},
};
DocumentWriteApplyManagement.propTypes = {
    location: PropTypes.object
};
module.exports = DocumentWriteApplyManagement;