import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  SingleDropdownOption,
  SliderField,
  ToggleField
} from 'decky-frontend-lib'
import React, { useMemo } from 'react'
import { useSettings } from '../../hooks/useSettings'
import useTranslations from '../../hooks/useTranslations'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { clearCache } from '../../cache/musicCache'
import usePipedInstances from '../../hooks/usePipedInstances'

type Props = {
  serverAPI: ServerAPI
}

export default function Index({ serverAPI }: Props) {
  const {
    settings,
    isLoading: settingsIsLoading,
    setDefaultMuted,
    setPipedInstance,
    setVolume
  } = useSettings(serverAPI)

  const t = useTranslations()

  const { instances, instancesLoading } = usePipedInstances(serverAPI)

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
          <DropdownItem
            disabled={
              instancesLoading || !instanceOptions?.length || settingsIsLoading
            }
            label={t('pipedInstance')}
            description={t('pipedInstanceDescription')}
            menuLabel={t('pipedInstance')}
            rgOptions={instanceOptions}
            selectedOption={
              instanceOptions.find((o) => o.data === settings.pipedInstance)
                ?.data
            }
            onChange={(newVal) => setPipedInstance(newVal.data)}
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
