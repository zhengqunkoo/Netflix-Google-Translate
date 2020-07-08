// ==UserScript==
// @name         universalTranslator.user.js
// @match        https://www.netflix.com/watch/*
// ==/UserScript==

function initTranslator (settings) {
  var content = content || {}
  content.fetch = fetch

  function makeSafe (s) {
    return s.replace(/[^a-z0-9]/gi, '')
  }

  function splitSpecial (s) {
    return s.split(/[^a-z0-9]/gi)
  }

  function matchSpecial (s) {
    return s.match(/[^a-z0-9]+/gi)
  }

  function setSubtitleText (elem, text) {
    for (var i = 0; i < elem.children.length; i++) {
      elem.children[i].innerText = ''
    }
    elem.children[0].innerText = text
  }

  function postData (data) {
    return content.fetch(settings.url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    })
      .then(response =>
        response.json()
      )
      .catch(console.error)
  }

  // Cache lets us handle common statements without lookup costs.
  var cache = {}
  function translateCaption (text, done) {
    if (cache[text]) {
      return done(cache[text])
    }

    var data = new URLSearchParams()
    var urlformParsed = JSON.parse(settings.urlform)
    for (var key in urlformParsed) {
      var variables = splitSpecial(urlformParsed[key])
      var separators = matchSpecial(urlformParsed[key])
      var string = ''
      for (var i = 0; i < variables.length; i++) {
        var value
        switch (variables[i]) {
          case 'key':
            value = settings.key
            break
          case 'text':
            value = text.replace(/[\r\n]/g, '<br>')
            break
          case 'langsrc':
            value = settings.langsrc
            break
          case 'langdst':
            value = settings.langdst
            break
        }
        if (i > 0) {
          string += separators[i - 1]
        }
        string += value
      }
      data.append(key, string)
    }

    postData(data)
      .then(data => {
        var translated = data.text[0]
        translated = translated.replace(/<br>/g, '\n')
        cache[text] = translated
        // TODO Uncomment to log translated text
        console.log(translated)
        done(cache[text])
      })
      .catch(console.error)
  }

  var lastSet = ''
  function checkCaptions (subtitles) {
    if (makeSafe(lastSet) === makeSafe(subtitles.innerText)) {
      return
    }
    if (subtitles.innerText === '') {
      return
    }

    var text = subtitles.innerText

    // Hide original while sending
    setSubtitleText(subtitles, '')

    translateCaption(text, function (toSet) {
      lastSet = toSet
      setSubtitleText(subtitles, toSet)
    })
  }

  function setupObserver (classname, onChild) {
    var target = document.getElementsByClassName(classname)[0]
    if (!target) {
      console.log('netflix-translate: waiting for ' + classname)
      window.setTimeout(setupObserver, 1000, classname, onChild)
      return
    }

    var config = {
      'childList': true,
      'attributes': true
    }

    var callback = function (mutations) {
      mutations.forEach((mutation) => {
        var children
        switch (mutation.type) {
          case 'childList':
            if (mutation.addedNodes.length) {
              children = mutation.addedNodes
            }
            break
          case 'attributes':
            children = target.children
            break
        }

        if (children) {
          for (var child of children) {
            onChild(child)
          }
        }
      })
    }

    var observer = new MutationObserver(callback)
    console.log('netflix-translate: observing ' + classname)
    observer.observe(target, config)
    return observer
  }

  console.log('netflix-translate from ' + settings.langsrc + ' to ' + settings.langdst)
  return setupObserver('player-timedtext', checkCaptions)
}

(function init () {
  var observer
  function reobserve () {
    browser.storage.sync.get()
      .then(settings => {
        if (observer) {
          observer.disconnect()
        }
        observer = initTranslator(settings)
      })
      .catch(console.error)
  }

  reobserve()
  browser.storage.onChanged.addListener(changed => {
    console.log(changed)
    reobserve()
  })
})()
