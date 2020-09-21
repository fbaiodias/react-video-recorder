import { addDecorator, configure } from '@storybook/react'
import { withOptions } from '@storybook/addon-options'
import { withInfo } from '@storybook/addon-info'

addDecorator(withInfo)

addDecorator(
  withOptions({
    name: 'react-video-recorder',
    url: 'https://github.com/fbaiodias/react-video-recorder/',
    showStoriesPanel: true,
    showAddonPanel: true,
    addonPanelInRight: true
  })
)

// automatically import all files ending in *.stories.js
const req = require.context('../src', true, /.stories.js$/)
function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)
