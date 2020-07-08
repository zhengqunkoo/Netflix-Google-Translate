browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    url: browser.runtime.getURL('html/options.html')
  })
})

browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  if (temporary) {
    return
  }

  switch (reason) {
    case 'install':
      const url = browser.runtime.getURL('/html/installed.html')
      await browser.tabs.create({
        url: url
      })
      break
  }
})
