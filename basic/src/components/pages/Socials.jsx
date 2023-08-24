import React from 'react';
import { StyledLabel, StyledLinkInput } from './styling/PagesStyling';

export default function Socials({ formData, onFormDataChange }) {
  const { gitHub, linkedIn, email } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div>
      <StyledLabel>GITHUB*</StyledLabel>
      <StyledLinkInput
        type="text"
        name="gitHub"
        placeholder={'https://github.com/'}
        value={gitHub}
        onChange={handleInputChange}
      />
      <StyledLabel>LINKEDIN*</StyledLabel>
      <StyledLinkInput
        type="text"
        name="linkedIn"
        placeholder={'https://linkedin.com/'}
        value={linkedIn}
        onChange={handleInputChange}
      />
      <StyledLabel>EMAIL*</StyledLabel>
      <StyledLinkInput
        type="text"
        name="email"
        placeholder={'user@example.com'}
        value={email}
        onChange={handleInputChange}
      />
    </div>
  );
}
