import {
  afterPatch,
  findInReactTree,
  appDetailsClasses,
  createReactTreePatcher
} from '@decky/ui'
import { routerHook } from '@decky/api'
import React, { ReactElement } from 'react'
import ThemePlayer from '../components/themePlayer'
import {
  AudioLoaderCompatState,
  AudioLoaderCompatStateContextProvider
} from '../state/AudioLoaderCompatState'

function patchLibraryApp(AudioLoaderCompatState: AudioLoaderCompatState) {
  return routerHook.addPatch('/library/app/:appid', (tree) => {
    const routeProps = findInReactTree(tree, (x) => x?.renderFunc)
    if (routeProps) {
      const patchHandler = createReactTreePatcher(
        [
          (tree) =>
            findInReactTree(
              tree,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (x: any) => x?.props?.children?.props?.overview
            )?.props?.children
        ],
        (_: Array<Record<string, unknown>>, ret?: ReactElement) => {
          const container = findInReactTree(
            ret,
            (x: ReactElement) =>
              Array.isArray(x?.props?.children) &&
              x?.props?.className?.includes(appDetailsClasses.InnerContainer)
          )
          if (typeof container !== 'object') {
            return ret
          }

          container.props.children.push(
            <AudioLoaderCompatStateContextProvider
              AudioLoaderCompatStateClass={AudioLoaderCompatState}
            >
              <ThemePlayer />
            </AudioLoaderCompatStateContextProvider>
          )

          return ret
        }
      )

      afterPatch(routeProps, 'renderFunc', patchHandler)
    }

    return tree
  })
}

export default patchLibraryApp
