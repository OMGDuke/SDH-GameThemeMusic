import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  SingleDropdownOption,
  SliderField,
  ToggleField
} from '@decky/ui'
import React, { useMemo } from 'react'
import { useSettings } from '../../hooks/useSettings'
import useTranslations from '../../hooks/useTranslations'
import { FaDownload, FaVolumeMute, FaVolumeUp, FaYoutube } from 'react-icons/fa'
import { clearCache } from '../../cache/musicCache'
import useInvidiousInstances from '../../hooks/useInvidiousInstances'

export default function Index() {
  const {
    settings,
    isLoading: settingsIsLoading,
    setDefaultMuted,
    setUseYtDlp,
    setInvidiousInstance,
    setVolume
  } = useSettings()

  const t = useTranslations()

  const { instances, instancesLoading } = useInvidiousInstances()
  console.log(instances)

  const instanceOptions = useMemo<SingleDropdownOption[]>(
    () =>
      instances.map((ins) => ({
        data: ins.url,
        label: ins.name
      })),
    [instances]
  )

  return (
    <div>
      <PanelSection title={t('settings')}>
        <PanelSectionRow>
          <SliderField
            label={t('volume')}
            description={t('volumeDescription')}
            value={settings.volume * 100}
            onChange={(newVal: number) => {
              setVolume(newVal / 100)
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
            checked={settings.defaultMuted}
            label={t('defaultMuted')}
            description={t('defaultMutedDescription')}
            onChange={(newVal: boolean) => {
              setDefaultMuted(newVal)
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            icon={<FaYoutube />}
            checked={settings.useYtDlp}
            label={t('useYtDlp')}
            description={t('useYtDlpDescription')}
            onChange={(newVal: boolean) => {
              setUseYtDlp(newVal)
            }}
          />
        </PanelSectionRow>
        {!settings.useYtDlp && <PanelSectionRow>
          <DropdownItem
            disabled={
              instancesLoading || !instanceOptions?.length || settingsIsLoading
            }
            label={t('invidiousInstance')}
            description={t('invidiousInstanceDescription')}
            menuLabel={t('invidiousInstance')}
            rgOptions={instanceOptions}
            selectedOption={
              instanceOptions.find((o) => o.data === settings.invidiousInstance)
                ?.data
            }
            onChange={(newVal) => setInvidiousInstance(newVal.data)}
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
