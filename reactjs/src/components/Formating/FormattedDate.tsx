import React from 'react';
import moment from 'moment';

const dateFormat = 'DD/MM/YYYY';

interface FormattedDateProps {
  format?: string;
  value?: string | Date | number;
  [key: string]: any;
}

const FormattedDate = ({
  format,
  value,
  ...otherProps
}: FormattedDateProps) => {
  const dFormat = format || dateFormat;
  const formattedValue = value ? moment.utc(value).format(dFormat) : null;

  return <span {...otherProps}>{formattedValue}</span>;
};

export default FormattedDate;
