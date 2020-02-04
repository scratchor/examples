import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';

interface TextInputProps extends React.HTMLAttributes<HTMLInputElement> {
  label?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  errorHandler?: string;
  validateInput?: (value: string) => boolean;
}

const TextInputWrapper = styled.div`
  font-family: ${(props) => props.theme.typography.fontFamily};
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.2px;

  input {
    border: 2px solid #74b7fd;
    box-sizing: border-box;
    border-radius: 6px;
    background: linear-gradient(0deg, rgba(228, 28, 28, 0.0621176), rgba(228, 28, 28, 0.0621176)),
      #ffffff;
    margin: 5px 0 5px 0;
  }

  label {
    display: flex;
    flex-direction: column;
    color: ${(props) => props.theme.colors.primary};
  }

  .errorBorderColor {
    background: #ffffff;
    border: 2px solid #e41c1c;
    border-radius: 6px;
  }

  .errorContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${(props) => props.theme.colors.error};
  }
`;

export const TextInput: React.FC<TextInputProps> = ({
  label, // field name
  defaultValue,
  autoFocus = false,
  disabled = false,
  autoComplete = 'off',
  placeholder = '',
  required = false,
  onChange = undefined, // onChange callback passed in the props
  errorHandler = 'onChange', // event on which error handler will be fired - default is onChange
  errorMessage = '', // pass desired error message
  validateInput = undefined, // callback that checks validation for input. Return boolean
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(false);
  const [typingError, setTypingError] = useState(false);

  const timer: MutableRefObject<number> = useRef(0);

  const checkError = (value: string): void => {
    setError(!!validateInput && !validateInput(value.trim()));
  };

  const timerChecker = (): void => {
    if (timer.current) {
      setTypingError(false);
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setTypingError(true);
    }, 250);
  };

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return (
    <TextInputWrapper>
      <label>
        {label}
        <input
          className={typingError && error ? 'errorBorderColor' : ''}
          type='text'
          value={value}
          onChange={(e) => {
            timerChecker();
            setValue(e.target.value);
            onChange && onChange(e);
            errorHandler === 'onChange' ? checkError(e.target.value) : null;
          }}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          onBlur={(e) => (errorHandler === 'onBlur' ? checkError(e.target.value) : null)}
        />
        {error && (
          <div className={'errorContainer'}>
            <FaExclamationTriangle /> &nbsp; {errorMessage}
          </div>
        )}
      </label>
    </TextInputWrapper>
  );
};
