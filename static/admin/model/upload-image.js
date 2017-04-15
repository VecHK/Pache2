define(function (require) {
  const errp = require('controller/error-panel.js')
  const JsonMiddle = res => {
    const json = JSON.parse(res)
    if (json.code > 0) {
      console.warn(json)
      const err = new PamError(`JsonMiddle 錯誤：`, json.msg)
      err.json = json
      errp.showError(err)
      throw err
    } else {
      return json
    }
  }
  const JsonResult = res => JsonMiddle(res).result

  class UMG {
    upload() {
      const form = new FormData()
      form.append('img', this.blob)
      form.append('mimeType', this.blob.type)

      var xhr = new XMLHttpRequest();
      xhr.open('POST', this.up_url, true);
      return new Promise((res, rej) => {
        xhr.onloadend = () => {
          if (xhr.status === 200) {
            res(xhr.responseText);
          } else {
            const err = new Error('status is not 200');
            err.status = xhr.status;
            err.responseText = xhr.responseText;
            err.xhr = xhr;
            rej(err);
          }
        };
        xhr.send(form);  // multipart/form-data
      }).then(JsonMiddle)
    }
    constructor(blob, up_url) {
      this.blob = blob
      this.up_url = up_url || '/'
    }
  }

  return UMG
})
