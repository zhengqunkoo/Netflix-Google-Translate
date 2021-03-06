// ==UserScript==
// @name         universalTranslator.user.js
// @match        https://www.netflix.com/watch/*
// ==/UserScript==

(function initTranslator (url, key, langsrc, langdst) {
  var content = content || {}
  content.fetch = fetch

  function makeSafe (s) {
    return s.replace(/[^a-z0-9]/gi, '')
  }

  function setSubtitleText (elem, text) {
    for (var i = 0; i < elem.children.length; i++) {
      elem.children[i].innerText = ''
    }
    elem.children[0].innerText = text
  }

  function postData (data) {
    return content.fetch(url, {
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
      .catch(error =>
        console.log('Error: netflix-translate: ' + error)
      )
  }

  // Cache lets us handle common statements without lookup costs.
  var cache = {}
  function translateCaption (text, done) {
    if (cache[text]) return done(cache[text])

    var data = new URLSearchParams()
    data.append('key', key)
    data.append('q', text.replace(/[\r\n]/g, '<br>'))
    data.append('source', langsrc)
    data.append('target', langdst)

    postData(data)
      .then(data => {
        var translated = data.data.translations[0].translatedText
        translated = translated.replace(/<br>/g, '\n')
        cache[text] = translated
        // TODO Uncomment to log translated text
        // console.log(translated)
        done(cache[text])
      })
      .catch(error =>
        console.log('Error: netflix-translate: ' + error)
      )
  }

  var lastSet = ''
  var processing = false
  function checkCaptions (subtitles) {
    if (processing || makeSafe(lastSet) === makeSafe(subtitles.innerText)) {
      return
    }
    if (subtitles.innerText === '') {
      return
    }

    var text = subtitles.innerText

    // Hide original while sending
    setSubtitleText(subtitles, '')

    // Mutex to prevent multiple requests
    processing = true
    translateCaption(text, function (toSet) {
      processing = false
      lastSet = toSet
      setSubtitleText(subtitles, toSet)
    })
  }

  function setupObserver (classname) {
    var target = document.getElementsByClassName(classname)[0]
    if (!target) {
      console.log('netflix-translate: waiting for ' + classname)
      window.setTimeout(setupObserver, 1000, classname)
      return
    }

    var config = {
      'childList': true,
      'attributes': true
    }

    var callback = function (mutations) {
      mutations.forEach((mutation) => {
        switch (mutation.type) {
          case 'childList':
            if (mutation.addedNodes.length) {
              checkCaptions(mutation.addedNodes[0])
            }
            break
          case 'attributes':
            var node = target.children[0]
            if (node) {
              checkCaptions(node)
            }
            break
        }
      })
    }

    var observer = new MutationObserver(callback)
    console.log('netflix-translate: observing ' + classname)
    observer.observe(target, config)
  }

  setupObserver('player-timedtext')
  console.log('netflix-translate from ' + langsrc + ' to ' + langdst)
})('https://translation.googleapis.com/language/translate/v2',
  '<API_KEY>',
  '<2_LETTER_LANG_CODE_SRC>',
  '<2_LETTER_LANG_CODE_DST>')
