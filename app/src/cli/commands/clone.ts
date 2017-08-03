import * as QueryString from 'querystring'
import { URL } from 'url'

import { CommandError } from '../util'
import { openDesktop } from '../open-desktop'
import { ICommandModule, mriArgv } from '../load-commands'

interface ICloneArgs extends mriArgv {
  pr?: number
  branch?: string
}

const command: ICommandModule = {
  command: 'clone <url|slug> [path]',
  description: 'Clone a repository',
  args: [
    {
      name: 'url|slug',
      required: true,
      description: 'The URL to clone, or the GitHub repo slug to clone',
      type: 'string',
    },
    {
      name: 'path',
      required: false,
      description: 'The path to clone to',
      type: 'string',
    },
  ],
  options: {
    branch: {
      type: 'string',
      aliases: ['b'],
      description: 'The branch to switch to after cloning',
    },
    pr: {
      type: 'number',
      aliases: ['p'],
      description: 'The PR branch to switch to after cloning',
    },
  },
  handler({ _: [cloneUrl, path], pr, branch }: ICloneArgs) {
    if (!cloneUrl) {
      throw new CommandError('Clone URL must be specified')
    }
    try {
      const _ = new URL(cloneUrl)
      _.toString() // don’t mark as unused
    } catch (e) {
      // invalid URL, assume a GitHub repo
      cloneUrl = `https://github.com/${cloneUrl}`
    }
    if (pr) {
      branch = 'pr/' + pr
    } else if (Number.isNaN(pr as number)) {
      throw new CommandError('PR number must be a valid number.')
    }
    if (!path) {
      const urlComponents = cloneUrl.split('/')
      path = urlComponents[urlComponents.length - 1]
    }
    const url = `x-github-client://openRepo/${cloneUrl}?${QueryString.stringify(
      {
        pr,
        branch,
        filepath: path,
      }
    )}`
    openDesktop(url)
  },
}
export = command
