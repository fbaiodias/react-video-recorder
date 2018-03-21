import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 6px;
  margin: 5px;
  width: 54px;
  height: 54px;
  background: #e55226;
  border: 6px solid white;
  outline: none;
  cursor: pointer;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default Button
