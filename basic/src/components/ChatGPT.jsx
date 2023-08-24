import React, { useState } from 'react';
import styled from 'styled-components';
import PersonalBio from './pages/PersonalBio';
import Projects from './pages/Projects';
import Socials from './pages/Socials';
import { useMultistepForm } from './useMultistepForm';
import GeneratedWebsite from './pages/GeneratedWebsite';
import ThemePicker from './pages/ThemePicker'

export default function ChatGPT() {
  const [formData, setFormData] = useState({
    personalBio: '',
    projectOne: '',
    projectOneLink: '',
    projectTwo: '',
    projectTwoLink: '',
    projectThree: '',
    projectThreeLink: '',
    gitHub: '',
    linkedIn: '',
    email: '',
  });

  const handleFormDataChange = (updatedData) => {
    setFormData((prevFormData) => ({ ...prevFormData, ...updatedData }));
  };

  const handleThemePicked = (themeId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      selectedTheme: themeId,
    }));
  };

  const xmlFileName = 'alexaslifewordpress.xml';
  const xmlFileURL = process.env.PUBLIC_URL + '/' + xmlFileName;
  const downloadIconName = 'download-icon.png';
  const downloadIconURL = process.env.PUBLIC_URL + '/' + downloadIconName;

  function onSubmit(e) {
    e.preventDefault();
    if (!isLastStep) return next();
    setShowGeneratedWebsite(true);
  };

  const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } = useMultistepForm([<PersonalBio formData={formData} onFormDataChange={handleFormDataChange} />,
  <Projects formData={formData} onFormDataChange={handleFormDataChange} />,
  <Socials formData={formData} onFormDataChange={handleFormDataChange} />]);

  const [showGeneratedWebsite, setShowGeneratedWebsite] = useState(false);

  return (
    <StyledContainer>
      {!showGeneratedWebsite ? (
        <div>
          {formData.selectedTheme ? (
            <div>
              <Title>Portfolio Content</Title>
              <StyledForm onSubmit={onSubmit}>
                {step}
                <StyledButtonContainer>
                  <StyledButton
                    type='button'
                    onClick={back}
                  >
                    Back
                  </StyledButton>
                  <StyledButton
                    type='submit'
                    disabled={
                      (currentStepIndex === 0 && !formData.personalBio) ||
                      (currentStepIndex === 1 && !(formData.projectOne && formData.projectOneLink)) ||
                      (currentStepIndex === 2 && !(formData.gitHub && formData.linkedIn && formData.email))
                    }
                  >
                    {!isLastStep ? 'Continue' : 'Generate Website'}
                  </StyledButton>
                </StyledButtonContainer>
              </StyledForm>
            </div>
          ) : (
            <div>
              <Title>Choose a Theme</Title>
              <ThemePicker
                formData={formData}
                handleThemePicked={handleThemePicked}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <Title>Website Data</Title>
          <StyledButton>
            <StyledLink href={xmlFileURL} download={xmlFileName}>
              Download Website Data
            </StyledLink>
            <DownloadIcon src={downloadIconURL} alt='Download Icon' />
          </StyledButton>
          <GeneratedWebsite />
        </div>
      )}
    </StyledContainer>
  );
}

export const DownloadIcon = styled.img`
  margin-left: 10px;
  width: 30px;
  height: 30px;
`;

export const StyledLink = styled.a`
  text-decoration: none;
  color: inherit;
`
export const StyledForm = styled.form`
  margin-bottom: 20px;
`;

export const Title = styled.div`
  padding-top: 1em;
  padding-bottom: 1em;
  display: flex;
  font-size: 40px;
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 50vh;
  padding-left: 350px;
  padding-right: 350px;
`;

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  background-color: black;
  color: white;
  padding: 15px 25px;
  margin-top: 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  text-align: center;
  font-size: 18px;
  &:disabled {
    opacity: 0.5;
  }
  &:enabled {
    opacity: 1.0;
  }
  opacity: ${props => !props.enabled ? 0.5 : 1};
`;

export const StyledAlert = styled.div`
  padding: 10px;
  background-color: #f44336;
  color: white;
  margin-top: 10px;
  border-radius: 5px;
`;
