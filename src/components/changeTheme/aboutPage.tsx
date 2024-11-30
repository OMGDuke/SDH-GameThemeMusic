import { PanelSection } from '@decky/ui'
import useTranslations from '../../hooks/useTranslations'
import PanelSocialButton from '../settings/socialButton'
import { SiCrowdin, SiDiscord, SiGithub, SiKofi } from 'react-icons/si'

export default function AboutPage() {
  const t = useTranslations()
  return (
    <div>
      <h1>{t('aboutLabel')}</h1>
      <p>{t('aboutDescription')}</p>
      <h2>{t('extras')}</h2>
      <PanelSection>
        <PanelSocialButton icon={<SiKofi fill="#FF5E5B" />} url="https://ko-fi.com/OMGDuke">Ko-fi</PanelSocialButton>
        <PanelSocialButton icon={<SiDiscord fill="#5865F2" />} url="https://deckbrew.xyz/discord">Discord</PanelSocialButton>
        <PanelSocialButton icon={<SiGithub fill="#f5f5f5" />} url="https://github.com/OMGDuke/SDH-GameThemeMusic/">Github</PanelSocialButton>
        <PanelSocialButton icon={<SiCrowdin fill="#FFFFFF" />} url="https://crowdin.com/project/sdh-gamethememusic">{t('helpTranslate')}</PanelSocialButton>
      </PanelSection>

    </div>
  )
}
