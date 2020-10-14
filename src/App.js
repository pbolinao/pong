import React, { Component, createRef } from 'react'
import './css/pong.css';

var ctx = null,
    scoreHandler = null,
    AI_VEL = 4,
    PLAYER_VEL = 5,
    B_XVEL_PASS = 2,
    B_XVEL_MAX = 12,
    keys = {};

class Pong extends Component {
    constructor(props) {
        super(props);
        this.pCanvasRef = createRef();
        this.pMove = this.pMove.bind(this);
        this.pNoMove = this.pNoMove.bind(this);
        this.scoreHandler = this.scoreHandler.bind(this);
        this.start = this.start.bind(this);
        this.pauseToggle = this.pauseToggle.bind(this);
        this.stop = this.stop.bind(this);
        this.pongLoop = this.pongLoop.bind(this);
        this.initDraw = this.initDraw.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.state = {
            gameRunning: false,
            b: this.ball,
            p1_score: 0,
            p2_score: 0
        };
    }

    player_one = {
        x: 115,
        vx: 0,
        y: 330,
        width: 70,
        height: 10,
        update: function(x, v) {
            this.x = x;
            this.vx = v;
        },
        draw: function() {
            ctx.clearRect(0, this.y, 300, this.height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        reset: function() {
            this.x = 115;
        },
        getPosVel: function() {
            let bounds = {
                x1: this.x,
                x2: this.x + 70,
                vx: this.vx
            };
            return bounds;
        }
    }

    player_two = {
        x: 115,
        vx: 0,
        y: 10,
        width: 70,
        height: 10,
        update: function(bx) {
            let midX_1 = this.x + 30,
                midX_2 = this.x + 40; // The paddle will try to follow the ball from the general center of itself            
            if (midX_2 <= bx) { // Move RIGHT
                if (((this.x + 75) <= 300)) { // So long as it hasnt hit the RIGHT wall
                    this.vx = B_XVEL_PASS;
                    this.x += AI_VEL;
                }
            } else if (midX_1 >= bx) { // Move LEFT 
                if (this.x !== 0) { // So long as it hasnt hit the LEFT wall
                    this.vx = -B_XVEL_PASS;
                    this.x -= AI_VEL;
                }
            } else {
                this.vx = 0;
            }
        },
        draw: function() {
            ctx.clearRect(0, this.y, 300, this.height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        reset: function() {
            this.x = 115;
        },
        getPosVel: function() {
            let bounds = {
                x1: this.x,
                x2: this.x + 70,
                vx: this.vx
            };
            return bounds;
        }
    }

    ball = {
        x: 150,
        y: 175,
        vx: 0,
        vy: 0,
        radius: 6,
        update: function(xb1, xb2) {
            if (this.y <= 20 && xb2.x1 <= this.x && this.x <= xb2.x2) { // player 2 paddle hit
                if (this.vx <= B_XVEL_MAX) { this.vx += xb2.vx; }
                this.vy *= -1;
            } else if (this.y >= 330 && xb1.x1 <= this.x && this.x <= xb1.x2) { // player 1 paddle hit
                if (this.vx <= B_XVEL_MAX) { this.vx += xb1.vx; }
                this.vy *= -1;
            } else if (this.x >= 300 || this.x <= 0) { // Hit the side wall
                this.vx *= -1;
            } else if (this.y >= 340) { // Score on player 1
                ctx.clearRect(0, 340, 300, 10);
                scoreHandler(2);
                this.reset();
                this.serve(2);
            } else if (this.y <= 10) { // Score on player 2
                ctx.clearRect(0, 0, 300, 10);
                scoreHandler(1);
                this.reset();
                this.serve(1);
            }
            this.x += this.vx;
            this.y += this.vy;
        },
        draw: function() {
            ctx.clearRect(0, 20, 300, 310);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#000000";
            ctx.fill();
        },
        reset: function() {
            this.x = 150;
            this.y = 175;
            this.vx = 0;
            this.vy = 0;
        },
        serve: function(p_direction) {
            if (p_direction === 1) { // player one serves (ball comes to p1) 
                this.vy = 3
            } else if (p_direction === 2) { // player two serves (ball goes to p2)
                this.vy = -3
            }
        },
        getX: function() {
            return this.x;
        }
    }

    componentDidMount(){ // acts as main function
        document.addEventListener("keydown", this.pMove, false);
        document.addEventListener("keyup", this.pNoMove, false);
        ctx = this.pCanvasRef.current.getContext('2d');
        scoreHandler = this.scoreHandler;
        this.loadGame();
    }

    loadGame() {
        this.pCanvas = document.getElementById('pong-canvas');
        this.pCwidth = 300;
        this.pCheight = 350;
        this.pCanvas.style.width = (this.pCanvas.width = this.pCwidth) + "px";
        this.pCanvas.style.height = (this.pCanvas.height = this.pCheight) + "px";
        this.initDraw();
    }

    start() {
        document.getElementById("p1-score").innerHTML = this.state.p1_score;
        document.getElementById("p2-score").innerHTML = this.state.p2_score;
        this.setState({gameRunning: true}, () => window.requestAnimationFrame(this.pongLoop, ctx));
        let pongMenu = document.getElementById("pong-menu"), pongUI = document.getElementById("pong-ui");
        pongMenu.style.display = "none";
        pongUI.style.display = "block";
        this.ball.serve(1);
    }

    pauseToggle() {
        let pauseBTN = document.getElementById("pause-toggle");
        if (this.state.gameRunning) {
            pauseBTN.innerHTML = "Play"
            this.setState({gameRunning: false});
        } else {
            pauseBTN.innerHTML = "Pause"
            this.setState({gameRunning: true}, () => window.requestAnimationFrame(this.pongLoop, ctx));
        }
        
    }

    stop() {
        this.setState({gameRunning: false});
        let pongMenu = document.getElementById("pong-menu"), pongUI = document.getElementById("pong-ui");
        pongMenu.style.display = "flex";
        pongUI.style.display = "none";
        this.setState({p1_score: 0, p2_score: 0});
        this.reset();
        this.loadGame();
    }

    pongLoop() {
        let update = this.update, draw = this.draw;
        if (this.state.gameRunning) {
            if (keys[37]) {
                if (this.player_one.x !== 0) { // MOVE LEFT
                    this.player_one.update(this.player_one.x - PLAYER_VEL, -B_XVEL_PASS);
                }
            } else if (keys[39]) {
                if (((this.player_one.x + 75) <= this.pCwidth)) { // MOVE RIGHT
                    this.player_one.update(this.player_one.x + PLAYER_VEL, B_XVEL_PASS);
                }
            } else if (!keys[37] || !keys[39]) { 
                this.player_one.update(this.player_one.x, 0)
            } 
            ctx.clearRect(0, 340, 300, 10);
            ctx.clearRect(0, 0, 300, 10);
            update();
            draw();
            window.requestAnimationFrame(this.pongLoop, ctx);
        }
    }

    initDraw() {
        this.player_one.draw();
        this.player_two.draw();
        this.ball.draw();
    }

    pMove(event){
        if(event.keyCode === 37) { // MOVING LEFT
            keys[37] = true;
        } else if (event.keyCode === 39) { // MOVING RIGHT
            keys[39] = true;
        }
    }
    pNoMove(event) {
        if(event.keyCode === 37) { // Released LEFT
            keys[37] = false;
        } else if (event.keyCode === 39) { // Released RIGHT
            keys[39] = false;
        }
    }

    update() {
        let bx = this.ball.getX();
        this.player_two.update(bx);
        let xb1 = this.player_one.getPosVel(),
            xb2 = this.player_two.getPosVel();
        this.ball.update(xb1, xb2);
    }
    draw() {
        this.player_one.draw();
        this.player_two.draw();
        this.ball.draw();
    }
    reset() {
        this.player_one.reset();
        this.player_two.reset();
        this.ball.reset();
    }

    scoreHandler(player) {
        if (player === 1) { // Player 1 scored
            this.setState({p1_score: this.state.p1_score + 1}, () => this.score(player));
        
        } else if (player === 2) { // Player 2 scored
            this.setState({p2_score: this.state.p2_score + 1}, () => this.score(player));
        }
    }

    score(player) {
        let scoreChange;
        if (player === 1) {
            // player scored
            scoreChange = document.getElementById("p1-score")
            scoreChange.innerHTML = this.state.p1_score;
        } else if (player === 2) {
            // AI scored
            scoreChange = document.getElementById("p2-score")
            scoreChange.innerHTML = this.state.p2_score;
        }
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.pMove, false);
        document.removeEventListener("keyup", this.pNoMove, false);
    }

    render () {
        return (
          <div id="container">
            <div id="pong-container">
              <canvas id="pong-canvas" ref={this.pCanvasRef} />
              <hr id="border-line" />
              <div id="pong-menu">
                  <button id="play-button" onClick={this.start}>PLAY!</button>
                  <p id="menu-instr">Use the Arrow Keys to move!</p>
                  <p>You're the guy at the bottom</p>    
              </div>
              <div id="pong-ui">
                  <div id="pong-ui-cont">
                      <div id="upper-ui">
                          <p id="p2-score">0</p>
                          <p className="ui-button" id="pause-toggle" onClick={this.pauseToggle} >Pause</p>
                      </div>
                      <div id="lower-ui">
                          <p id="p1-score">0</p>
                          <p className="ui-button" id="endGame" onClick={this.stop} >End Game</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
            
            
        );
    }
    
}

export default Pong;