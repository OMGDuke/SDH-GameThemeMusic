import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField
} from 'decky-frontend-lib'
import React from 'react'
import { useSettings } from '../../context/settingsContext'
import useTranslations from '../../hooks/useTranslations'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { clearCache } from '../../cache/musicCache'

export default function Index() {
  const { state: settingsState, dispatch: settingsDispatch } = useSettings()
  const t = useTranslations()

  return (
    <div>
      <PanelSection title={t('settings')}>
        <PanelSectionRow>
          <SliderField
            label={t('volume')}
            description={t('volumeDescription')}
            value={settingsState.volume * 100}
            onChange={(newVal: number) => {
              settingsDispatch({
                type: 'set-volume',
                value: newVal / 100
              })
            }}
            min={0}
            max={100}
            step={1}
            icon={<FaVolumeUp />}
            editableValue
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            icon={<FaVolumeMute />}
            checked={settingsState.defaultMuted}
            label={t('defaultMuted')}
            description={t('defaultMutedDescription')}
            onChange={(newVal: boolean) => {
              settingsDispatch({
                type: 'set-default-muted',
                value: newVal
              })
            }}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t('overrides')}>
        <PanelSectionRow>
          <ButtonItem
            label={t('deleteOverridesLabel')}
            bottomSeparator="none"
            layout="below"
            onClick={() => clearCache()}
          >
            {t('deleteOverrides')}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  )
}
