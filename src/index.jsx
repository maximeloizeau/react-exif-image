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

    let imageBlob = new Blob([response], {type: contentType});
    loadImage.parseMetaData(imageBlob,
      (data) => {
        const orientation = (data.exif)?data.exif.get('Orientation'):0;
        if(options.orientation === undefined) options.orientation = orientation;

        loadImage(
          imageBlob,
          (canvas) => {
            findDOMNode(this).querySelector('canvas').height = canvas.height;
            findDOMNode(this).querySelector('canvas').width = canvas.width;
            findDOMNode(this).querySelector('canvas').getContext('2d').drawImage(canvas, 0, 0);
            return canvas;
          },
          options
        );
      }
    );
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
      <div className="exifImage-container">
        <canvas></canvas>
      </div>
    );
  }
}
