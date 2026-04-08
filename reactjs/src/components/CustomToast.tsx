import React, { Fragment } from 'react';
import { FormattedMessage, FormattedTime } from 'react-intl';

import CustomScrollbars from './CustomScrollbars';

import './CustomToast.scss';

interface CustomToastProps {
  titleId: string;
  message?: string | string[];
  messageId?: string;
  time?: Date;
}

interface CustomToastCloseButtonProps {
  closeToast: () => void;
}

const CustomToast = ({
  titleId,
  message,
  messageId,
  time,
}: CustomToastProps) => {
  return (
    <Fragment>
      <div className="custom-toast">
        <div className="toast-title">
          {time && (
            <span className="date">
              <FormattedTime
                hour="numeric"
                minute="numeric"
                second="numeric"
                hour12={true}
                value={time}
              />
            </span>
          )}
          <i className="fa fa-fw fa-exclamation-triangle" />
          <FormattedMessage id={titleId} />
        </div>
        {message && Array.isArray(message) ? (
          <CustomScrollbars
            autoHeight={true}
            autoHeightMin={50}
            autoHeightMax={100}
          >
            {message.map((msg, index) => (
              <Fragment key={index}>
                <div className="toast-content">{msg}</div>
              </Fragment>
            ))}
          </CustomScrollbars>
        ) : (
          <div className="toast-content">
            {message ? (
              message
            ) : messageId ? (
              <FormattedMessage id={messageId} />
            ) : null}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export const CustomToastCloseButton = ({
  closeToast,
}: CustomToastCloseButtonProps) => {
  return (
    <button type="button" className="toast-close" onClick={closeToast}>
      <i className="fa fa-fw fa-times-circle" />
    </button>
  );
};

export default CustomToast;
