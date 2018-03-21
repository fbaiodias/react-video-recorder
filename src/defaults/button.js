import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 4px;
  padding: 10px 18px;
  border: none;
  margin: 5px;
  font-size: 18px;
  font-weight: bold;
  outline: none;
  cursor: pointer;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default Button
