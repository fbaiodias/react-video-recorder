react-video-recorder
===

## Installation

```
yarn add react-video-recorder
```

## Usage

Basic usage [(edit in stakblitz)](https://stackblitz.com/edit/react-video-recorder-demo):

```js
import React from 'react'
import { render } from 'react-dom'
import VideoRecorder from 'react-video-recorder'

const App = () => (
  <VideoRecorder />
)

render(<App />, document.getElementById('root'))
```

Also check the [Storybook](https://react-video-recorder.surge.sh/) for more demos and usage examples.

**Note:** if you click the **"Show info"** button in the top-right corner, you should be able to see a table with the supported prop-types.

## Development

Requirements

`node version ">=8.3"`

Install packages

```
yarn install
```

Run the storybook demo

```
yarn start
```
