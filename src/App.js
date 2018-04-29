import React, { Component } from 'react';
import $ from 'jquery';
import Victor from 'victor';
import './App.css';

const opposites = {
  ul: 'lr',
  ll: 'ur',
  ur: 'll',
  lr: 'ul'
};
const clockwise = {
  ul: 'ur',
  ur: 'lr',
  lr: 'll',
  ll: 'ul'
};
const REPEATS = 3;
const GAME_LENGTH = 30 * 1000;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dim: Math.floor(0.9 * $(window).height()),
    }
    this.RULES = [this.oppositeCornerRule, this.sameCornerRule, this.cwRule, this.sameCornerTwoBeforeRule, this.cwTwoBeforeRule];

    this.currRule = (corner) => null;
    this.corners = {};
    this.prevPoint = Victor(0, 0);
    this.bannedCorner = null;
    this.ctx = null;
  }
  updateDimensions = () => {
    let w = $(window).width();
    let h = $(window).height();
    if (w > h) {
      this.setState({
        dim: Math.floor(0.9 * h)
      });
    } else {
      this.setState({
        dim: Math.floor(0.9 * w)
      });
    }
  }
  startGame = () => {
    const canvas = document.getElementById('canvas');
    const w = canvas.width;
    const h = canvas.height;
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#DE8D47";
      const corners = {
        ul: Victor(0, 0),
        ll: Victor(0, h),
        ur: Victor(w, 0),
        lr: Victor(w, h)
      }
      const first = Victor(0, 0).randomize(corners.ul, corners.lr);
      ctx.fillRect(first.x, first.y, 3, 3);
      this.corners = corners;
      this.prevPoint = first;
      this.ctx = ctx;
    }
  }
  drawNextPoint = () => {
    for (var i = 0; i < REPEATS; i++) {
      var corner;
      do {
        var int = randInt(4);
        corner = Object.keys(this.corners)[int];
      } while (this.bannedCorner && corner === this.bannedCorner);
      let cornerPoint = this.corners[corner];
      let nextPoint = this.prevPoint.clone().mix(cornerPoint, 0.5);

      if (this.ctx) {
        this.ctx.fillRect(nextPoint.x, nextPoint.y, 3, 3);
      }
      this.bannedCorner = this.currRule(corner);
      this.prevPoint = nextPoint;
    }
  }
  oppositeCornerRule = (corner) => {
    return opposites[corner];
  }
  sameCornerRule = (corner) => {
    return corner;
  }
  cwRule = (corner) => {
    return clockwise[corner];
  }
  sameCornerTwoBeforeRule = (corner) => {
    if (this.prevCorners) {
      this.prevCorners.push(corner);
      if (this.prevCorners.length === 2) {
        return opposites[this.prevCorners.shift()];
      }
    } else {
      this.prevCorners = [corner];
    }
    return null;
  }
  cwTwoBeforeRule = (corner) => {
    if (this.prevCorners) {
      this.prevCorners.push(corner);
      if (this.prevCorners.length === 2) {
        return clockwise[this.prevCorners.shift()];
      }
    } else {
      this.prevCorners = [corner];
    }
    return null;
  }
  handleClick(idx) {
    this.currRule = this.RULES[idx];
    this.restart();
  }
  restart = () => {
    $('.name').css({
      transition: 'none',
      opacity: 0.1
    });
    setTimeout(() => {
      $('.name').css({
        transition: 'opacity 10s',
        opacity: 1
      });
    }, 100)
        if (this.currInterval) {
      clearInterval(this.currInterval);
    }
    if (this.currTimeout) {
      clearTimeout(this.currTimeout)
    }
    if (this.ctx) {
      const canvas = document.getElementById('canvas');
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.corners = {};
      this.prevPoint = Victor(0, 0);
      this.bannedCorner = null;
      this.ctx = null;
    }
    this.startGame();
    this.currInterval = setInterval(this.drawNextPoint, 1);
    var self = this;
    this.currTimeout = setTimeout(() => {
      if (self.interval) {
        clearInterval(self.interval);
      }
    }, GAME_LENGTH);
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
    this.restart();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }
  render() {
    return (
      <div className="App">
        <div className="name">
          <div className="letters">{'COLBY'.split('').map((letter, idx) => {
            return <div key={idx} className='letter' onClick={this.handleClick.bind(this, idx)}>{letter}</div>
          })}
        </div>
        <div className="subtext">
          <p>Each letter does a different thing</p>
          <p>See: <a href="//en.wikipedia.org/wiki/Chaos_game">chaos game</a></p>
        </div>
        </div>
        <canvas id="canvas" className="canvas" width={this.state.dim} height={this.state.dim}>
        </canvas>
      </div>
    );
  }
}

function randInt(upper) {
  return Math.floor(Math.random() * upper);
}

export default App;
