// ==UserScript==
// @name         universalTranslator.js
// @match        https://www.netflix.com/watch/*
// ==/UserScript==

(function initTranslator (key, langdst) {
  var url = 'https://translation.googleapis.com/language/translate/v2'

  function makeSafe (s) {
    return s.replace(/[^a-z0-9]/gi, '')
  }

  function getSubtitleObj () {
    return document.getElementsByClassName('player-timedtext-text-container')[0]
  }

  function setSubtitleText (elem, text) {
    for (var i = 0; i < elem.children.length; i++) {
      elem.children[i].innerText = ''
    }
    elem.children[0].innerText = text
  }

  function postData (data) {
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    }).then(response => response.json())
  }

  // Cache lets us handle common statements without lookup costs.
  var cache = {}
  function translateCaption (text, done) {
    if (cache[text]) return done(null, cache[text])

    var data = new URLSearchParams()
    data.append('key', key)
    data.append('q', text.replace(/[\r\n]/g, '<br>'))
    data.append('target', langdst)

    postData(data)
      .then(data => {
        var translated = data.data.translations[0].translatedText
        translated = translated.replace(/<br>/g, '\n')
        cache[text] = translated
        done(null, cache[text])
      })
      .catch(error =>
        console.log('Error: netflix-translate: ' + error)
      )
  }

  var lastSet = ''
  var processing = false
  function checkCaptions () {
    var subtitles = getSubtitleObj()
    if (!subtitles || processing || makeSafe(lastSet) === makeSafe(subtitles.innerText)) {
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
    translateCaption(text, function (err, toSet) {
      processing = false
      lastSet = toSet
      setSubtitleText(subtitles, toSet)
    })
  }
  var procNum = setInterval(checkCaptions, 10)
  console.log('System Online; Translating to "' + langdst + '"')
  console.log('You can kill the translator using \'clearInterval(' + procNum + ')\'')
})('<API_KEY>', '<2_LETTER_LANG_CODE>')
