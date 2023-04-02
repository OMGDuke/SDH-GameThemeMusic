import {
  PanelSection,
  PanelSectionProps,
  PanelSectionRow,
  SliderField
} from 'decky-frontend-lib'
import React, { FC, ReactNode } from 'react'
import { useSettings } from '../../context/settingsContext'
import useTranslations from '../../hooks/useTranslations'
import { FaVolumeUp } from 'react-icons/fa'

type ExtendedPanelSectionProps = PanelSectionProps & {
  children: ReactNode
}

const DeckPanelSection = PanelSection as FC<ExtendedPanelSectionProps>

type PanelSectionRowProps = {
  children: ReactNode
}

const DeckPanelSectionRow = PanelSectionRow as FC<PanelSectionRowProps>

export default function Index() {
  const { state: settingsState, dispatch: settingsDispatch } = useSettings()
  const t = useTranslations()

  return (
    <div>
      <DeckPanelSection title={t('settings')}>
        <DeckPanelSectionRow>
          <SliderField
            label={t('volume')}
            description={t('volumeDescription')}
            value={settingsState.volume}
            onChange={(newVal: number) => {
              settingsDispatch({
                type: 'set-volume',
                value: newVal
              })
            }}
            min={0}
            max={1}
            step={0.01}
            icon={<FaVolumeUp />}
          />
        </DeckPanelSectionRow>
      </DeckPanelSection>
    </div>
  )
}
