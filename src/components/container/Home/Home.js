import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.scss';

const smartFetch = (uri, config) => new Promise((resolve, reject) =>
fetch(uri, config).then(
  (response) => {
    if (response.ok) {
      resolve(response);
    } else {
      reject(response);
    }
  })
);

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.onButtonClicked = this.onButtonClicked.bind(this);
    this.state = {
      data: {},
      from: '',
    };
  }

  onButtonClicked(url, headerValue) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      smartFetch(url, headerValue && { headers: new Headers({ [headerValue]: 1 }) })
        .then(resp => resp.json()).then(res => this.setState({ data: res }));
    }
  }

  fetchBoth(url) {
    let showLiveData = false;
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      smartFetch(url)
        .then(resp => resp.json())
        .then(res => {
          this.setState({ data: res, from: 'network' });
        })
        .then(() => { showLiveData = true; });
      smartFetch(url, { headers: new Headers({ 'x-use-cache-only': 1 }) })
        .then(resp => resp.json())
        .then(res => {
          if (!showLiveData) {
            this.setState({ data: res, from: 'cache' });
          }
        });
    }
  }

  render() {
    const { data, from } = this.state;
    return (
      <div className={styles.home}>
        <h2>Force serve content from cache</h2>
        <button onClick={() => this.onButtonClicked('http://www.omdbapi.com/?t=star&y=&plot=short&r=json', 'x-use-cache-only')} className={styles.button}>FETCH data in cache</button>
        <h2>Force serve content from network</h2>
        <button onClick={() => this.onButtonClicked('http://www.omdbapi.com/?t=star&y=&plot=short&r=json')} className={styles.button}>FETCH data not in cache</button>
        <h2>Fetch from cache then network</h2>
        <button onClick={() => this.fetchBoth('http://www.omdbapi.com/?t=star&y=&plot=short&r=json?both=true')} className={styles.button}>FETCH</button>
        <h2></h2>
        <button
          onClick={() => this.setState({ data: { headers: {} } })} className={styles.button}
        >
          CLEAR
        </button>
        <div className={styles.content}>
          {
            data.headers && data.headers.Referer
          }
          <h1>{from}</h1>
          {data.Plot}
        </div>
        <Link to="/out" className={styles.link}>
          Move Out
        </Link>
      </div>
    );
  }
}
