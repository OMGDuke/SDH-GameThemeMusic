import {
  ButtonItem,
  ConfirmModal,
  DropdownItem,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  showContextMenu,
  showModal,
  SimpleModal,
  SingleDropdownOption,
  SliderField,
  ToggleField
} from '@decky/ui'
import React, { useMemo } from 'react'
import { useSettings } from '../../hooks/useSettings'
import useTranslations from '../../hooks/useTranslations'
import { FaDownload, FaUndo, FaSave, FaVolumeMute, FaVolumeUp, FaYoutube } from 'react-icons/fa'
import { clearCache, clearDownloads, exportCache, importCache, listCacheBackups } from '../../cache/musicCache'
import useInvidiousInstances from '../../hooks/useInvidiousInstances'
import { toaster } from '@decky/api'

export default function Index() {
  const {
    settings,
    isLoading: settingsIsLoading,
    setDefaultMuted,
    setUseYtDlp,
    setDownloadAudio,
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

  const confirmClearCache = () => {
    showModal(
      <ConfirmModal
        strTitle={t('deleteOverridesConfirm')}
        strDescription={t('deleteOverridesDescription')}
        onOK={clearCache}
      />
    );
  }

  const confirmClearDownloads = () => {
    showModal(
      <ConfirmModal
        strTitle={t('deleteDownloadsConfirm')}
        onOK={clearDownloads}
      />
    );
  }

  function restoreCache(backup: string) {
    showModal(
      <ConfirmModal
        strTitle={t('restoreOverridesConfirm')}
        strDescription={t('restoreOverridesConfirmDetails')}
        onOK={async () => {
          await importCache(backup)
          toaster.toast({ title: t('restoreSuccessful'), body: t('restoreSuccessfulDetails'), icon: <FaUndo />, duration: 1500 })
        }}
      />
    )
  }

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
        </PanelSectionRow>}
        {settings.useYtDlp && <PanelSectionRow>
          <ToggleField
            icon={<FaDownload />}
            checked={settings.downloadAudio}
            label={t('downloadAudio')}
            description={t('downloadAudioDescription')}
            onChange={(newVal: boolean) => {
              setDownloadAudio(newVal)
            }}
          >
          </ToggleField>
        </PanelSectionRow>}
        <PanelSectionRow>
          <ButtonItem
            label={t('deleteDownloadsLabel')}
            description={t('deleteDownloadsDescription')}
            bottomSeparator="none"
            layout="below"
            onClick={() => confirmClearDownloads()}
          >
            {t('deleteDownloads')}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t('overrides')}>
        <PanelSectionRow>
          <ButtonItem
            label={t('deleteOverridesLabel')}
            bottomSeparator="none"
            layout="below"
            onClick={() => confirmClearCache()}
          >
            {t('deleteOverrides')}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label={t('backupOverridesLabel')}
            bottomSeparator="none"
            layout="below"
            onClick={async () => {
              await exportCache()
              toaster.toast({ title: t('backupSuccessful'), body: t('backupSuccessfulDetails'), icon: <FaSave />, duration: 1500 })
            }}
          >
            {t('backupOverrides')}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label={t('restoreOverridesLabel')}
            bottomSeparator="none"
            layout="below"
            onClick={async () => {
              const backups = await listCacheBackups();
              showContextMenu(
                <Menu
                  label={t('restoreOverridesLabel')}
                >
                  {backups.map((backup) => (
                    <MenuItem tone='positive' onClick={() => restoreCache(backup)}>
                      {backup}
                    </MenuItem>
                  ))}
                </Menu>
              )
            }}
          >
            {t('restoreOverrides')}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div >
  )
}
