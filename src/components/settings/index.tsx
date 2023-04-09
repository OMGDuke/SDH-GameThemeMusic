import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  SliderField,
  ToggleField
} from 'decky-frontend-lib'
import React, { useEffect, useState } from 'react'
import { useSettings } from '../../context/settingsContext'
import useTranslations from '../../hooks/useTranslations'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { clearCache } from '../../cache/musicCache'
import { getInvidiousInstances } from '../../actions/audio'

export default function Index({ serverAPI }: { serverAPI: ServerAPI }) {
  const { state: settingsState, dispatch: settingsDispatch } = useSettings()
  const t = useTranslations()

  const [invidOptions, setInvidOptions] = useState<
    {
      data: number
      label: string
      value: string
    }[]
  >([])

  const [invidLoading, setInvidLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      setInvidLoading(true)
      const instances = await getInvidiousInstances(serverAPI)
      setInvidOptions(
        instances.map((ins, idx) => ({
          data: idx,
          label: ins.name,
          value: ins.url
        }))
      )
      setInvidLoading(false)
    }
    getData()
  }, [])

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
        <PanelSectionRow>
          <DropdownItem
            disabled={invidLoading || !invidOptions?.length}
            label={t('invidiousInstance')}
            description={t('invidiousInstanceDescription')}
            menuLabel={t('invidiousInstance')}
            rgOptions={invidOptions}
            selectedOption={
              invidOptions.find(
                (o) => o.value === settingsState.invidiousInstance
              )?.data || 0
            }
            onChange={(newVal: { data: number; label: string }) => {
              const newInstance = invidOptions.find(
                (o) => o.data === newVal.data
              )?.value
              settingsDispatch({
                type: 'set-invidious-instance',
                value: newInstance as string
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
