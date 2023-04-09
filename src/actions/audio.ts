import { ServerAPI } from 'decky-frontend-lib'
import YouTubeVideo from '../../types/YouTube'

type YouTubeInitialData = {
  contents: {
    twoColumnSearchResultsRenderer: {
      primaryContents: {
        sectionListRenderer: {
          contents: {
            itemSectionRenderer: {
              contents: {
                videoRenderer: {
                  title: { runs: { text: string }[] }
                  videoId: string
                  thumbnail: {
                    thumbnails: { url: string }[]
                  }
                }
              }[]
            }
          }[]
        }
      }
    }
  }
}

export async function getYouTubeSearchResults(
  serverAPI: ServerAPI,
  appName: string,
  customSearch?: boolean
): Promise<YouTubeVideo[] | undefined> {
  const searchTerm = `${encodeURIComponent(appName)}${
    customSearch ? '' : '%20Game%20Theme%20Music'
  }`
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/results?search_query=${searchTerm}&sp=EgIQAQ%253D%253D`,
    timeout: 8000
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const regex = /ytInitialData\s*=\s*({.*?});/
    const match = res.result.body.match(regex)

    if (match) {
      const ytInitialData: YouTubeInitialData = JSON.parse(match[1])
      const results: YouTubeVideo[] | undefined =
        ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents
          ?.find(
            (obj) =>
              Object.prototype.hasOwnProperty.call(
                obj,
                'itemSectionRenderer'
              ) &&
              obj?.itemSectionRenderer?.contents?.[0] &&
              obj?.itemSectionRenderer?.contents?.filter((vidObj) =>
                Object.prototype.hasOwnProperty.call(vidObj, 'videoRenderer')
              )?.length
          )
          ?.itemSectionRenderer?.contents?.filter((obj) =>
            Object.prototype.hasOwnProperty.call(obj, 'videoRenderer')
          )
          .map((res) => {
            return {
              appName,
              title: res?.videoRenderer?.title?.runs?.[0]?.text,
              id: res?.videoRenderer?.videoId,
              thumbnail: res?.videoRenderer?.thumbnail?.thumbnails?.[0]?.url
            }
          })
          .filter((res: { title: string; id: string }) => res.id?.length)
      return results
    } else {
      return undefined
    }
  }
  return undefined
}

export async function getAudioUrlFromVideoId(
  serverAPI: ServerAPI,
  video: { title: string; id: string }
): Promise<string | undefined> {
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`
  }
  const res = await serverAPI.callServerMethod<
    { method: string; url: string },
    { body: string; status: number }
  >('http_request', req)
  if (res.success && res.result.status === 200) {
    const configJsonMatch = res.result.body.match(
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/
    )
    if (!configJsonMatch) {
      return undefined
    }

    const configJson = JSON.parse(configJsonMatch[1])
    const streamMap = configJson?.streamingData?.adaptiveFormats?.filter(
      (f: { mimeType: string }) => f.mimeType.startsWith('audio/')
    )[0]
    if (!streamMap?.url) return undefined

    const signature = streamMap?.signatureCipher
      ? streamMap.signatureCipher
          .split('&')
          .find((s: string) => s.startsWith('s='))
          .substr(2)
      : undefined
    return `${streamMap.url}&${
      signature ? `sig=${signature}` : 'ratebypass=yes'
    }`
  }
  return undefined
}

export async function getAudio(
  serverAPI: ServerAPI,
  appName: string
): Promise<{ videoId: string; audioUrl: string } | undefined> {
  const videos = await getYouTubeSearchResults(serverAPI, appName)
  if (videos?.length) {
    let audio: { videoId: string; audioUrl: string } | undefined
    let i
    for (i = 0; i < videos.length; i++) {
      const audioUrl = await getAudioUrlFromVideoId(serverAPI, videos[i])
      if (audioUrl?.length) {
        audio = { audioUrl, videoId: videos[i].id }
        break
      }
    }
    return audio
  }
  return undefined
}
