import { DialogButton, Focusable } from 'decky-frontend-lib'
import React from 'react'
import useTranslations from '../../hooks/useTranslations'

import { FaVolumeMute } from 'react-icons/fa'

export default function NoMusic({
  selected,
  selectNewAudio
}: {
  selected: boolean
  selectNewAudio: (audio: {
    title: string
    videoId: string | undefined
    audioUrl: string
  }) => void
}) {
  const t = useTranslations()
  return (
    <div>
      <Focusable
        style={{
          background: selected
            ? 'var(--main-light-blue-background)'
            : 'var(--main-editor-bg-color)',
          borderRadius: '6px',
          display: 'grid',
          gridTemplateRows: '129px max-content max-content',
          overflow: 'hidden',
          padding: '10px',
          width: '230px'
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            width: '230px',
            height: '129px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <FaVolumeMute size="md" />
        </div>
        <p
          style={{
            color: selected
              ? 'var(--main-editor-bg-color)'
              : 'var(--main-editor-text-color)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '230px',
            height: '68px'
          }}
        >
          {t('noMusicLabel')}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '230px'
          }}
        >
          <DialogButton disabled={true} focusable={false}>
            {t('play')}
          </DialogButton>
          <DialogButton
            disabled={selected}
            focusable={!selected}
            onClick={() =>
              selectNewAudio({
                title: '',
                videoId: '',
                audioUrl: ''
              })
            }
          >
            {selected ? t('selected') : t('select')}
          </DialogButton>
        </div>
      </Focusable>
    </div>
  )
}
