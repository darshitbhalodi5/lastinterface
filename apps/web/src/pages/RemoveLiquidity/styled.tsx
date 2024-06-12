import { MaxButton } from 'pages/Pool/styled'
import { Text } from 'rebass'
import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
  min-width: 460px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    min-width: 340px;
  `};
`

export const SmallMaxButton = styled(MaxButton)`
  font-size: 12px;
  background-color: rgb(33, 30, 43);
  border: 1px solid rgb(255, 255, 255);
:hover{
  border: 1px solid rgb(150, 87, 235);
  color: rgb(150, 87, 235);
}
&:active{
  border: 1px solid rgb(150, 87, 235);
  color: rgb(150, 87, 235);
}
`

export const ResponsiveHeaderText = styled(Text)`
  font-size: 40px;
  font-weight: 535;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
     font-size: 24px
  `};
`
