import React from 'react';

export default class Photostream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: null,
      modalVisible: false,
      src: null
    };
    this.imgModal = this.imgModal.bind(this);
  }

  componentDidMount() {
    if (this.props.images) {
      this.setState({ images: null });
    } else {
      fetch('/api/explore-images')
        .then(res => res.json())
        .then(images => {
          this.setState({ images });
        });
    }
  }

  imgModal(event) {
    if (!this.state.modalVisible) {
      this.setState({
        modalVisible: true,
        src: event.target.src
      });
    } else if (event.target.id === 'close-modal') {
      this.setState({
        modalVisible: false,
        src: null
      });
    }
  }

  render() {
    if (!this.state.images && !this.props.images) return null;
    const firstName = this.props.firstName ? this.props.firstName : '';
    let hidden = 'd-none';
    let src = '';
    if (this.state.modalVisible) {
      hidden = '';
      src = this.state.src;
    }
    const onImgLoad = ({ target: img }) => {
      const { offsetHeight: height, offsetWidth: width } = img;
      if (width > height) {
        img.className = 'landscape';
      } else if (width < height) {
        img.className = 'portrait';
      } else {
        img.className = 'square';
      }
    };

    const imageList = this.state.images
      ? this.state.images
      : this.props.images.map(img => {
        if (!img.image) {
          return null;
        } else {
          const { imageUrl, photoId } = img.image;
          return { imageUrl, photoId };
        }
      });

    const images = imageList.map(img => {
      if (!img) {
        return (<h5 key="no-photos">{firstName} has no photos yet!</h5>);
      } else {
        const { imageUrl, photoId } = img;
        return (
            <img onLoad={onImgLoad} onClick={this.imgModal} key={photoId} src={imageUrl} id={photoId} alt='surfing' />
        );
      }
    });

    return (
      <>
        <div id="img-expand" className={hidden}>
          <div className='img-modal-overlay'></div>
          <div className='d-flex img-expand-container center'>
            <button className='close-button' onClick={this.imgModal}><i id="close-modal" className="fa fa-window-close"></i></button>
            <img src={src} alt='surfing' className='img-expand' />
          </div>
        </div>
        <div className="gallery-container">
          <div id="gallery" className="img-gallery">
            {images}
          </div>
        </div>
      </>
    );
  }
}
