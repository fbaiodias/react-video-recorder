import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 50%;
  width: 64px;
  height: 64px;
  background: #e55226;
  outline: none;
  border: none;
  cursor: pointer;

  :hover {
    background: #fb6d42;
  }
`

const DivBorder = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.4);
  height: 80px;
  width: 80px;
  border-radius: 50%;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default props => (
  <DivBorder>
    <Button {...props} />
  </DivBorder>
)
