/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/14.
 */
require('../login-user-agreement/css/index.less');
var React = require('react');
const classnames = require('classnames');
import LoginLogo from '../login-logo';
import { Alert, Tabs, Icon, Button } from 'antd';
import SideBar from '../side-bar';
var Spinner = require('../spinner');
const USER_LANG_KEY = 'userLang';//存储用户语言环境的key
import { storageUtil } from 'ant-utils';
import GeminiScrollbar from '../react-gemini-scrollbar';
const LAYOUT_CONST = {
    TITLE_HEIGHT: 96,//标题的高度
    MARGAIN: 108,//上下边距的和54+54
    MOBILE_MARGIN: 45
};
class PrivacyPolicyPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentHeight: this.getContentHeight(),
        };
    }

    componentDidMount() {
        Trace.addEventListener(window, 'click', Trace.eventHandler);
        $(window).on('resize', this.onWindowResize);
    }
    onWindowResize = () => {
        this.setState({ contentHeight: this.getContentHeight() });
    }
    getContentHeight() {
        let margin = LAYOUT_CONST.MARGAIN;
        if($(window).width() <= 720){
            margin = LAYOUT_CONST.MOBILE_MARGIN;
        }
        return $(window).height() - margin;// - LAYOUT_CONST.TITLE_HEIGHT;
    }
    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
        $(window).off('resize', this.onWindowResize);
    }

    render() {
        const hasWindow = !(typeof window === 'undefined');
        const contentHeight = this.state.contentHeight;
        return (
            <div className="user-agreement-wrap" data-tracename="隐私政策">
                <div className="user-agreement-title">
                    <LoginLogo size='20px' fontSize='16px' />
                    <span className='user-agreement-text'>{Intl.get('register.privacy.policy', '隐私政策')}</span>
                </div>
                <div className='user-agreement-content' style={{ height: contentHeight }}>
                    <GeminiScrollbar>
                        <div className='content-title first-content-title'>引言</div>
                        <div className='content-mini-margin text-indent-style'>客套智能科技严格遵守法律法规，遵循以下隐私保护原则，为您提供安全、可靠的服务</div>
                        <div className='content-mini-margin text-indent-style'>
                            我们努力使用简明易懂的表述，向您介绍我们隐私政策。您成为客套智能科技用户前务必仔细阅读本隐私条款并同意所有隐私条款。本隐私政策条款在您注册或登录客套产品或服务后立即生效，并对您及客套智能科技产生约束力。
                        </div>
                        <div className='content-text text-indent-mini'>本《隐私政策》主要向您说明：</div>
                        <div className='content-title'>一、我们收集哪些信息</div>
                        <div className='content-text'>我们根据合法、正当、必要的原则，仅收集实现产品功能所必要的信息。</div>
                        <div className='content-text'>1.1 您在使用我们服务时主动提供的信息</div>
                        <div className='content-mini-margin'>1.1.1 您在注册登录帐户时填写的信息</div>
                        <div className='content-text text-indent-style'>例如，您在注册登录帐户时所填写手机号码、微信号等；您在购买服务时使用的微信账号、支付宝账号、银行卡号等。</div>
                        <div className='content-mini-margin'>1.1.2 您在使用服务时上传的信息</div>
                        <div className='content-text text-indent-style'>例如，您在使用客套web版、小程序、安卓版app、ios版app时，添加或上传的头像、电话记录、产品用户、客户、线索、合同等信息。</div>
                        <div className='content-mini-margin'>1.1.3 您通过我们的客服或参加我们举办的活动时所提交的信息</div>
                        <div className='content-mini-margin text-indent-style'>例如，您参与我们线上活动时填写的调查问卷中可能包含您的姓名、电话、家庭地址等信息。</div>
                        <div className='content-text text-indent-style'>我们的部分服务可能需要您提供特定的个人敏感信息来实现特定功能。若您选择不提供该类信息，则可能无法正常使用服务中的特定功能，但不影响您使用服务中的其他功能。若您主动提供您的个人敏感信息，即表示您同意我们按本政策所述目的和方式来处理您的个人敏感信息。</div>
                        <div className='content-text'>1.2 我们在您使用服务时获取的信息</div>
                        <div className='content-mini-margin'>1.2.1 日志信息</div>
                        <div className='content-mini-margin text-indent-mini'>当您使用我们的服务时，我们可能会自动收集相关信息并存储为服务日志信息。</div>
                        <div className='content-mini-margin'>（1）设备信息</div>
                        <div className='content-mini-margin text-indent-style'>例如，设备型号、操作系统版本、唯一设备标识符等信息。</div>
                        <div className='content-mini-margin'>（2）软件信息</div>
                        <div className='content-mini-margin text-indent-style'>例如，软件的版本号、浏览器类型。为确保操作环境的安全或提供服务所需，我们会收集有关您使用的移动应用和其他软件的信息。</div>
                        <div className='content-mini-margin'>（3）IP地址</div>
                        <div className='content-mini-margin'>（4）服务日志信息</div>
                        <div className='content-text text-indent-style'>例如，您在使用我们服务时搜索、查看的信息、服务故障信息、引荐网址等信息。</div>
                        <div className='content-mini-margin'>1.2.2 位置信息</div>
                        <div className='content-mini-margin text-indent-style'>当您使用与位置有关的服务时，我们可能会记录您设备所在的位置信息，以便为您提供相关服务。</div>
                        <div className='content-mini-margin text-indent-style'>在您使用服务时，我们可能会通过IP地址 、GPS、WiFi或基站等途径获取您的地理位置信息；</div>
                        <div className='content-text text-indent-style'>您或其他用户在使用服务时提供的信息中可能包含您所在地理位置信息，例如您提供的帐号信息中可能包含的您所在地区信息，您或其他人共享的照片包含的地理标记信息。</div>
                        <div className='content-mini-margin'>1.2.3 其他相关信息</div>
                        <div className='content-text text-indent-style'>为了帮助您更好地使用我们的产品或服务，我们会收集相关信息。例如，我们收集的通话记录、通讯录、您产品的用户操作记录等信息。</div>
                        <div className='content-mini-margin'>1.3 从第三方合作伙伴获取的信息</div>
                        <div className='content-text text-indent-style'>我们可能会获得您在使用第三方合作伙伴服务时所产生或分享的信息。例如，您使用客套帐户登录第三方合作伙伴服务时，我们会获得您登录第三方合作伙伴服务的名称、登录时间，方便您进行授权管理。请您仔细阅读第三方合作伙伴服务的用户协议或隐私政策。</div>
                        <div className='content-title'>二、我们如何使用收集的信息</div>
                        <div className='content-text text-indent-style'>我们严格遵守法律法规的规定及与用户的约定，将收集的信息用于以下用途。若我们超出以下用途使用您的信息，我们将再次向您进行说明，并征得您的同意。</div>
                        <div className='content-text'>2.1 向您提供服务</div>
                        <div className='content-mini-margin'>2.2 满足您的个性化需求</div>
                        <div className='content-text text-indent-style'>例如，语言设定、个性化的帮助服务。</div>
                        <div className='content-mini-margin'>2.3 产品开发和服务优化</div>
                        <div className='content-text text-indent-style'>例如，当我们的系统发生故障时，我们会记录和分析系统故障时产生的信息，优化我们的服务。</div>
                        <div className='content-mini-margin'>2.4 安全保障</div>
                        <div className='content-text text-indent-style'>例如，我们会将您的信息用于身份验证、安全防范、反诈骗监测、存档备份、客户的安全服务、防止严重侵害他人之合法权益或公共利益等用途。</div>
                        <div className='content-mini-margin'>2.5 管理软件</div>
                        <div className='content-text text-indent-style'>例如，进行软件认证、软件升级等。</div>
                        <div className='content-text'>2.6 邀请您参与有关我们服务的调查</div>
                        <div className='content-mini-margin'>2.7 与您联系</div>
                        <div className='content-text text-indent-style'>例如：我们通过您的信息向您提供您可能感兴趣的信息，如：介绍产品、服务、告警信息等邮件或短信。</div>
                        <div className='content-text'>2.8 其他用途</div>
                        <div className='content-text'>2.8.1 当被法律强制或依照政府或依权利人因识别涉嫌侵权行为人的要求而提供您的信息时，我们将善意地披露您的资料。</div>
                        <div className='content-text'>2.8.2 您同意如果我们拟进行企业并购、重组、出售全部或部分股份和/或资产时，我们有权在与前述交易的相关方签署保密协议的前提下向其披露您的资料以协助我们完成该等交易。</div>
                        <div className='content-text'>2.8.3 为了让您有更好的体验、改善我们的服务或经您同意的其他用途，在符合相关法律法规的前提下，我们可能将通过某些服务所收集的信息用于我们的其他服务。例如，将您在使用我们某项服务时的信息，用于另一项服务中向您展示个性化的内容、用于用户研究分析与统计等服务。</div>
                        <div className='content-text'>2.8.4 为了确保服务的安全，帮助我们更好地了解我们应用程序的运行情况，我们可能记录相关信息，例如，您使用应用程序的频率、故障信息、总体使用情况、性能数据以及获取服务的来源。</div>
                        <div className='content-title'>三、您如何管理自己的信息</div>
                        <div className='content-text'>3.1 您可以在使用我们服务的过程中，访问、修改和删除您提供的注册信息和其他个人信息，也可按照通知指引与我们联系。您访问、修改和删除个人信息的范围和方式将取决于您使用的具体服务。例如，若您修改您的昵称信息，您可在个人资料中修改。</div>
                        <div className='content-text'>3.2 我们将按照本政策所述，仅为实现我们产品或服务的功能，收集、使用您的信息.如您发现我们违反法律、行政法规的规定或者双方的约定收集、使用您的个人信息，您可以要求我们删除;如您发现我们收集、存储的您的个人信息有错误的，您也可以要求我们更正。</div>
                        <div className='content-text'>3.3 在您访问、修改和删除相关信息时，我们可能会要求您进行身份验证，以保障帐号的安全。</div>
                        <div className='content-text'>3.4 请您理解，由于技术所限、法律或监管要求，我们可能无法满足您的所有要求，我们会在合理的期限内答复您的请求。</div>
                        <div className='content-title'>四、我们可能向您发送的信息</div>
                        <div className='content-text'>4.1 信息推送</div>
                        <div className='content-text'>4.1.1 您在使用我们的服务时，我们可能向您发送电子邮件、短信、资讯或推送通知。</div>
                        <div className='content-text'>4.1.2 您可以按照我们的相关提示，在设备上选择取消订阅。</div>
                        <div className='content-text'>4.2 与服务有关的公告</div>
                        <div className='content-text'>4.2.1 我们可能在必要时（例如，因系统维护而暂停某一项服务时）向您发出与服务有关的公告。</div>
                        <div className='content-text'>4.2.2 您可能无法取消这些与服务有关、性质不属于广告的公告。</div>
                        <div className='content-title'>五、存储信息的地点和期限</div>
                        <div className='content-mini-margin'>5.1 存储信息的地点</div>
                        <div className='content-text text-indent-style'>我们所收集的用户信息将保存在我们的服务器或我们的合作产品提供商的服务器上</div>
                        <div className='content-mini-margin'>5.2 存储信息的期限</div>
                        <div className='content-mini-margin text-indent-mini'>一般而言，我们仅为实现目的所必需的最短时间保留您的个人信息。但在下列情况下，我们有可能因需符合法律要求，更改个人信息的存储时间:</div>
                        <div className='content-mini-margin'>（1） 为遵守适用的法律法规等有关规定；</div>
                        <div className='content-mini-margin'>（2） 为遵守法院判决、裁定或其他法律程序的规定；</div>
                        <div className='content-mini-margin'>（3） 为遵守相关政府机关或法定授权组织的要求；</div>
                        <div className='content-mini-margin'>（4） 我们有理由确信需要遵守法律法规等有关规定；</div>
                        <div className='content-mini-margin'>（5） 为执行相关服务协议或本政策、维护社会公共利益，为保护们的客户、我们或我们的关联公司、其他用户或雇员的人身财产安全或其他合法权益所合理必需的用途。</div>
                        <div className='content-text text-indent-style'>当我们的产品或服务发生停止运营的情形时，我们将采取例如，推送通知、公告等形式通知您，并在合理的期限内删除或匿名化处理您的个人信息。</div>
                        <div className='content-title'>六、用户信息安全</div>
                        <div className='content-text text-indent-style'>我们为您的信息提供相应的安全保障，以防止信息的丢失、不当使用、未经授权访问或披露。尽管我们有这些安全措施，但请注意在因特网上不存在“完善的安全措施”，因此用户信息可能非因我们的原因而丢失，包括但不限于他人非法利用用户资料，用户下载安装的其他软件或访问的其他网站中可能含有病毒、木马程序或其他恶意程序，威胁用户的终端设备信息和数据安全，继而影响本官网的正常使用等。对此，我们不承担任何责任。</div>
                        <div className='content-title'>七、用户对本软件使用及分析结果的使用</div>
                        <div className='content-text'>7.1 您可以使用本软件提供的工具收集您网站或产品的用户及操作信息，但请明确告知您的用户并获得其同意，如因收集、使用、分析您的用户数据而致使我们遭受任何形式的诉求以及投诉等，您将负责全面给予解决；如果导致我们发生任何形式的损失，您将负责给予我们赔偿。</div>
                        <div className='content-text'>7.2 本条款中的隐私声明项下的信息及对该等信息的分析结果的所有权由我们与用户共同拥有。我们建议，用户应当以符合相关法律规定和道德义务的方式使用该信息。同时，我们提醒注意，因包括但不限于技术原因、网络传输质量等原因，导致我们对我们收集的信息的分析结果可能存在不准确的情况，对于该等不准确所导致的问题或者损失，我们不承担任何责任。如果您接受本条款中的隐私声明并把我们提供给您的信息、资料集成到您的网站或应用中，您已经同意并向我们保证您所有的最终用户同意我们收集、使用并分析其信息，并且遵守本条款中的隐私声明的全部规定。</div>
                        <div className='content-text'>7.3 您在此进一步保证，您不会因为我们按照本声明的规定收集、使用、分析、披露收集的信息，及对该等信息的分析结果而对我们产生任何形式的诉求、投诉等。如果您因本条款中隐私声明项下的收集、使用、披露，或者对该等信息的分析，以及您对分析结果的使用而致使我们遭受任何形式的诉求以及投诉等，您将负责全面给予解决；如果导致我们发生任何形式的损失，您将负责给予我们赔偿。</div>
                        <div className='content-title'>八、本隐私政策如何更新</div>
                        <div className='content-mini-margin text-indent-style'>我们可能适时修订本政策内容。如该等变更会导致您在本政策项下权利的实质减损，我们将在变更生效前，通过在页面显著位置提示或向您发送电子邮件等方式通知您。我们会在本页面上发布对本隐私政策所做的任何变更。</div>
                        <div className='content-mini-margin text-indent-style'>若您不同意该等变更可以停止使用客套智能科技产品和服务，若您继续使用我们的产品和/或服务，即表示您同意受修订后的本隐私政策的约束。</div>
                        <div className='content-mini-margin text-indent-mini'> 本隐私政策所指的重大变更包括但不限于：</div>
                        <div className='content-mini-margin'>（1） 我们的服务模式发生重大变化。如处理个人信息的目的、处理的个人信息类型、个人信息的使用方式等；</div>
                        <div className='content-mini-margin'>（2） 个人信息共享、转让或公开披露的主要对象发生变化；</div>
                        <div className='content-mini-margin'>（3） 您参与个人信息处理方面的权利及其行使方式发生重大变化；</div>
                        <div className='content-text'>（4） 其他可能对您的个人信息权益产生重大影响的变化时。</div>
                        <div className='content-title'>九、如何联系我们</div>
                        <div className='content-text text-indent-style last-content-text'>您对本隐私政策有任何意见或建议，您可通过400-6978-520电话联系我们。</div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
}

export default PrivacyPolicyPage;
