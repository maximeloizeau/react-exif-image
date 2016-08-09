import React from 'react';
import { findDOMNode } from 'react-dom';
import loadImage from './load-image';

export default class ExifImage extends React.Component {
  static propTypes = {
    urlValue: React.PropTypes.string,
  }

  constructor(props) {
    super(props, ExifImage);

    this.willRotate = [
      'right-top',
      'left-top',
      'left-bottom',
      'right-bottom'
    ];

    this.rotationStyleMap = {
      'right-top': {
        transform: 'rotate(0.25turn)',
      },

      'left-top': {
        transform: 'rotate(0.25turn) scaleY(-1)',
      },

      'top-right': {
        transform: 'scaleX(-1)',
      },

      'top-left': {},

      'bottom-right': {
        transform: 'rotate(0.5turn)',
      },

      'bottom-left': {
        transform: 'rotate(0.5turn) scaleX(-1)',
      },

      'left-bottom': {
        transform: 'rotate(-0.25turn)',
      },

      'right-bottom': {
        transform: 'rotate(-0.25turn) scaleX(-1)',
      }
    };

    this.state = {
      imgStyle: {},
      containerStyle: {}
    };
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
    let options = { orientation: true };

    if(this.props.maxWidth) options.maxWidth = this.props.maxWidth;
    if(this.props.maxHeight) options.maxHeight = this.props.maxHeight;

    loadImage.parseMetaData(new Blob([response], {type: contentType}),
      (data) => {
        console.log(data.exif);
        const orientation = data.exif.get('Orientation');
        loadImage(
          new Blob([response]),
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
      .then(this.processImageBuffer.bind(this))

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
      <div
        className="wi-ExifImage-Container"
        style={this.state.containerStyle}>
        <canvas></canvas>
      </div>
    );
  }

}
