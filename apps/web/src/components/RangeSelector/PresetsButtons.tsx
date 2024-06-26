import { ButtonOutlined } from 'components/Button'
import { AutoRow } from 'components/Row'
import { Trans } from 'i18n'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'

const Button = styled(ButtonOutlined).attrs(() => ({
  padding: '6px',
  $borderRadius: '8px',
  background: '#9657eb47',
}))`
  color: ${({ theme }) => theme.neutral1};
  flex: 1;
  
`

interface PresetsButtonsProps {
  onSetFullRange: () => void
}

export default function PresetsButtons({ onSetFullRange }: PresetsButtonsProps) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button data-testid="set-full-range" onClick={onSetFullRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Full range</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
    </AutoRow>
  )
}
