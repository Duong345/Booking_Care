import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';

import { KeyCodeUtils } from '../../utils';
import 'flatpickr/dist/themes/material_blue.css';
import './DatePicker.scss';

interface DatePickerProps {
  value?: Date | Date[];
  onChange: (dates: Date[]) => void;
  minDate?: Date;
  onClose?: () => void;
  [key: string]: any;
}

export interface DatePickerHandle {
  close: () => void;
}

const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(
  ({ value, onChange, minDate, onClose, ...rest }, ref) => {
    const flatpickrRef = useRef<any>(null);
    const flatpickrNodeRef = useRef<HTMLElement | null>(null);

    const SEPARATOR = '/';
    const DATE_FORMAT_AUTO_FILL = 'd/m/Y';
    const DISPLAY_FORMAT = 'd/m/Y';

    useImperativeHandle(
      ref,
      () => ({
        close: () => {
          flatpickrRef.current?.flatpickr?.close();
        },
      }),
      []
    );

    const handleManualInput = useCallback(
      (inputValue: string) => {
        const valueMoment = moment(inputValue, 'DD/MM/YYYY', true);

        if (valueMoment.isValid()) {
          const date = valueMoment.toDate();
          onChange([date, date]);
        }
      },
      [onChange]
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        const keyCode = event.which || event.keyCode;

        if (keyCode === KeyCodeUtils.ENTER) {
          event.preventDefault();
          handleManualInput((event.target as HTMLInputElement).value);
        }
      },
      [handleManualInput]
    );

    const handleBlur = useCallback(
      (event: Event) => {
        event.preventDefault();
        handleManualInput((event.target as HTMLInputElement).value);
      },
      [handleManualInput]
    );

    const onOpen = useCallback(() => {
      flatpickrNodeRef.current?.blur();
    }, []);

    const checkDateValue = useCallback((str: string, max: number): string => {
      if (str.charAt(0) !== '0' || str === '00') {
        let num = parseInt(str);

        if (isNaN(num) || num <= 0 || num > max) num = 1;

        str =
          num > parseInt(max.toString().charAt(0)) &&
          num.toString().length === 1
            ? '0' + num
            : num.toString();
      }
      return str;
    }, []);

    const autoFormatOnChange = useCallback(
      (value: string, separator: string): string => {
        let input = value;

        const regexForDeleting = new RegExp(`\\D\\${separator}$`);

        if (regexForDeleting.test(input)) {
          input = input.substring(0, input.length - 3);
        }

        const values = input.split(separator).map((v) => v.replace(/\D/g, ''));

        if (values[0]) values[0] = checkDateValue(values[0], 31);
        if (values[1]) values[1] = checkDateValue(values[1], 12);

        const output = values.map((v, i) =>
          v.length === 2 && i < 2 ? `${v} ${separator} ` : v
        );

        return output.join('').substring(0, 14);
      },
      [checkDateValue, SEPARATOR]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (DISPLAY_FORMAT === DATE_FORMAT_AUTO_FILL) {
          e.target.value = autoFormatOnChange(e.target.value, SEPARATOR);
        }
      },
      [autoFormatOnChange, SEPARATOR]
    );

    useEffect(() => {
      const node = flatpickrRef.current?.node;
      if (node) {
        flatpickrNodeRef.current = node;
        node.addEventListener('blur', handleBlur);
        node.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        if (flatpickrNodeRef.current) {
          flatpickrNodeRef.current.removeEventListener('blur', handleBlur);
          flatpickrNodeRef.current.removeEventListener(
            'keydown',
            handleKeyDown
          );
        }
      };
    }, [handleBlur, handleKeyDown]);

    const options: any = {
      dateFormat: DISPLAY_FORMAT,
      allowInput: true,
      disableMobile: true,
      onClose,
      onOpen,
    };

    if (minDate) {
      options.minDate = minDate;
    }

    return (
      <Flatpickr
        ref={flatpickrRef}
        value={value}
        onChange={onChange}
        options={options}
        {...rest}
      />
    );
  }
);

export default DatePicker;
