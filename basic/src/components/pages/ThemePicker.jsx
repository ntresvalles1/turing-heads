// ThemePicker.jsx
import React from 'react';
import styled from 'styled-components';

export default function ThemePicker({ formData, handleThemePicked }) {
    const themes = [
        { id: 'TwentyTwentyTwo', imageSrc: 'https://i0.wp.com/themes.svn.wordpress.org/twentytwentytwo/1.4/screenshot.png?w=1144&strip=all' },
        { id: 'Otis', imageSrc: 'https://i0.wp.com/theme.files.wordpress.com/2023/06/otis_featured_image.png?ssl=1&w=735' },
        { id: 'Archivo', imageSrc: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/archivo/screenshot.png?fit=479%2C360' },
        { id: 'Covr', imageSrc: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/covr/screenshot.png?fit=479%2C360' },
        { id: 'Kigen', imageSrc: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/kigen/screenshot.png?fit=479%2C360' },
        { id: 'Common', imageSrc: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/common/screenshot.png?fit=479%2C360' },
    ];

    return (
        <GridContainer>
            {themes.map(theme => (
                <StyledThemeItem
                    key={theme.id}
                    onClick={() => handleThemePicked(theme.id)}
                    selected={formData.selectedTheme === theme.id}
                >
                    <StyledThemeImage src={theme.imageSrc} alt={`Theme ${theme.id}`} />
                    <StyledText>
                        <StyledTitle>
                            <StyledDescription>{theme.id}</StyledDescription>
                            <StyledDescriptionTwo>FREE</StyledDescriptionTwo>
                        </StyledTitle>
                    </StyledText>
                </StyledThemeItem>
            ))}
        </GridContainer>
    );
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Adjust the number of columns as needed */
  gap: 60px;
`;

const StyledThemeItem = styled.div`
  cursor: pointer;
  border: 2px solid ${({ selected }) => (selected ? 'blue' : 'transparent')};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StyledThemeImage = styled.img`
  object-fit: cover;
  height: 193px;
  border-radius: 11px;
  align-self: stretch;
`;

const StyledText = styled.div`
  display: flex;
  height: 28.8px;
  align-self: stretch;
  position: relative;
`;

const StyledTitle = styled.div`
    width: 100%;
  display: flex;
  justify-content: space-between;
  position: absolute;
  left: 0;
  top: 0;
`;

const StyledDescription = styled.p`
  font-family: "ABeeZee";
  font-size: 19px;
  font-weight: 400;
  line-height: 29px;
  color: 'black';
  text-align: right;
`;

const StyledDescriptionTwo = styled.p`
  font-family: "ABeeZee";
  font-size: 16px;
  font-weight: 400;
  line-height: 29px;
  color: 'rgba(108,111,117,1)';
`;

