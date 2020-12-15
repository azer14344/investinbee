import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';

function HeroSection() {
  return (
    <div className='hero-container'>
      <h1>Doing good comes with great rewards.</h1>
      <div className='hero-sub-title'>
        <p>Grow your money by helping our farmers. Your decision to join our community brings our smallholder farmers a step closer to the hope of a better life.</p>
      </div>
      <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
        >
          GET STARTED TODAY
        </Button>
        
      </div>
    </div>
  );
}

export default HeroSection;
