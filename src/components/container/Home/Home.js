import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.scss';

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.onButtonClicked = this.onButtonClicked.bind(this);
    this.state = {
      data: {},
    };
  }

  onButtonClicked(url) {
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
    smartFetch(url).then(resp => resp.json()).then(res => this.setState({ data: res }));
  }

  onButtonSyncClicked() {
    navigator.serviceWorker.ready
    .then((reg) => (
      reg.sync.register('syncTest')
    )).then(() => {
      console.log('Sync registered');
    }).catch((err) => {
      console.log('It broke', err.message);
    });

    // new Promise((resolve, reject) => {
    //   Notification.requestPermission((result) => { // eslint-disable-line
    //     if (result !== 'granted') return reject(Error('Denied notification permission'));
    //     resolve();
    //   });
    // }).then(() => (
    // navigator.serviceWorker.ready
    // )).then((reg) => (
    //   reg.sync.register('syncTest')
    // )).then(() => {
    //   console.log('Sync registered');
    // }).catch((err) => {
    //   console.log('It broke');
    //   console.log(err.message);
    // });
  }

  render() {
    const { data } = this.state;
    return (
      <div className={styles.home}>
        <h2>Serve content from cache</h2>
        <button onClick={() => this.onButtonClicked('http://www.omdbapi.com/?t=star&y=&plot=short&r=json')} className={styles.button}>FETCH</button>
        <button
          onClick={() => this.setState({ data: { headers: {} } })} className={styles.button}
        >
          CLEAR
        </button>
        <div className={styles.content}>
          {
            data.headers && data.headers.Referer
          }
          {data.Plot}
        </div>
        <h2>background sync</h2>
        <button onClick={() => this.onButtonSyncClicked()} className={styles.button}>SYNC</button>
        <Link to="/out" className={styles.link}>
          Move Out
        </Link>
      </div>
    );
  }
}

// http://www.omdbapi.com/?t=star&y=&plot=short&r=json

// https://m-lpm.dev5.fullsix.com/api/status
