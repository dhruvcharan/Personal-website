import React, {useEffect, useState} from 'react';
import '../styles/ContactModal.css';

interface ContactModalProps {
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({onClose}) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        }
    }
    , []);

    const myEmail = 'dhruvcharan222@gmail.com';
    const myResumeGoogleDriveLink = 'https://drive.google.com/file/d/1OynAWxb7mHDj1NOKyzATWUiHxHFppd3T/view?usp=sharing';

    return (
        <div className='contact-modal-overlay' onClick={onClose}>
            <div className='contact-modal-content' onClick={e => e.stopPropagation()}>
                <button className='contact-modal-close-button' onClick={onClose}>
                    &times;
                </button>
                <h2> About Me </h2>
                <p>
                I am Dhruv Charan, a 25-year-old CS Grad Student at Stony Brook University.
                I spent a few years working as a Software Development Engineer at Amazon,and later a stint as 
                a Product Engineer at an early stage startup Kombai.io. I am looking for new full time opportunities that allow 
                me to utilize my analytical and programming skills in a challenging continuous growth environment. Read more about what 
                I am currently up to on my Now page.
                </p>
                <div className='modal-section'>
                    <h3> Resume</h3>
                    <a
                        href={myResumeGoogleDriveLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='modal-link'
                        >
                        View My Resume
                        </a>
                </div>
                <div className='modal-section'>
                    <h3> Get in touch</h3>
                    <a href={`mailto:${myEmail}`} className='modal-link'>
                        <i className='fas fa-envelope'></i> {myEmail}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;