import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 4px;
  width: 50px;
  height: 50px;
  background: rgba(227, 73, 28, 0.8);
  outline: none;
  border: none;
  cursor: pointer;
  margin: 25px !important;

  :hover {
    background: #fb6d42;
  }
`

const Border = styled.div`
  background: rgba(255, 255, 255, 0.4);
  height: 100px;
  width: 100px;
  border-radius: 50%;
  position: absolute;
  top: 25px;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default props => (
  <Border>
    <Button {...props} />
  </Border>
)
