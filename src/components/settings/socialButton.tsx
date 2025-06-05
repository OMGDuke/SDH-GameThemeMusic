import {
  PanelSectionRow,
  DialogButton,
  Field,
  Focusable,
  Navigation
} from '@decky/ui'
import { FC, ReactNode } from 'react'
import { HiQrCode } from 'react-icons/hi2'
import useTranslations from '../../hooks/useTranslations'

import showQrModal from './showQrModal'

const navLink = (url: string) => {
  Navigation.CloseSideMenus()
  Navigation.NavigateToExternalWeb(url)
}

const PanelSocialButton: FC<{
  icon: ReactNode
  url: string
  children: string
}> = ({ icon, children, url }) => {
  const t = useTranslations()
  return (
    <PanelSectionRow>
      <Field
        bottomSeparator="none"
        icon={null}
        label={null}
        childrenLayout={undefined}
        inlineWrap="keep-inline"
        padding="none"
        spacingBetweenLabelAndChild="none"
        childrenContainerWidth="max"
      >
        <Focusable style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '1.5em',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '.5em'
            }}
          >
            {icon}
          </div>
          <DialogButton
            onClick={() => navLink(url)}
            onSecondaryButton={() => showQrModal(url)}
            onSecondaryActionDescription={t('showQrCode')}
            style={{
              padding: '10px',
              fontSize: '14px'
            }}
          >
            {children}
          </DialogButton>
          <DialogButton
            onOKActionDescription={t('showQrCode')}
            onClick={() => showQrModal(url)}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              maxWidth: '40px',
              minWidth: 'auto',
              marginLeft: '.5em'
            }}
          >
            <HiQrCode />
          </DialogButton>
        </Focusable>
      </Field>
    </PanelSectionRow>
  )
}

export default PanelSocialButton
