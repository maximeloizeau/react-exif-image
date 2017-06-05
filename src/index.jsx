import React from 'react';
import { findDOMNode } from 'react-dom';
import loadImage from 'blueimp-load-image';

export default class ExifImage extends React.Component {
  static propTypes = {
    urlValue: React.PropTypes.string,
    options: React.PropTypes.object
  }

  fetchImage(imageUrl){
    let xhr = new XMLHttpRequest();
    xhr.open( 'GET', imageUrl, true );
    xhr.responseType = 'arraybuffer';
    const imagePromise = new Promise((resolve, reject) => {
      xhr.onload = function(e) {
        resolve({
          response: this.response,
          contentType: this.getResponseHeader('content-type')
        });
      };

      xhr.onerror = function(e) {
        reject(e);
      };
    });
    xhr.send();
    return imagePromise;
  }

  processImageBuffer({response, contentType}){
    let options = this.props.options || {};
    console.log('pakage', options.orientation);

    let imageBlob = new Blob([response], {type: contentType});
    loadImage.parseMetaData(imageBlob, (data) => {
      const orientation = (data.exif)?data.exif.get('Orientation'):0;
      if(options.orientation === undefined) options.orientation = orientation;

      loadImage( imageBlob, (canvas) => {
        /**
         * Create dummy canvas so we can get the url data
         */
        let ctx = document.createElement('canvas');
        ctx.height = canvas.height;
        ctx.width = canvas.width;
        ctx.getContext('2d').drawImage(canvas, 0, 0);
        let dataURL = ctx.toDataURL('image/png')
          .replace(/^data:image\/(png|jpg);base64,/, '');

        /**
         * Create new image element to render inside the canvas
         */
        let imageEl = findDOMNode(this).querySelector('img');
        imageEl.width = canvas.width;
        imageEl.height = canvas.height;
        imageEl.src = 'data:image/gif;base64, ' + dataURL;
      }, options);
    });
  }

  handleUrlUpdate(url) {
    return this
      .fetchImage(url)
      .then(this.processImageBuffer.bind(this));
  }

  componentDidMount(){
    this.handleUrlUpdate(this.props.urlValue);
  }

  componentDidUpdate(prevProps){
    if(prevProps.urlValue !== this.props.urlValue){
      this.handleUrlUpdate(this.props.urlValue);
    }
  }

  render() {
    return (
      <div className="exif-container">
        <img />
      </div>
    );
  }
}
