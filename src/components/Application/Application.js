import React, { PropTypes } from 'react';
import { Header } from '../presentational/Header/Header';
import { Footer } from '../presentational/Footer/Footer';

export const Application = props => (
  <div>
    <Header />
    <div key={props.location.pathname}>
      {props.children}
    </div>
    <Footer />
  </div>
);

Application.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};
