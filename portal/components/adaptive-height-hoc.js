/**
 * 自适应高度计算高阶组件
 *
 * 用于在初次加载或窗口大小变化时计算被包裹组件里指定元素除去其上偏移和底边距后的高度
 *
 * 多与滚动条组件配合使用，计算滚动条组件外层容器的高度
 */
import { LAYOUT } from 'LIB_DIR/consts';
import { isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';
// element:计算高度的元素（例：'.detail-content'），不传计算最外层的内容区高度;
export default function(WrappedComponent, element, marginBottom = 0) {
    return class extends React.Component {
        state = {
            adaptiveHeight: this.getAdaptiveHeight() || 0,
        }
        resizeTimeout = null
        componentDidMount() {
            // 渲染完界面后重新计算容器高度
            this.onWindowResize();
            $(window).on('resize', this.onWindowResize);
        }

        componentWillUnmount() {
            $(window).off('resize', this.onWindowResize);
        }

        onWindowResize = () => {
            //该高阶组件装载完成时，其包裹的组件可能还没装载完成，因为窗口大小变化事件里要用到包裹的组件里的元素，所以加个延时，以便能找到需要的元素
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.setState({ adaptiveHeight: this.getAdaptiveHeight()});
            });
        }

        getAdaptiveHeight() {
            const $element = element && $(element).length ? $(element) : $('#app .main-content-wrap');
            const offsetTop = $element.offset().top;
            let adaptiveHeight = $(window).height() - offsetTop - marginBottom;
            // 不传element是计算最外层内容展示区的高度，移动端内容区高度，需要减去底部导航的高度
            if (isResponsiveDisplay().isWebSmall) {
                adaptiveHeight -= LAYOUT.BOTTOM_NAV;
            }
            return adaptiveHeight;
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state} />;
        }
    };
}
