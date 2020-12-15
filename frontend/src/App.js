import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import Navbar from './components/Navbar';
import './App.css';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Services from './components/pages/Services';
import Products from './components/pages/Products';
import SignUp from './components/pages/SignUp';
import Login from './components/pages/Login';
import AdminHome from './components/pages/adminHome';
import HeroSection from './components/HeroSection';
import BrowseCampaigns from './components/pages/browseCampaign';
import InvestingPage from './components/pages/investingpage';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/services' component={Services} />
          <Route path='/products' component={Products} />
          <Route path='/sign-up' component={SignUp} />
          <Route path='/login' component={Login} />
          <Route path='/adminHome' component={AdminHome} />
          <Route path='/browseCampaigns' component={BrowseCampaigns} />
          <Route path='/investingpage/:id' component={InvestingPage} />
        </Switch>
        <Footer />
      </Router>
    </>
  );
}

export default App;
