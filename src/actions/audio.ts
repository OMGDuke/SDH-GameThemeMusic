import { ServerAPI } from 'decky-frontend-lib'

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
                }
              }[]
            }
          }[]
        }
      }
    }
  }
}

async function getYouTubeSearchResults(
  serverAPI: ServerAPI,
  appName: string
): Promise<{ title: string; videoId: string }[] | undefined> {
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      appName
    )}%20Theme%20Music`
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
      const results: { title: string; videoId: string }[] | undefined =
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
          .map((res) => ({
            title: res?.videoRenderer?.title?.runs?.[0]?.text,
            videoId: res?.videoRenderer?.videoId
          }))
          .filter(
            (res: { title: string; videoId: string }) => res.videoId?.length
          )
      return results
    } else {
      return undefined
    }
  }
  return undefined
}

async function getAudioUrlFromVideoId(
  serverAPI: ServerAPI,
  videoId: string
): Promise<string | undefined> {
  const req = {
    method: 'GET',
    url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
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
    const streamMap = configJson.streamingData.adaptiveFormats.filter(
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
): Promise<string | undefined> {
  const videos = await getYouTubeSearchResults(serverAPI, appName)
  if (videos?.length) {
    let audioUrl: string | undefined
    let i
    for (i = 0; i < videos.length; i++) {
      audioUrl = await getAudioUrlFromVideoId(serverAPI, videos[i].videoId)
      if (audioUrl) {
        break
      }
    }
    return audioUrl
  }
  return undefined
}
