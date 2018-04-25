import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 50%;
  width: 64px;
  height: 64px;
  background: rgba(227, 73, 28, 0.8);
  outline: none;
  border: none;
  cursor: pointer;

  :hover {
    background: #fb6d42;
  }
`

const RecWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ButtonBorder = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.4);
  height: 80px;
  width: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
`
const Instructions = styled.div`
  font-family: Arial;
  font-size: 14px;
  color: #ffffff;
  letter-spacing: 1.75px;
  display: flex;
`

const InstuctionsHighlight = styled.div`
  font-weight: 700;
  color: #dc6547;
  padding: 0 5px;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default props => (
  <RecWrapper>
    <ButtonBorder>
      <Button {...props} />
    </ButtonBorder>

    <Instructions>
      <div>PRESS </div>
      <InstuctionsHighlight> REC </InstuctionsHighlight>
      WHEN READY
    </Instructions>
  </RecWrapper>
)
