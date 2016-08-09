import React from 'react';
import loadImage from './loadImage';

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
    loadImage.parseMetaData(new Blob([response], {type: contentType}),
      (data) => {
        const orientation = data.exif.getAll().Orientation;
        this.setState({
          imgStyle: this.rotationStyleMap[orientation]
        });
        if(this.willRotate.indexOf(orientation) > -1){
          const imgTag = React.findDOMNode(this.refs.img);
          const containerStyle = Object
            .assign(this.state.containerStyle, {
              height: imgTag.offsetWidth
            });
          this.setState({
            containerStyle
          });
        }
      }
    );
  }

  handleUrlUpdate(url){
    return this
      .fetchImage(url)
      .then(this.processImageBuffer)
      .catch((e) => {
        console.error(e);
      });
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
        <img
          {...this.props}
          style={this.state.imgStyle}
          ref="img"
          src={this.props.urlValue}/>
      </div>
    );
  }

}
