# LTI1.1 launcher

This package is a simple LTI launcher that performs a basic launch using an LTI launch URL, key and secret.

## Setup

```cmd
npm install lti1p1-launcher
```

This package assumes there is an ```iframe``` available that will be used to embedd the LTI content that is being launched.
Make sure to have the ```iframe``` on the page with a valid ```id```

```html
<iframe id="contentFrame"></iframe>
```

## Usage

1. Import the Launcher

```js
import Launcher from 'lti1p1-launcher'
```

2. Call the ```setup()``` function 

```js
const iframeQuerySelector = '#contentFrame';
const launchUrl = 'https://platform.com/lti/...';
const key = '...';
const secret = '...';
const userId = '...'

let launcher = Launcher.setup(iframeQuerySelector, launchUrl, key, secret, userId);
```

3. (optional) Set optional parameters

```js
launcher
  .withUserInfo('firstName', 'lastName', 'displayName', 'email')
  .withLanguage('en')
  .withResultCallback('callbackUrl', 'sourcedId')
```

4. Perform the launch

```js
launcher.launch()
```

## Best practice

In single page applications it is recommended to unset the source of the ```iframe``` when navigating away from the page that contains the iframe.
This allows the embedded content to correctly end the active session on their side.

```js
iframe.src = 'about:blank'
```
