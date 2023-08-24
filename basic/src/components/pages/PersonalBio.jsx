import React from 'react';
import { StyledLabel, StyledParagraphTextInput } from './styling/PagesStyling';

export default function PersonalBio({ formData, onFormDataChange }) {
    const { personalBio } = formData;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFormDataChange({
            ...formData,
            [name]: value,
        });
    };

    return (
        <div>
            <StyledLabel>PERSONAL BIO*</StyledLabel>
            <StyledParagraphTextInput
                type="text"
                name="personalBio"
                placeholder={'Write a paragraph or two...'}
                value={personalBio}
                onChange={handleInputChange}
            />
        </div>
    );
}
