import styled from 'styled-components'

const Button = styled.button`
  background: ${props => props.backgroundColor};
  color: ${props => props.color};
  border-radius: 3px;
  padding: 10px;
  border: none;
  margin: 5px;
`

Button.defaultProps = {
  color: 'black',
  backgroundColor: 'white'
}

export default Button
