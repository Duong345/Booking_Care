import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import './CustomScrollbars.scss';

export interface CustomScrollbarsProps {
  className?: string;
  disableVerticalScroll?: boolean;
  disableHorizontalScroll?: boolean;
  quickScroll?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface CustomScrollbarsHandle {
  getScrollLeft: () => number;
  getScrollTop: () => number;
  scrollToBottom: () => void;
  scrollTo: (targetTop: number) => void;
}

const CustomScrollbars = forwardRef<
  CustomScrollbarsHandle,
  CustomScrollbarsProps
>(
  (
    {
      className,
      disableVerticalScroll,
      disableHorizontalScroll,
      quickScroll,
      children,
      ...otherProps
    },
    ref
  ) => {
    const scrollbarsRef = useRef<Scrollbars>(null);

    const getScrollLeft = useCallback(() => {
      return scrollbarsRef.current?.getScrollLeft() ?? 0;
    }, []);

    const getScrollTop = useCallback(() => {
      return scrollbarsRef.current?.getScrollTop() ?? 0;
    }, []);

    const scrollTo = useCallback(
      (targetTop: number) => {
        const scrollbars = scrollbarsRef.current;
        if (!scrollbars) return;
        const originalTop = scrollbars.getScrollTop();
        let iteration = 0;
        const scroll = () => {
          iteration++;
          if (iteration > 30) return;
          scrollbars.scrollTop(
            originalTop + ((targetTop - originalTop) / 30) * iteration
          );
          if (quickScroll) {
            scroll();
          } else {
            setTimeout(scroll, 20);
          }
        };
        scroll();
      },
      [quickScroll]
    );

    const scrollToBottom = useCallback(() => {
      const scrollbars = scrollbarsRef.current;
      if (!scrollbars) return;
      const targetScrollTop = scrollbars.getScrollHeight();
      scrollTo(targetScrollTop);
    }, [scrollTo]);

    useImperativeHandle(
      ref,
      () => ({
        getScrollLeft,
        getScrollTop,
        scrollToBottom,
        scrollTo,
      }),
      [getScrollLeft, getScrollTop, scrollToBottom, scrollTo]
    );

    const renderTrackHorizontal = (props: any) => (
      <div {...props} className="track-horizontal" />
    );
    const renderTrackVertical = (props: any) => (
      <div {...props} className="track-vertical" />
    );
    const renderThumbHorizontal = (props: any) => (
      <div {...props} className="thumb-horizontal" />
    );
    const renderThumbVertical = (props: any) => (
      <div {...props} className="thumb-vertical" />
    );
    const renderNone = () => <div />;

    return (
      <Scrollbars
        ref={scrollbarsRef}
        autoHide={true}
        autoHideTimeout={200}
        hideTracksWhenNotNeeded={true}
        className={
          className ? `${className} custom-scrollbar` : 'custom-scrollbar'
        }
        {...otherProps}
        renderTrackHorizontal={
          disableHorizontalScroll ? renderNone : renderTrackHorizontal
        }
        renderTrackVertical={
          disableVerticalScroll ? renderNone : renderTrackVertical
        }
        renderThumbHorizontal={
          disableHorizontalScroll ? renderNone : renderThumbHorizontal
        }
        renderThumbVertical={
          disableVerticalScroll ? renderNone : renderThumbVertical
        }
      >
        {children}
      </Scrollbars>
    );
  }
);

export default CustomScrollbars;
