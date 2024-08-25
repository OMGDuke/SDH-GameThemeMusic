import { DialogButton, Focusable } from '@decky/ui'
import React from 'react'
import useTranslations from '../../hooks/useTranslations'

import { FaCheck, FaVolumeMute } from 'react-icons/fa'

export default function NoMusic({
  selected,
  selectNewAudio
}: {
  selected: boolean
  selectNewAudio: (audio: {
    title: string
    videoId: string
    audioUrl: string
  }) => void
}) {
  const t = useTranslations()
  return (
    <div>
      <Focusable
        style={{
          background: 'var(--main-editor-bg-color)',
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
            color: 'var(--main-editor-text-color)',
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
          <div style={{ position: 'relative' }}>
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
            {selected ? (
              <div
                style={{
                  height: '20px',
                  width: '20px',
                  position: 'absolute',
                  bottom: '-6px',
                  right: '-6px',
                  background: '#59bf40',
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaCheck />
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      </Focusable>
    </div>
  )
}
