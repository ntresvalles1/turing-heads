import React from 'react';
import { StyledLabel, StyledLabelGroup, StyledLinkInput, StyledTextInput } from './styling/PagesStyling';

export default function Projects({ formData, onFormDataChange }) {
    const {
        projectOne,
        projectTwo,
        projectThree,
        projectOneLink,
        projectTwoLink,
        projectThreeLink,
    } = formData;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFormDataChange({
            ...formData,
            [name]: value,
        });
    };

    return (
        <div>
            <StyledLabelGroup>PROJECT 1</StyledLabelGroup>
            <StyledLabel>LINK*</StyledLabel>
            <StyledLinkInput
                type="text"
                name="projectOneLink"
                placeholder={'https://'}
                value={projectOneLink}
                onChange={handleInputChange}
            />
            <StyledLabel>DESCRIPTION*</StyledLabel>
            <StyledTextInput
                type="text"
                name="projectOne"
                placeholder={'Write a sentence or two...'}
                value={projectOne}
                onChange={handleInputChange}
            />
            <StyledLabelGroup>PROJECT 2</StyledLabelGroup>
            <StyledLabel>LINK</StyledLabel>
            <StyledLinkInput
                type="text"
                name="projectTwoLink"
                placeholder={'https://'}
                value={projectTwoLink}
                onChange={handleInputChange}
            />
            <StyledLabel>DESCRIPTION</StyledLabel>
            <StyledTextInput
                type="text"
                name="projectTwo"
                placeholder={'Write a sentence or two...'}
                value={projectTwo}
                onChange={handleInputChange}
            />
            <StyledLabelGroup>PROJECT 3</StyledLabelGroup>
            <StyledLabel>LINK</StyledLabel>
            <StyledLinkInput
                type="text"
                name="projectThreeLink"
                placeholder={'https://'}
                value={projectThreeLink}
                onChange={handleInputChange}
            />
            <StyledLabel>DESCRIPTION</StyledLabel>
            <StyledTextInput
                type="text"
                name="projectThree"
                placeholder={'Write a sentence or two...'}
                value={projectThree}
                onChange={handleInputChange}
            />
        </div>
    );
}
