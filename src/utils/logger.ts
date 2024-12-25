import { name } from '@decky/manifest'

export const trace = (...args: unknown[]) =>
  console.trace(
    `%c ${name} %c TRACE %c`,
    'background: #7605ff; color: black;',
    'background: #1a53bc; color: black;',
    'background: transparent;',
    ...args
  )

export const debug = (...args: unknown[]) =>
  console.debug(
    `%c ${name} %c DEBUG %c`,
    'background: #7605ff; color: black;',
    'background: #1a53bc; color: black;',
    'background: transparent;',
    ...args
  )

export const info = (...args: unknown[]) =>
  console.info(
    `%c ${name} %c INFO %c`,
    'background: #7605ff; color: black;',
    'background: #1abc9c; color: black;',
    'background: transparent;',
    ...args
  )

export const warn = (...args: unknown[]) =>
  console.warn(
    `%c ${name} %c WARN %c`,
    'background: #7605ff; color: black;',
    'background: #e3c907; color: black;',
    'background: transparent;',
    ...args
  )

export const error = (...args: unknown[]) =>
  console.warn(
    `%c ${name} %c ERROR %c`,
    'background: #7605ff; color: black;',
    'background: #c70808; color: black;',
    'background: transparent;',
    ...args
  )

export const critical = (...args: unknown[]) =>
  console.warn(
    `%c ${name} %c CRITICAL %c`,
    'background: #7605ff; color: black;',
    'background: #c70808; color: black;',
    'background: transparent;',
    ...args
  )

export const log = (...args: unknown[]) =>
  console.log(
    `%c ${name} %c LOG %c`,
    'background: #7605ff; color: black;',
    'background: #1abc9c; color: black;',
    'background: transparent;',
    ...args
  )
