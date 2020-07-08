(function initOptions () {
  const keysSimple = ['url', 'key', 'langsrc', 'langdst']
  const keysAdvanced = ['urlform']
  const keysAll = keysSimple.concat(keysAdvanced)
  const defaultSettings = {
    url: '',
    key: '',
    langdst: '',
    langsrc: '',
    urlform: "{'key':'key','q':'text','source':'langsrc','target':'langdst'}"
  }

  function renderKeys (containername, keys) {
    var container = document.getElementById(containername)
    for (var key of keys) {
      var label = document.createElement('label')
      label.innerText = key
      var input = document.createElement('input')

      input.setAttribute('id', key)
      input.setAttribute('type', 'text')
      input.addEventListener('focus', input.select)
      input.addEventListener('keyup', storeSettings)

      label.appendChild(input)
      container.appendChild(label)
    }
  }

  function storeSettings () {
    var data = {}
    for (var key of keysAll) {
      data[key] = document.getElementById(key).value
    }
    browser.storage.sync.set(data)
  }

  function updateSettings (data) {
    for (var key in data) {
      var elem = document.getElementById(key)
      elem.value = data[key] || defaultSettings[key]
    }
  }

  // Actions on opening the page
  renderKeys('container-settings', keysSimple)
  renderKeys('container-settings-advanced', keysAdvanced)
  browser.storage.sync.get()
    .then(updateSettings)
    .catch(console.error)
  document.getElementById('langdst').focus()
  document.getElementById('help').setAttribute('onClick', () => {
    const url = browser.runtime.getURL('/html/installed.html')
    browser.tabs.create({
      url: url
    })
  })
})()
