import React from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import styled from 'styled-components'

const Button = styled.button<{ color?: string, backgroundColor?: string }>`
  background: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background: rgba(227, 73, 28, 0.8);
  outline: none;
  border: none;
  cursor: pointer;
  margin: 20px;

  :hover {
    background: #fb6d42;
  }
`

const Border = styled.div`
  background: rgba(255, 255, 255, 0.4);
  height: 80px;
  width: 80px;
  border-radius: 50%;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

// Anonymous on purpose for now: naming it changes the published code.
// eslint-disable-next-line react/display-name
export default (props: ComponentPropsWithoutRef<'button'>) => (
  <Border>
    <Button {...props} />
  </Border>
)
