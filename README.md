# LTI1.1 launcher

This package is a simple LTI launcher that performs a basic launch using an LTI launch URL, key and secret.

## Usage

1. Install the package

```cmd
npm install lti1p1-launcher
```
   
2. Import the Launcher

```js
import Launcher from 'lti1p1-launcher'
```

3. Call the ```setup()``` function 

```js
const iframeQuerySelector = '#contentFrame';
const launchUrl = 'https://platform.com/lti/...';
const key = '...';
const secret = '...';
const userId = '...'

let launcher = Launcher.setup(iframeQuerySelector, launchUrl, key, secret, userId);
```

4. (optional) Set optional parameters

```js
launcher
  .withUserInfo('firstName', 'lastName', 'displayName', 'email')
  .withLanguage('en')
  .withResultCallback('callbackUrl', 'sourcedId')
```

5. Perform the launch

```js
launcher.launch()
```
