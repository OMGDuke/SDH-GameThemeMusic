import { call, fetchNoCors } from '@decky/api'
import YouTubeVideo from '../../types/YouTube'
import { Settings, defaultSettings } from '../hooks/useSettings'

type YouTubeInitialData = {
  title: string
  url: string
  thumbnail: string
}[]

async function getEndpoint() {
  const savedSettings = await call<[string, Settings], Settings>('get_setting', 'settings', defaultSettings)
  return savedSettings.pipedInstance
}

export async function getYouTubeSearchResults(
  appName: string,
  customSearch?: boolean
): Promise<YouTubeVideo[] | undefined> {
  try {
    const searchTerm = `${encodeURIComponent(appName)}${customSearch ? '' : '%20Theme%20Music'}`
    const endpoint = await getEndpoint()
    const res = await fetch(`${endpoint}/search?q=${searchTerm}&filter=all`)
    if (res.status === 200) {
      const result: { items: YouTubeInitialData } = await res.json()
      if (result.items.length) {
        const regex = /\/watch\?v=([A-Za-z0-9_-]+)/
        return result.items
          .map((res) => ({
            title: res.title,
            id: res.url.match(regex)?.[1] || '',
            thumbnail: res.thumbnail || 'https://i.ytimg.com/vi/0.jpg'
          }))
          .filter((res) => res.id.length)
      }
    }
  } catch (err) {
    console.debug(err)
  }
  return undefined
}

type Audio = {
  mimeType: string
  url: string
  bitrate: number
}

export async function getAudioUrlFromVideoId(
  video: { title: string; id: string }
): Promise<string | undefined> {
  try {
    const endpoint = await getEndpoint()
    const res = await fetch(`${endpoint}/streams/${encodeURIComponent(video.id)}`)
    if (res.status === 200) {
      const audioFormats: { audioStreams: Audio[] } = await res.json()

      const audios = audioFormats.audioStreams.filter((aud) =>
        aud.mimeType?.includes('audio/webm')
      )
      const audio = audios.reduce((prev, current) => {
        return prev.bitrate > current.bitrate ? prev : current
      }, audios[0])

      return audio?.url
    }
  } catch (err) {
    console.debug(err)
  }
  return undefined
}

export async function getAudio(
  appName: string
): Promise<{ videoId: string; audioUrl: string } | undefined> {
  const videos = await getYouTubeSearchResults(appName)
  if (videos?.length) {
    let audio: { videoId: string; audioUrl: string } | undefined
    let i
    for (i = 0; i < videos.length; i++) {
      const audioUrl = await getAudioUrlFromVideoId(videos[i])
      if (audioUrl?.length) {
        audio = { audioUrl, videoId: videos[i].id }
        break
      }
    }
    return audio
  }
  return undefined
}

export async function getPipedInstances(): Promise<{ name: string; url: string }[]> {
  try {
    const res = await fetchNoCors('https://piped-instances.kavin.rocks/')
    if (res.status === 200) {
      const instances: {
        api_url: string
        cache: boolean
        cdn: boolean
        image_proxy_url: string
        last_checked: number
        locations: string
        name: string
        registered: number
        registration_disabled: boolean
        s3_enabled: boolean
        up_to_date: boolean
        uptime_24h: number
        uptime_7d: number
        uptime_30d: number
        version: string
      }[] = await res.json()

      if (instances?.length) {
        return instances
          .sort((a, b) => b.uptime_30d - a.uptime_30d)
          .map((ins) => ({
            name: `${ins.locations} ${ins.name || ins.api_url} ${ins.uptime_30d ? `| Uptime: ${Math.floor(ins.uptime_30d)}%` : ''}`,
            url: ins.api_url
          }))
      }
    }
  } catch (err) {
    console.debug(err)
  }
  return []
}
