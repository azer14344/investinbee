import React from 'react';
import '../../App.css';
import Cards from '../Cards';
import HeroSection from '../HeroSection';
import { Button } from '../Button';
import Footer from '../Footer';

function Home() {
  return (
    <>
      <HeroSection />
      {/**first row*/}
      <div className='row centered grey-bg'>
        <span>powered by blockchain</span>
      </div>
      {/**second  row*/}
      <div className='row centered'>
        <h1>What's in it for you?</h1>
        <div class='col-wrapper'>
          <div className='col-3'>
          <i class="fas fa-hands-helping icon"></i>
            <h3>Connect with our farmers</h3>
            <p>We provide you an opportunity to directly impact the lives of our farmers.</p>
          </div>
          <div className='col-3'>
          <i class="far fa-money-bill-alt icon"></i>
            <h3>Grow your money</h3>
            <p>We provide you with an alternative medium for investment and an additional source of income for living.</p>
          </div>
          <div className='col-3'>
          <i class="fas fa-hand-holding-water icon"></i>
            <h3>Social impact invesment</h3>
            <p>We are a social impact investment tool allowing you to help our farmers while you are also earning for your own future.</p>
          </div>
        </div>
      </div>
      {/**third  row*/}
      <div className='row centered grey-bg'>
        <h1>You can be a pioneer of hope for the farmers.</h1>
        <p> Let us harness the power of many and together empower our farmers.</p>
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
    </>
  );
}

export default Home;
