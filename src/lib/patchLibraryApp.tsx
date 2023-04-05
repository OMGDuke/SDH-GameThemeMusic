import {
  afterPatch,
  ServerAPI,
  wrapReactType,
  findInReactTree,
  appDetailsClasses,
  appDetailsHeaderClasses,
  wrapReactClass
} from 'decky-frontend-lib'
import React, { ReactElement } from 'react'
import ThemePlayer from '../components/themePlayer'
import { SettingsProvider } from '../context/settingsContext'

function addVideoToBackground(container: any): any {
  const class1 = appDetailsClasses.Header
  const class2 = appDetailsHeaderClasses.HeaderBackgroundImage
  return container
}

function patchLibraryApp(serverAPI: ServerAPI) {
  return serverAPI.routerHook.addPatch(
    '/library/app/:appid',
    (props?: { path?: string; children?: ReactElement }) => {
      if (!props?.children?.props?.renderFunc) {
        return props
      }

      afterPatch(
        props.children.props,
        'renderFunc',
        (_: Record<string, unknown>[], ret?: ReactElement) => {
          if (!ret?.props?.children?.type?.type) {
            return ret
          }

          wrapReactType(ret.props.children)
          afterPatch(
            ret.props.children.type,
            'type',
            (_2: Record<string, unknown>[], ret2?: ReactElement) => {
              const container = findInReactTree(
                ret2,
                (x: ReactElement) =>
                  Array.isArray(x?.props?.children) &&
                  x?.props?.className?.includes(
                    appDetailsClasses.InnerContainer
                  )
              )
              const header = findInReactTree(container, (x: ReactElement) => {
                return x?.props?.className?.includes(appDetailsClasses.Header)
              })

              wrapReactClass(header)
              afterPatch(header.type.prototype, 'render', (_3, ret3) => {
                console.log(ret3)
                ret3.props.children.push(
                  <div
                    style={{
                      position: 'absolute',
                      height: '100vh',
                      width: '100vw',
                      background: 'red',
                      top: 0,
                      left: 0,
                      zIndex: 100
                    }}
                  >
                    HELLO THERE
                  </div>
                )
                const topCapsule = findInReactTree(ret3, (x: ReactElement) => {
                  return (
                    x?.props &&
                    Object.prototype.hasOwnProperty.call(
                      x?.props,
                      'editMode'
                    ) &&
                    Object.prototype.hasOwnProperty.call(
                      x?.props,
                      'hasHeroImage'
                    )
                  )
                })
                const backgroundImage = findInReactTree(
                  topCapsule,
                  (x: ReactElement) => {
                    return (
                      x?.props &&
                      Object.prototype.hasOwnProperty.call(
                        x?.props,
                        'editMode'
                      ) &&
                      Object.prototype.hasOwnProperty.call(x?.props, 'haslogo')
                    )
                  }
                )
                wrapReactClass(backgroundImage)
                afterPatch(
                  backgroundImage.type.prototype,
                  'render',
                  (_4, ret4) => {
                    ret4.props.children.push(
                      <div
                        style={{
                          position: 'absolute',
                          height: '100vh',
                          width: '100vw',
                          background: 'red',
                          top: 0,
                          left: 0,
                          zIndex: 100
                        }}
                      >
                        HELLO THERE
                      </div>
                    )
                    return ret4
                  }
                )

                return ret3
              })

              if (typeof container !== 'object') {
                return ret2
              }

              const containerWithBackground = addVideoToBackground(container)

              containerWithBackground.props.children.push(
                <SettingsProvider>
                  <ThemePlayer serverAPI={serverAPI} />
                </SettingsProvider>
              )

              return ret2
            }
          )
          return ret
        }
      )
      return props
    }
  )
}

export default patchLibraryApp
