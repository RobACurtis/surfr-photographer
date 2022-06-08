import React from 'react';
import Photostream from '../components/photostream';
import AppContext from '../lib/app-context';
import jwtDecode from 'jwt-decode';
import ImageUploadModal from '../components/image-upload'

export default class UserProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      imageUrls: [],
      profileImageModalVisible: false
    };
    this.toggleProfileImageModal = this.toggleProfileImageModal.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

    toggleProfileImageModal(e) {
      this.setState({profileImageModalVisible: !this.state.profileImageModalVisible});
    }

    updateProfile(){
      const userId = Number(this.context.user.userId);
      fetch('/api/photographer-profile/' + userId)
        .then(res => res.json())
        .then(user => {
          const { firstName, lastName, email, location, coverImageUrl, profileImageUrl, photos } = user[0];
          const imageUrls = photos.map(imageUrl => {
            return { imageUrl };
          });
          this.setState({
            user: {
              firstName,
              lastName,
              email,
              location,
              coverImageUrl,
              profileImageUrl,
              userId
            },
            imageUrls
          });
        });
    }

  componentDidMount() {
    const userId = Number(this.context.user.userId);
    fetch('/api/photographer-profile/' + userId)
      .then(res => res.json())
      .then(user => {
        const { firstName, lastName, email, location, coverImageUrl, profileImageUrl, photos } = user[0];
        const imageUrls = photos.map(imageUrl => {
          return { imageUrl };
        });
        this.setState({
          user: {
            firstName,
            lastName,
            email,
            location,
            coverImageUrl,
            profileImageUrl,
            userId
          },
          imageUrls
        });
      });
  }

  render() {
    if (!this.state.user) return null;
    const images = this.state.imageUrls;
    const { firstName, lastName, email, location, coverImageUrl, profileImageUrl } = this.state.user;
    const emailHref = `mailto:${email}`;

    let hidden = 'd-none';
    if (this.state.profilePhotoModal) {
      hidden = '';
    }
    return (
      <>
        <ImageUploadModal toggle={this.toggleProfileImageModal} update={this.updateProfile} display={this.state.profileImageModalVisible}/>
        <div className="profile-container">
          <div className="overlay-coverphoto"></div>
          <div className="coverphoto-container">
            <img src={coverImageUrl} className="coverphoto" alt="shorebreak" />
          </div>
          <div className="profile-info">
            <div>
              <img src={profileImageUrl} className="profile-image" alt="profile picture" />
              <button type="button" className='edit-profile-image' onClick={this.toggleProfileImageModal}>
                  <i className="fa-solid fa-pen edit-profile-image-icon"></i>
                </button>
            </div>
            <div className="text-white">
              <h1 className="profile-name">{`${firstName} ${lastName}`}</h1>
              <p className='profile-subtext' >{location}</p>
              <a target="_blank" rel="noopener noreferrer" href={emailHref} className='profile-subtext email'>
                {email}
              </a>
            </div>
          </div>
        </div>
        <nav className="navbar bg-light py-3 shadow-sm profile-navbar-light position-sticky">
          <ul className="navbar-list">
            <li className="nav-item light-nav-list-item active-nav">
              <p id='photostream'> Photostream</p>
            </li>
          </ul>
        </nav>
        <Photostream images={images} />
      </>
    );
  }
}


UserProfilePage.contextType = AppContext;