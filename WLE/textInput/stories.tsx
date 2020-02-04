import React from 'react';
import { withThemeProvider } from '~/helpers/storybook/with-theme-provider';
import { TextInput } from '~/components/textInput/index';

export default {
  title: 'Input',
  decorators: [withThemeProvider],
};

export const input1 = () => {
  return (
    <TextInput
      label={'First name'}
      defaultValue={'defaultValue'}
      autoFocus={true}
      disabled={false}
      autoComplete={'off'}
      placeholder={'input any text'}
      required={true}
      onChange={(e) => console.log(e)}
      errorMessage={'Error message'}
      errorHandler={'onBlur'}
      validateInput={(value) => value.length >= 5 && value !== ''}
    />
  );
};

/*
export const input2 = () => {
  return (
    <div>
      <TextInput
        label={'First name'}
        defaultValue={''}
        autoFocus={true}
        disabled={false}
        autoComplete={'off'}
        placeholder={'input any text'}
        required={true}
        onChange={(e) => console.log(e.target.value)}
        errorMessage={'Error message'}
        errorHandler={'onBlur'}
        validateInput={(value) => value.length >= 5 && value !== ''}
      />
      <TextInput
        defaultValue={'defaultValue'}
        autoFocus={true}
        label={'First name'}
        disabled={false}
        autoComplete={'off'}
        placeholder={'input any text'}
        required={true}
        onChange={(e) => console.log(e.target.value)}
        errorMessage={'Error message'}
        errorHandler={'onChange'}
        validateInput={(value) => value.length >= 15 && value !== ''}
      />
      <TextInput
        defaultValue={'disabled'}
        autoFocus={true}
        label={'First name'}
        disabled={true}
        autoComplete={'off'}
        placeholder={'input any text'}
        required={true}
        onChange={(e) => console.log(e.target.value)}
        errorMessage={'Error message'}
        errorHandler={'onChange'}
        validateInput={(value) => value.length >= 5 && value !== ''}
      />
    </div>
  );
};
*/
