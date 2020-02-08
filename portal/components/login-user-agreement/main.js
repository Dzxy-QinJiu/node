/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/14.
 */
require('./css/index.less');
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
};
class UserAgreementPage extends React.Component {
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
        return $(window).height() - LAYOUT_CONST.MARGAIN - LAYOUT_CONST.TITLE_HEIGHT;
    }
    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
        $(window).off('resize', this.onWindowResize);
    }

    render() {
        const hasWindow = !(typeof window === 'undefined');
        const contentHeight = this.state.contentHeight;
        return (
            <div className="user-agreement-wrap" data-tracename="用户协议">
                <div className="user-agreement-title">
                    <LoginLogo size='20px' fontSize='16px' />
                    <span className='user-agreement-text'>{Intl.get('login.user.agreement', '用户使用协议')}</span>
                </div>
                <div className='user-agreement-content' style={{ height: contentHeight }}>
                    <GeminiScrollbar>
                        <div className='content-title'>【首部及导言】</div>
                        <div className='content-text'>欢迎您使用客套应用软件及服务！</div>
                        <div className='content-text'>
                            为使用客套应用软件（以下简称“本软件”）及服务，您应当阅读并遵守《客套用户使用协议》（以下简称“本协议”）。请您务必审慎阅读、充分理解各条款内容，特别是免除或者限制责任的条款，以及开通或使用某项服务的单独协议，并选择接受或不接受。
                            除非您已阅读并接受本协议所有条款，否则您无权下载、安装或使用本软件及相关服务。您的下载、安装、使用、获取客套帐号、登录等行为即视为您已阅读并同意上述协议的约束。
                        </div>
                        <div className='content-text'>如果您未满18周岁，请在法定监护人的陪同下阅读本协议及其他上述协议，并特别注意未成年人使用条款</div>
                        <div className='content-title'>一、【协议的范围】</div>
                        <div className='content-title'>1.1【协议适用主体范围】</div>
                        <div className='content-text'>本协议是您与山东客套智能科技有限公司（以下简称“客套智能科技”）之间关于您下载、安装、使用、复制本软件，以及使用客套智能科技相关服务所订立的协议。</div>
                        <div className='content-title'>1.2【协议关系及冲突条款】</div>
                        <div className='content-text'>本协议内容包括客套智能科技可能不断发布的关于本服务的相关协议、业务规则等内容。上述内容一经正式发布，即为本协议不可分割的组成部分，您同样应当遵守。</div>
                        <div className='content-title'>二、【关于本服务】</div>
                        <div className='content-title'>2.1【本服务的内容】</div>
                        <div className='content-text'>本服务的具体内容由客套智能科技根据实际情况提供，包括但不限于授权用户通过其客套帐号管理自己的客户，使用客套进行团队沟通，客套智能科技有权对其提供的服务进行扩展。（以下简称“本服务”）</div>
                        <div className='content-title'>2.2【本服务的形式】</div>
                        <div className='content-text'>2.2.1 您使用本服务需要下载客套客户端软件，对于这些软件，客套智能科技给予您一项个人的、不可转让及非排他性的许可。您仅可为访问或使用本服务的目的而使用这些软件及服务。</div>
                        <div className='content-text'>2.2.2 本服务中客套客户端软件提供包括但不限于Android 、iOS、Web等多个应用版本，用户必须选择与所安装设备相匹配的软件版本。</div>
                        <div className='content-title'>2.3【本服务许可的范围】</div>
                        <div className='content-text'>2.3.1 客套智能科技给予您一项个人的、不可转让及非排他性的许可，以使用本软件。您可以为非商业目的在单一台终端设备上安装、使用、显示、运行本软件。</div>
                        <div className='content-text'>2.3.2 本条及本协议其他条款未明示授权的其他一切权利仍由客套智能科技保留，您在行使这些权利时须另外取得客套智能科技的书面许可。客套智能科技如果未行使前述任何权利，并不构成对该权利的放弃。</div>
                        <div className='content-text'>2.3.3 您允许客套智能科技通过网站、手机号码、电话、邮件或信件给您发送重要通知。本服务条款同样适用于移动应用程序。您同意及时更新您的个人资料。</div>
                        <div className='content-title'>三、【软件的获取】</div>
                        <div className='content-text'>3.1 您可以直接从客套官方网站上获取本软件。</div>
                        <div className='content-text'>3.2 如果您从未经客套智能科技授权的第三方获取本软件或与本软件名称相同的安装程序，客套智能科技无法保证该软件能够正常使用，并对因此给您造成的损失不予负责。</div>
                        <div className='content-title'>四、【软件的安装与卸载】</div>
                        <div className='content-text'>4.1 客套智能科技可能为不同的终端设备开发了不同的软件版本，您应当根据实际情况选择下载合适的版本进行安装。</div>
                        <div className='content-text'>4.2 下载安装程序后，您需要按照该程序提示的步骤正确安装。</div>
                        <div className='content-text'>4.3 为提供更加优质、安全的服务，在本软件安装时客套智能科技可能推荐您安装其他软件，您可以选择安装或不安装。</div>
                        <div className='content-text'>4.4 如果您不再需要使用本软件或者需要安装新版软件，可以自行卸载。如果您愿意帮助客套智能科技改进产品服务，请告知卸载的原因。</div>
                        <div className='content-title'>五、【软件的更新】</div>
                        <div className='content-text'>5.1 为了改善用户体验、完善服务内容，客套智能科技将不断努力开发新的服务，并为您不时提供软件更新（这些更新可能会采取软件替换、修改、功能强化、版本升级等形式）。</div>
                        <div className='content-text'>5.2 为了保证本软件及服务的安全性和功能的一致性，客套智能科技有权不经向您特别通知而对软件进行更新，或者对软件的部分功能效果进行改变或限制。</div>
                        <div className='content-text'>5.3 本软件新版本发布后，旧版本的软件可能无法使用。客套智能科技不保证旧版本软件继续可用及相应的客户服务，请您随时核对并下载最新版本。</div>
                        <div className='content-title'>六、【用户个人信息保护】</div>
                        <div className='content-text'>6.1 保护用户个人信息是客套智能科技的一项基本原则，客套智能科技将会采取合理的措施保护用户的个人信息。除法律法规规定的情形外，未经用户许可客套智能科技不会向第三方公开、透露用户个人信息。客套智能科技对相关信息采用专业加密存储与传输方式，保障用户个人信息的安全。</div>
                        <div className='content-text'>6.2 您在注册帐号或使用本服务的过程中，可能需要提供一些必要的信息，例如：为向您提供帐号注册服务或进行用户身份识别，需要您填写手机号码、电子邮箱地址等信息；若国家法律法规或政策有特殊规定的，您需要提供真实的身份信息。若您提供的信息不完整，则无法使用本服务或在使用过程中受到限制。</div>
                        <div className='content-text'>6.3 一般情况下，您可随时浏览、修改自己提交的信息，但出于安全性和身份识别的考虑，您可能无法修改注册时提供的初始注册信息及其他验证信息。</div>
                        <div className='content-text'>6.4 客套智能科技将运用各种安全技术和程序建立完善的管理制度来保护您的个人信息，以免遭受未经授权的访问、使用或披露。</div>
                        <div className='content-text'>6.5 未经您的同意，客套智能科技不会向客套智能科技以外的任何公司、组织和个人披露您的个人信息，但法律法规另有规定的除外。</div>
                        <div className='content-text'>6.6 客套智能科技非常重视对未成年人个人信息的保护。若您是18周岁以下的未成年人，在使用客套智能科技的服务前，应事先取得您家长或法定监护人的书面同意。</div>
                        <div className='content-title'>七、【主权利义务条款】</div>
                        <div className='content-title'>7.1 【帐号使用规范】</div>
                        <div className='content-text'>7.1.1您在使用本服务前需要注册一个客套账号，您的客套账号，即为您的客套应用账号。客套账号可以通过手机号码进行绑定注册。客套智能科技有权根据用户需求或产品需要对帐号注册和绑定的方式进行变更，关于您使用帐号的具体规则，请遵守《客套账号使用规则》、相关帐号使用协议以及客套智能科技为此发布的专项规则。</div>
                        <div className='content-text'>7.1.2 客套帐号的所有权归山东客套智能科技有限公司所有，用户完成注册程序，成功开通客套账号后，仅获得客套帐号的使用权，且该使用权仅属于初始申请注册人/单位，同时，初始申请注册人/单位不得赠与、借用、租用、转让或售卖客套帐号或者以其他方式许可非初始申请注册人/单位使用客套帐号。非初始申请注册人/单位不得通过受赠、继承、承租、受让或者其他任何方式使用客套账号。</div>
                        <div className='content-text'>7.1.3 用户有责任妥善保管注册帐户信息及帐户密码的安全，用户需要对注册帐户以及密码下的行为承担法律责任。用户同意在任何情况下不向他人透露帐户及密码信息。在您怀疑他人在使用您的帐号时，您应立即通知客套智能科技公司。</div>
                        <div className='content-text'>7.1.4 用户注册后，客套智能科技将根据您提交的组织名称、邮箱、手机号码等资料，及您的需求为您分配用户名，用户名一旦分配不可更改，但您可以对密码进行修改。</div>
                        <div className='content-title'>7.2 【用户注意事项】</div>
                        <div className='content-text'>7.2.1 您理解并同意：为了向您提供有效的服务，本软件会利用您的桌面电脑或移动通讯终端的处理器和带宽等资源。本软件使用过程中可能产生数据流量的费用，用户需自行向运营商了解相关资费信息，并自行承担相关费用。</div>
                        <div className='content-text'>7.2.2 您理解并同意：本软件的某些功能可能会让第三方知晓用户的信息，例如：客套应用集成功能，用户可能会通过客套与微信等第三方服务进行互动。</div>
                        <div className='content-text'>7.2.3 您在使用本软件某一特定服务时，该服务可能会另有单独的协议、相关业务规则等（以下统称为“单独协议”），您在使用该项服务前请阅读并同意相关的单独协议。</div>
                        <div className='content-text'>7.2.4 您理解并同意客套智能科技将会尽其商业上的合理努力保障您在本软件及服务中的数据存储安全，但是，客套智能科技并不能就此提供完全保证，包括但不限于以下情形：</div>
                        <div className='content-text'>7.2.4.1 客套智能科技不对您在本软件及服务中相关数据的删除或储存失败负责；</div>
                        <div className='content-text'>7.2.4.2 客套智能科技有权根据实际情况自行决定单个用户在本软件及服务中数据的最长储存期限，并在服务器上为其分配数据最大存储空间等。您可根据自己的需要自行备份本软件及服务中的相关数据；</div>
                        <div className='content-text'>7.2.4.3 如果您停止使用本软件及服务或服务被终止或取消，客套智能科技可以从服务器上永久地删除您的数据。服务停止、终止或取消后，客套智能科技没有义务向您返还任何数据。</div>
                        <div className='content-text'>7.2.5 用户在使用本软件及服务时，须自行承担如下来自客套智能科技不可掌控的风险内容，包括但不限于：</div>
                        <div className='content-text'>7.2.5.1 由于不可抗拒因素可能引起的个人信息丢失、泄漏等风险；</div>
                        <div className='content-text'>7.2.5.2 用户必须选择与所安装终端设备相匹配的软件版本，否则，由于软件与终端设备型号不相匹配所导致的任何问题或损害，均由用户自行承担；</div>
                        <div className='content-text'>7.2.5.3 用户在使用本软件访问第三方网站时，因第三方网站及相关内容所可能导致的风险，由用户自行承担；</div>
                        <div className='content-text'>7.2.5.4 用户发布的内容被他人转发、分享，因此等传播可能带来的风险和责任；</div>
                        <div className='content-text'>7.2.5.5 由于无线网络信号不稳定、无线网络带宽小等原因，所引起的客套登录失败、资料同步不完整、页面打开速度慢等风险。</div>
                        <div className='content-text'>7.2.6 客套智能科技有权对用户使用客套服务的情况进行审查和监督，如用户在使用本服务时违反任何本协议的规定，客套智能科技或其授权的人有权要求用户改正或直接采取一切必要的措施（包括但不限于禁用或删除用户的账号、暂停或终止用户使用本服务的权利）以减轻用户不当行为造成的影响。</div>
                        <div className='content-text'>7.2.7 在您使用本服务时，客套智能科技有权依照相应的服务，或相关协议向您收取服务费用。客套智能科技公司可能根据实际需要对收费服务的收费标准、方式进行修改和变更，客套智能科技公司也可能会对部分免费服务开始收费。</div>
                        <div className='content-text'>7.2.8 修改、变更或开始收费前，客套智能科技有限公司将在相应服务页面进行通知或公告。如果您不同意上述修改、变更或付费内容，则应停止使用该服务。您可以在确认本服务内容和收费标准后，付费升级服务，成功支付后，表明您已经获得使用付费服务的权利并且已经达成此项交易，除非客套智能科技公司的原因导致服务无法正常提供，否则我们将不退还您已经支付的服务费。</div>
                        <div className='content-title'>7.3 【第三方产品和服务】</div>
                        <div className='content-text'>7.3.1 您在使用本软件第三方提供的产品或服务时，除遵守本协议约定外，还应遵守第三方的用户协议。客套智能科技和第三方对可能出现的纠纷在法律规定和约定的范围内各自承担责任。</div>
                        <div className='content-text'>7.3.2 因用户使用本软件或要求客套智能科技提供特定服务时，本软件可能会调用第三方系统或者通过第三方支持用户的使用或访问，使用或访问的结果由该第三方提供，客套智能科技不保证通过第三方提供服务及内容的安全性、准确性、有效性及其他不确定的风险，由此若引发的任何争议及损害，与客套智能科技无关，客套智能科技不承担任何责任。</div>
                        <div className='content-title'>八、【用户行为规范】</div>
                        <div className='content-title'>8.1 【信息内容规范】</div>
                        <div className='content-text'>8.1.1 本条所述信息内容是指用户使用本软件及服务过程中所制作、复制、发布、传播的任何内容，包括但不限于客套帐号头像、名字、用户说明等注册信息，或文字、语音、图片、文件等发送的图文和相关链接页面，以及其他使用客套帐号或本软件及服务所产生的内容。</div>
                        <div className='content-text'>8.1.2 您理解并同意，客套一直致力于为用户提供文明健康、规范有序的网络环境，您不得利用客套帐号或本软件及服务制作、复制、发布、传播如下干扰客套正常运营，以及侵犯其他用户或第三方合法权益的内容，包括但不限于：</div>
                        <div className='content-text'>8.1.2.1 发布、传送、传播、储存违反国家法律、危害国家安全统一、社会稳定、公序良俗、社会公德以及侮辱、诽谤、淫秽或含有任何性或性暗示的、暴力的内容；</div>
                        <div className='content-text'>8.1.2.2 发布、传送、传播、储存侵害他人名誉权、肖像权、知识产权、商业秘密等合法权利的内容；</div>
                        <div className='content-text'>8.1.2.3 涉及他人隐私、个人信息或资料的；</div>
                        <div className='content-text'>8.1.2.4 发表、传送、传播骚扰、广告信息及垃圾信息；</div>
                        <div className='content-text'>8.1.2.5 其他违反法律法规、政策及公序良俗、社会公德或干扰客套正常运营和侵犯其他用户或第三方合法权益内容的信息。</div>
                        <div className='content-title'>8.2 【软件使用规范】</div>
                        <div className='content-text'>除非法律允许或客套智能科技书面许可，您使用本软件过程中不得从事下列行为：</div>
                        <div className='content-text'>8.2.1 删除本软件及其副本上关于著作权的信息；</div>
                        <div className='content-text'>8.2.2 对本软件进行反向工程、反向汇编、反向编译，或者以其他方式尝试发现本软件的源代码；</div>
                        <div className='content-text'>8.2.3 对客套智能科技拥有知识产权的内容进行使用、出租、出借、复制、修改、链接、转载、汇编、发表、出版、建立镜像站点等；</div>
                        <div className='content-text'>8.2.4 对本软件或者本软件运行过程中释放到任何终端内存中的数据、软件运行过程中客户端与服务器端的交互数据，以及本软件运行所必需的系统数据，进行复制、修改、增加、删除、挂接运行或创作任何衍生作品，形式包括但不限于使用插件、外挂或非客套智能科技经授权的第三方工具/服务接入本软件和相关系统；</div>
                        <div className='content-text'>8.2.5 通过修改或伪造软件运行中的指令、数据，增加、删减、变动软件的功能或运行效果，或者将用于上述用途的软件、方法进行运营或向公众传播，无论这些行为是否为商业目的；</div>
                        <div className='content-text'>8.2.6 通过非客套智能科技开发、授权的第三方软件、插件、外挂、系统，登录或使用客套智能科技软件及服务，或制作、发布、传播上述工具；</div>
                        <div className='content-text'>8.2.7 自行或者授权他人、第三方软件对本软件及其组件、模块、数据进行干扰；</div>
                        <div className='content-text'>8.2.8 其他未经客套智能科技明示授权的行为。</div>
                        <div className='content-title'>8.3 【服务运营规范】</div>
                        <div className='content-text'>除非法律允许或客套智能科技书面许可，您使用本服务过程中不得从事下列行为：</div>
                        <div className='content-text'>8.3.1 提交、发布虚假信息，或冒充、利用他人名义的；</div>
                        <div className='content-text'>8.3.2 诱导其他用户点击链接页面或分享信息的；</div>
                        <div className='content-text'>8.3.3 虚构事实、隐瞒真相以误导、欺骗他人的；</div>
                        <div className='content-text'>8.3.4 侵害他人名誉权、肖像权、知识产权、商业秘密等合法权利的；</div>
                        <div className='content-text'>8.3.5 未经客套智能科技书面许可利用客套帐号和任何功能，以及第三方运营平台进行推广或互相推广的；</div>
                        <div className='content-text'>8.3.6 利用客套帐号或本软件及服务从事任何违法犯罪活动的；</div>
                        <div className='content-text'>8.3.7 制作、发布与以上行为相关的方法、工具，或对此类方法、工具进行运营或传播，无论这些行为是否为商业目的；</div>
                        <div className='content-text'>8.3.8 其他违反法律法规规定、侵犯其他用户合法权益、干扰产品正常运营或客套智能科技未明示授权的行为。</div>
                        <div className='content-title'>8.4 【对自己行为负责】</div>
                        <div className='content-text'>您充分了解并同意，您必须为自己注册帐号下的一切行为负责，包括您所发表的任何内容以及由此产生的任何后果。您应对本服务中的内容自行加以判断，并承担因使用内容而引起的所有风险，包括因对内容的正确性、完整性或实用性的依赖而产生的风险。客套智能科技无法且不会对因前述风险而导致的任何损失或损害承担责任。</div>
                        <div className='content-text'>8.5 【违约处理】</div>
                        <div className='content-text'>8.5.1 如果客套智能科技发现或收到他人举报或投诉用户违反本协议约定的，客套智能科技有权不经通知随时对相关内容进行删除，并视行为情节对违规帐号处以包括但不限于警告、限制或禁止使用全部或部分功能、帐号封禁直至注销的处罚，并公告处理结果。</div>
                        <div className='content-text'>8.5.2 您理解并同意，客套智能科技有权依合理判断对违反有关法律法规或本协议规定的行为进行处罚，对违法违规的任何用户采取适当的法律行动，并依据法律法规保存有关信息向有关部门报告等，用户应独自承担由此而产生的一切法律责任。</div>
                        <div className='content-text'>8.5.3 您理解并同意，因您违反本协议或相关服务条款的规定，导致或产生第三方主张的任何索赔、要求或损失，您应当独立承担责任；客套智能科技因此遭受损失的，您也应当一并赔偿。</div>
                        <div className='content-title'>九、【知识产权声明】</div>
                        <div className='content-text'>9.1 客套智能科技是本软件的知识产权权利人。本软件的一切著作权、商标权、专利权、商业秘密等知识产权，以及与本软件相关的所有信息内容（包括但不限于文字、图片、音频、视频、图表、界面设计、版面框架、有关数据或电子文档等）均受中华人民共和国法律法规和相应的国际条约保护，客套智能科技享有上述知识产权，但相关权利人依照法律规定应享有的权利除外。</div>
                        <div className='content-text'>9.2 未经客套智能科技或相关权利人书面同意，您不得为任何商业或非商业目的自行或许可任何第三方实施、利用、转让上述知识产权。</div>
                        <div className='content-title'>十、【终端安全责任】</div>
                        <div className='content-text'>10.1 您理解并同意，本软件同大多数互联网软件一样，可能会受多种因素影响，包括但不限于用户原因、网络服务质量、社会环境等；也可能会受各种安全问题的侵扰，包括但不限于他人非法利用用户资料，进行现实中的骚扰；用户下载安装的其他软件或访问的其他网站中可能含有病毒、木马程序或其他恶意程序，威胁您的终端设备信息和数据安全，继而影响本软件的正常使用等。因此，您应加强信息安全及个人信息的保护意识，注意密码保护，以免遭受损失。</div>
                        <div className='content-text'>10.2 您不得制作、发布、使用、传播用于窃取客套帐号及他人个人信息、财产的恶意程序。</div>
                        <div className='content-text'>10.3 维护软件安全与正常使用是客套智能科技和您的共同责任，客套智能科技将按照行业标准合理审慎地采取必要技术措施保护您的终端设备信息和数据安全，但是您承认和同意客套智能科技并不能就此提供完全保证。</div>
                        <div className='content-text'>10.4 在任何情况下，您不应轻信借款、索要密码或其他涉及财产的网络信息。涉及财产操作的，请一定先核实对方身份，并请经常留意客套智能科技有关防范诈骗犯罪的提示。</div>
                        <div className='content-title'>十一、【第三方软件或技术】</div>
                        <div className='content-text'>11.1 本软件可能会使用第三方软件或技术（包括本软件可能使用的开源代码和公共领域代码等，下同），这种使用已经获得合法授权。</div>
                        <div className='content-text'>11.2 本软件如果使用了第三方的软件或技术，客套智能科技将按照相关法规或约定，对相关的协议或其他文件，可能通过本协议附件、在本软件安装包特定文件夹中打包等形式进行展示，它们可能会以“软件使用许可协议”、“授权协议”、“开源代码许可证”或其他形式来表达。前述通过各种形式展现的相关协议或其他文件，均是本协议不可分割的组成部分，与本协议具有同等的法律效力，您应当遵守这些要求。如果您没有遵守这些要求，该第三方或者国家机关可能会对您提起诉讼、罚款或采取其他制裁措施，并要求客套智能科技给予协助，您应当自行承担法律责任。</div>
                        <div className='content-text'>11.3 如因本软件使用的第三方软件或技术引发的任何纠纷，应由该第三方负责解决，客套智能科技不承担任何责任。客套智能科技不对第三方软件或技术提供客服支持，若您需要获取支持，请与第三方联系。</div>
                        <div className='content-title'>十二、【其他】</div>
                        <div className='content-text'>12.1 您使用本软件即视为您已阅读并同意受本协议的约束。客套智能科技有权在必要时修改本协议条款。您可以在本软件的最新版本中查阅相关协议条款。本协议条款变更后，如果您继续使用本软件，即视为您已接受修改后的协议。如果您不接受修改后的协议，应当停止使用本软件。</div>
                        <div className='content-text'>12.2 本协议的成立、生效、履行、解释及纠纷解决，适用中华人民共和国大陆地区法律（不包括冲突法）。</div>
                        <div className='content-text'>12.3 若您和客套智能科技之间发生任何纠纷或争议，首先应友好协商解决；协商不成的，您同意将纠纷或争议提交本协议签订地有管辖权的人民法院管辖。</div>
                        <div className='content-text'>12.4 本协议所有条款的标题仅为阅读方便，本身并无实际涵义，不能作为本协议涵义解释的依据。</div>
                        <div className='content-text'>12.5 本协议条款无论因何种原因部分无效或不可执行，其余条款仍有效，对双方具有约束力。（正文完）</div>
                        <div className='content-text bottom-right-company'>山东客套智能科技有限公司</div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
}

export default UserAgreementPage;
