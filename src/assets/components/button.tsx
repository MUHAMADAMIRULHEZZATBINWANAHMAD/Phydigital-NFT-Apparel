import React from 'react';
import styled from 'styled-components';

// Define the interface for TypeScript props
interface ButtonProps {
  label: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick}>
        {label} {/* Dynamically renders the text you pass in */}
        <svg className="svgIcon" viewBox="0 0 576 512">
          <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .Btn {
    width: 160px; /* Slightly widened to gracefully fit "FORGE ASSETS" */
    height: 48px;  /* Slightly taller for that heavy luxury padding feel */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(15, 15, 15);
    border: 1px solid #222; /* Keeps the premium clean border look */
    color: white;
    font-weight: 900; /* Set to 900 to match your editorial aesthetic */
    letter-spacing: 1px;
    text-transform: uppercase;
    gap: 8px;
    cursor: pointer;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.103);
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
  }

  .svgIcon {
    width: 14px;
  }

  .svgIcon path {
    fill: white;
  }

  .Btn::before {
    width: 160px;
    height: 160px;
    position: absolute;
    content: "";
    background-color: #f8df00; /* Replaced white with your signature Sunday Gold! */
    border-radius: 50%;
    left: -100%;
    top: 0;
    transition-duration: .3s;
    mix-blend-mode: difference;
  }

  .Btn:hover::before {
    transition-duration: .3s;
    transform: translate(100%,-50%);
    border-radius: 0;
  }

  .Btn:active {
    transform: translate(2px,2px);
    transition-duration: .3s;
  }
`;

export default Button;