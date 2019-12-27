/**
 * 申请用户
 */
//右侧面板样式，上一步、下一步，滑动布局等
var language = require('../../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../../../../../components/user_manage_components/css/right-panel-es_VE.less');
}else if (language.lan() === 'zh'){
    require('../../../../../components/user_manage_components/css/right-panel-zh_CN.less');
}
import {Carousel,CarouselItem} from 'react-bootstrap';
import {RightPanelClose} from '../../../../../components/rightPanel';
import OperationStepsFooter from '../../../../../components/user_manage_components/operation-steps-footer';
import OperationSteps from '../../../../../components/user_manage_components/operation-steps';
import OperationScrollBar from '../../../../../components/user_manage_components/operation-scrollbar';
import SearchIconList from '../../../../../components/search-icon-list';
import UserData from '../../../../../public/sources/user-data';
import ApplyUserForm from './apply-user-form';
import insertStyle from '../../../../../components/insert-style';

var dynamicStyle;
//布局常量
const LAYOUT_CONSTANTS = {
    //应用选择组件顶部的高度
    APPS_CHOOSEN_TOPBAR: 106
};

class ApplyUser extends React.Component {
    generateInitState = () => {
        return {
            apps: [],
            step: 0,
            appValid: true,
            applyFormShow: false,
            operator: UserData.getUserData().nick_name,
        };
    };

    componentsWillUnmount = () => {
        dynamicStyle && dynamicStyle.destroy();
    };

    turnStep = (direction) => {
        let step = this.state.step;
        if (direction === 'next') {
            if (step === 0) {
                //检查是否至少选择了一个应用
                if (!this.state.apps.length) {
                    this.setState({appValid: false});
                    return;
                } else {
                    this.setState({
                        step: 1,
                        appValid: true,
                        applyFormShow: true,
                    });
                }
            }
        } else {
            this.setState({step: 0});
        }
    };

    onStepFinish = () => {
        this.setState({isSubmiting: true});
        this.refs.applyUserForm.handleSubmit(() => {
            this.setState({isSubmiting: false});
        });
    };

    //渲染申请表单
    renderApplyFormCarousel = () => {
        if (this.state.applyFormShow) {
            return (
                <OperationScrollBar className="basic-data-form-wrap">
                    <ApplyUserForm
                        appList={this.props.appList}
                        apps={this.state.apps}
                        users={this.props.users}
                        customerId={this.props.customerId}
                        cancelApply={this.props.cancelApply}
                        ref="applyUserForm"
                        emailData={this.props.emailData}
                    />
                </OperationScrollBar>
            );
        }
    };

    onAppsChange = (apps) => {
        this.state.appValid = !!apps.length;
        this.state.apps = apps;
        this.setState(this.state);
    };

    //渲染选择应用
    renderAppsCarousel = () => {
        //高度限制，让页面出现滚动条
        var height = $(window).height() -
            OperationSteps.height -
            OperationStepsFooter.height -
            LAYOUT_CONSTANTS.APPS_CHOOSEN_TOPBAR;

        dynamicStyle && dynamicStyle.destroy();
        dynamicStyle = insertStyle(`.user-manage-v2-applyuser .search-icon-list-content{max-height:${height}px;overflow-y:auto;overflow-x:hidden;`);

        return (
            <div>
                <SearchIconList
                    totalList={this.props.appList}
                    selectedList={this.state.apps}
                    id_field="client_id"
                    name_field="client_name"
                    image_field="client_image"
                    search_fields={['client_name']}
                    onItemsChange={this.onAppsChange}
                    notFoundContent={Intl.get('user.no.related.product','无相关产品')}
                />
                {
                    !this.state.appValid ? (
                        <div className="has-error">
                            <div className="ant-form-explain">
                                {Intl.get('user.product.select.tip','至少选择一个产品')}
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    };

    closeAppUserForm = () => {
        this.props.cancelApply();
        this.setState(this.generateInitState());
    };

    state = this.generateInitState();

    render() {
        return (
            <div className="user-manage-v2 user-manage-v2-applyuser">
                <RightPanelClose onClick={this.closeAppUserForm}/>
                <div>
                    <OperationSteps
                        title={Intl.get('user.apply.user', '申请用户')}
                        current={this.state.step}
                    >
                        <OperationSteps.Step action={Intl.get('user.user.product.select','选择产品')}></OperationSteps.Step>
                        <OperationSteps.Step action={Intl.get('user.apply.user', '申请用户')}></OperationSteps.Step>
                    </OperationSteps>
                    <Carousel
                        interval={0}
                        indicators={false}
                        controls={false}
                        activeIndex={this.state.step}
                        direction={this.state.stepDirection}
                        slide={false}
                    >
                        <CarouselItem>
                            {this.renderAppsCarousel()}
                        </CarouselItem>
                        <CarouselItem>
                            {this.renderApplyFormCarousel()}
                        </CarouselItem>
                    </Carousel>
                    <OperationStepsFooter
                        currentStep={this.state.step}
                        totalStep={2}
                        onStepChange={this.turnStep}
                        onFinish={this.onStepFinish}
                        isSubmiting={this.state.isSubmiting}
                    >
                        <span className="operator_person">
                            {Intl.get('user.operator','操作人')}:{this.state.operator}
                        </span>
                    </OperationStepsFooter>
                </div>
            </div>
        );
    }
}

ApplyUser.propTypes = {
    customerId: PropTypes.string,
    cancelApply: PropTypes.func,
    users: PropTypes.array,
    appList: PropTypes.array,
    emailData: PropTypes.obj,
};

export default ApplyUser;

