import React from 'react'
import useTranslations from '../../hooks/useTranslations'

export default function AboutPage() {
  const t = useTranslations()
  return (
    <div>
      <h1>{t('aboutLabel')}</h1>
      <p>{t('aboutDescription')}</p>
      <h2>{t('supportLabel')}</h2>
      <p>{t('supportDescription')}</p>
    </div>
  )
}
