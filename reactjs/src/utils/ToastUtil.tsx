import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import CustomToast from '../components/CustomToast';

const TYPE_SUCCESS = 'SUCCESS' as const;
const TYPE_INFO = 'INFO' as const;
const TYPE_WARN = 'WARN' as const;
const TYPE_ERROR = 'ERROR' as const;

type ToastType =
  | typeof TYPE_SUCCESS
  | typeof TYPE_INFO
  | typeof TYPE_WARN
  | typeof TYPE_ERROR;

export const success = (title: string, message: string): void => {
  show(TYPE_SUCCESS, title, message);
};

export const info = (title: string, message: string): void => {
  show(TYPE_INFO, title, message);
};

export const warn = (title: string, message: string): void => {
  show(TYPE_WARN, title, message);
};

export const error = (title: string, message: string): void => {
  show(TYPE_ERROR, title, message);
};

export const successRaw = (title: string, message: string): void => {
  show(TYPE_SUCCESS, title, message, true);
};

export const errorRaw = (
  title: string,
  message: string,
  autoCloseDelay: number = 3000
): void => {
  show(TYPE_ERROR, title, message, true, autoCloseDelay);
};

interface ApiError {
  httpStatusCode: number;
  errorMessage?: string;
}

export const errorApi = (
  error: ApiError,
  title: string = 'common.fail-to-load-data',
  autoCloseDelay: number = 3000
): void => {
  // @ts-ignore
  if ((axios as any).isCancel(error)) {
    // Do nothing if request was cancelled
    return;
  }
  let message: string | undefined = undefined;
  let messageId = 'common.unknown-error';
  if (error.httpStatusCode >= 500) {
    messageId = 'common.internal-server-error';
  } else if (error.httpStatusCode < 500 && error.httpStatusCode >= 400) {
    if (error.httpStatusCode === 400) {
      messageId = 'common.bad-request';
    } else if (error.httpStatusCode === 403) {
      messageId = 'common.forbiden-request';
    }
  } else {
    // Request fail even server was returned a success response
    if (error.errorMessage) {
      message = error.errorMessage;
    }
  }
  toast.error(
    <CustomToast
      titleId={title}
      message={message}
      messageId={messageId}
      time={new Date()}
    />,
    {
      position: 'bottom-right',
      pauseOnHover: true,
      autoClose: autoCloseDelay,
    }
  );
};

const show = (
  type: ToastType,
  title: string,
  message: string,
  rawMessage: boolean = false,
  autoCloseDelay: number = 3000
): void => {
  const content = (
    <CustomToast
      titleId={title}
      messageId={rawMessage ? undefined : message}
      message={rawMessage ? message : undefined}
      time={new Date()}
    />
  );
  const options = {
    position: 'bottom-right' as const,
    pauseOnHover: true,
    autoClose: autoCloseDelay,
  };

  switch (type) {
    case TYPE_SUCCESS:
      toast.success(content, options);
      break;
    case TYPE_INFO:
      toast.info(content, options);
      break;
    case TYPE_WARN:
      toast.warn(content, options);
      break;
    case TYPE_ERROR:
      toast.error(content, options);
      break;
    default:
      break;
  }
};

export const ToastUtil = {
  success,
  info,
  warn,
  error,
  successRaw,
  errorRaw,
  errorApi,
};
