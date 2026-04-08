declare module 'react-custom-scrollbars' {
  import * as React from 'react';

  export interface ScrollbarsProps {
    autoHide?: boolean;
    autoHideTimeout?: number;
    autoHideDuration?: number;
    autoHeight?: boolean;
    autoHeightMin?: number | string;
    autoHeightMax?: number | string;
    thumbMinSize?: number;
    universal?: boolean;
    hideTracksWhenNotNeeded?: boolean;
    renderView?: (props: any) => React.ReactElement;
    renderTrackHorizontal?: (props: any) => React.ReactElement;
    renderTrackVertical?: (props: any) => React.ReactElement;
    renderThumbHorizontal?: (props: any) => React.ReactElement;
    renderThumbVertical?: (props: any) => React.ReactElement;
    tagName?: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onScroll?: (e: any) => void;
    onScrollFrame?: (values: any) => void;
    onScrollStart?: () => void;
    onScrollStop?: () => void;
    onUpdate?: (values: any) => void;
  }

  export interface ScrollbarsApi {
    getScrollLeft: () => number;
    getScrollTop: () => number;
    getScrollWidth: () => number;
    getScrollHeight: () => number;
    getClientWidth: () => number;
    getClientHeight: () => number;
    getValues: () => {
      left: number;
      top: number;
      scrollLeft: number;
      scrollTop: number;
      scrollWidth: number;
      scrollHeight: number;
      clientWidth: number;
      clientHeight: number;
    };
    scrollLeft: (left: number) => void;
    scrollTop: (top: number) => void;
    scrollToLeft: () => void;
    scrollToTop: () => void;
    scrollToRight: () => void;
    scrollToBottom: () => void;
  }

  export class Scrollbars
    extends React.Component<ScrollbarsProps>
    implements ScrollbarsApi
  {
    getScrollLeft: () => number;
    getScrollTop: () => number;
    getScrollWidth: () => number;
    getScrollHeight: () => number;
    getClientWidth: () => number;
    getClientHeight: () => number;
    getValues: () => {
      left: number;
      top: number;
      scrollLeft: number;
      scrollTop: number;
      scrollWidth: number;
      scrollHeight: number;
      clientWidth: number;
      clientHeight: number;
    };
    scrollLeft: (left: number) => void;
    scrollTop: (top: number) => void;
    scrollToLeft: () => void;
    scrollToTop: () => void;
    scrollToRight: () => void;
    scrollToBottom: () => void;
  }

  export default Scrollbars;
}
