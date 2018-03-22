import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 50%;
  width: 44px;
  height: 44px;
  background: #e55226;
  outline: none;
  border: none;
  cursor: pointer;
`

const DivBorder = styled.div`
  border: 6px solid rgba(255, 255, 255, 0.4);
  height: 56px;
  width: 56px;
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
