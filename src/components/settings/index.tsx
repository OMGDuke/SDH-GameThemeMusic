import {
  ButtonItem,
  ConfirmModal,
  DropdownItem,
  Menu,
  MenuItem,
  ModalRoot,
  ModalRootProps,
  PanelSection,
  PanelSectionRow,
  ProgressBar,
  ProgressBarWithInfo,
  showContextMenu,
  showModal,
  ShowModalResult,
  SimpleModal,
  SingleDropdownOption,
  SliderField,
  ToggleField
} from '@decky/ui'
import React, { useMemo, useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import useTranslations from '../../hooks/useTranslations'
import { FaDownload, FaUndo, FaSave, FaVolumeMute, FaVolumeUp, FaYoutube } from 'react-icons/fa'
import { clearCache, clearDownloads, exportCache, getCache, getFullCache, importCache, listCacheBackups } from '../../cache/musicCache'
import useInvidiousInstances from '../../hooks/useInvidiousInstances'
import { toaster } from '@decky/api'
import { getResolver } from '../../actions/audio'

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

  const confirmRestoreDownloads = async () => {
    const num = Object.values(await getFullCache()).length;
    const modal = showModal(
      <ConfirmModal
        strTitle={t('restoreDownloadsConfirm')}
        strDescription={t('restoreDownloadsConfirmDescription', { num })}
        onOK={() => restoreDownloads(modal)}
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

  async function restoreDownloads(modal: ShowModalResult) {

    function getProgressModal(index: number, total: number) {
      const current = index + 1;
      const progress = current * 100 / total;
      return <ConfirmModal bHideCloseIcon={true} bOKDisabled={true}
        onCancel={modal.Close}
        strCancelButtonText={t('close')}
        strTitle={
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            {t('restoreDownloadsOperationTitle')}
            <div style={{ marginLeft: 'auto' }}>
              <ProgressBarWithInfo nProgress={progress} sOperationText={t('restoreDownloadsOperation', { current, total })} />
            </div>
          </div>
        }>
      </ConfirmModal>
    }

    const cached = Object.values(await getFullCache());
    const resolver = getResolver(settings.useYtDlp);

    for (let index = 0; index < cached.length; index++) {
      const element = cached[index];
      if (element.videoId !== undefined) {
        modal.Update(getProgressModal(index, cached.length));
        await resolver.downloadAudio({ id: element.videoId });
      }
    }
    modal.Close();
    toaster.toast({ title: t('downloadRestoreSuccessful'), body: t('downloadRestoreSuccessfulDetails'), icon: <FaDownload />, duration: 1500 })
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
        <PanelSectionRow>
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
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label={t('deleteDownloadsLabel')}
            description={t('deleteDownloadsDescription')}
            layout="below"
            onClick={() => confirmClearDownloads()}
          >
            {t('deleteDownloads')}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label={t('restoreDownloadsLabel')}
            description={t('restoreDownloadsDescription')}
            bottomSeparator="none"
            layout="below"
            onClick={() => confirmRestoreDownloads()}
          >
            {t('restoreDownloads')}
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
