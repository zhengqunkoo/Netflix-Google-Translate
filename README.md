# Netflix Translate

Adapted from [Andr3wHur5t/Netflix-Google-Translate](https://github.com/Andr3wHur5t/Netflix-Google-Translate).

Wrapped in a Mozilla Firefox addon.

## Usage
1. Find a translation provider with a REST API.
2. Configure `netflix-translate` settings to call that REST API. Open up the options page, by either clicking on the `netflix-translate` icon in the toolbar, or going to the `addons` page, and clicking `Preferences` under `netflix-translate`.
  - `url`: URL of that REST API, excluding the API parameters.
  - `key`: API key.
  - `langsrc`: source language.
  - `langdst`: destination language.
  - `urlform`: This is where users can configure the API call parameters. Users need to configure this, because API parameters differ from provider to provider. A default value for `Google`'s translation API has been provided as an example. `urlform` is a JSON object, where:
    - keys: API parameter names.
    - values: API parameter values, but each must be some combination of the following strings, interleaved with some special characters. The purpose of this is for the user to combine the values in the settings, to make the values in the API call.
      - `url`
      - `key`
      - `langsrc`
      - `langdst`
3. Changes are automatically stored. Press `Esc` or click outside the popup to close the popup.

TODO:
- Adapt to Yandex.Translate and comply with Yandex's [requirements](https://tech.yandex.com/translate/doc/dg/concepts/design-requirements-docpage/).
- Call REST API while preserving newlines in captions. Issues:
  - Substituting newlines with `<br>` sometimes gives residues, like `<>` or `< br / `, and can affect the actual captions too.
  - Calling REST API once per caption line may not get the whole context, and cause more literal and less accurate translations.
- Call REST API once per `player-timed-text-container` loses context.
- Change `<all_urls>` `permissions` into `optional_permissions`, where the latest version of each big translation provider is listed in the manifest, and `netflix-translate` prompts the user to allow `CORS` requests to those translation providers, only when the user puts those URLs in `url` setting.
  - Consider changing `url` setting to dropdown list.
- Mousing over the video causes a re-`fetch`, even though the caption content appears to be the same, therefore should be cached. This is because the caption content is actually different: newlines are missing, therefore misses the cache. This is probably because setting caption content sets all `span`s to empty strings, then when Netflix's code interacts with the captions, it only fills in the top `span` with text. TODO: Need to see how Netflix performs without the extension.
- Auto-generate landing page from description.
- Throw errors in console when URLSearchParams is malformed, or when JSON parses wrongly.
