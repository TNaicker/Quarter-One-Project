var game = new Phaser.Game(800, 400, Phaser.AUTO, '',
  {preload: preload, create: create, update: update });

//Initialization of various variables
var bullets;
var bulletTime = 0;
var enemyHolder = 0;
var waveOne = false;
var score = 0;
var waveNumber = 1;
var lives = 3;
var bossHP = 100;
var livingEnemies = [];
var playerAlive = true;
var waveTwoHP = 5;
var highScoreText = { font: "40px Chalkduster", fill: "#ffffff" };
var testScores = [];
var bulletShootTimes = 99999;

//FIREBASE STUFF
var config = {
    apiKey: "AIzaSyBNZQCDvsc9M_-NPf6tfoIt6HOmJqJCcrE",
    authDomain: "space-cat-42326.firebaseapp.com",
    databaseURL: "https://space-cat-42326.firebaseio.com",
    projectId: "space-cat-42326",
    storageBucket: "space-cat-42326.appspot.com",
    messagingSenderId: "528376739362"
  };
  firebase.initializeApp(config);
console.log(firebase);

var database = firebase.database();
var ref = database.ref('scores');
var retRef = database.ref('scores');

retRef.on('value', gotData, notData);

function gotData(data) {
  testScores = [];
  var fullScores = data.val();
  var keys = Object.keys(fullScores);
  // console.log(keys);
  for(var x = 0; x < keys.length; x++) {
    var k = keys[x];
    var name = fullScores[k].name;
    var theScores = fullScores[k].score;
    testScores.push(fullScores[k].score);
  }
  testScores.sort(function(x, y) {
    return y - x;
  })
  console.log(testScores);
}
function notData(nope) {
  console.log("ERROR");
  console.log(nope);
}

function preload() {

  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

  //Just loading shit
  game.load.spritesheet('player', 'img/cat_fighter_sprite1.png', 50, 50);
  game.load.spritesheet('bullets', 'img/bullets.png', 32, 32);
  game.load.spritesheet('enemy1', 'img/mon1.png', 50, 50);
  game.load.spritesheet('enemy2', 'img/mon2.png', 64, 64);
  game.load.spritesheet('enemy3', 'img/mon3.png', 64, 64);
  game.load.spritesheet('enemy4', 'img/mon4.png', 64, 64);
  game.load.spritesheet('boss', 'img/bosscat.png', 390, 400);
  game.load.image('background', 'img/background.png');
  game.load.image('GameOver', 'img/GameOver.jpg');

}
function create() {

  // Background for the game
  background = game.add.tileSprite(0, 0, 900, 600, 'background');

  //Adding player + animations
  player = game.add.sprite(0, 0, 'player');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.collideWorldBounds = true;
  player.anchor.setTo(0.5);
  move = player.animations.add('shoot', [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 0]);

  //Boss sprite
  bossGroup = game.add.group();
  var boss = bossGroup.create(900, 20, 'boss');
  boss.scale.x *= -1;
  bossGroup.visible = false;
  game.physics.enable(bossGroup, Phaser.Physics.ARCADE);

  // enemy groups
  enemyGroup2 = game.add.group();
  enemyGroup3 = game.add.group();
  enemyGroup4 = game.add.group();
  enemyGroup5 = game.add.group();
  enemyGroup1 = game.add.group();

  //Creating enemy groups here and hiding the later waves.
  makeEnemyGroup(enemyGroup1, 'enemy1');
  makeEnemyGroup(enemyGroup2, 'enemy2');
  enemyGroup2.visible = false;
  makeEnemyGroup(enemyGroup3, 'enemy3');
  enemyGroup3.visible = false;
  makeEnemyGroup(enemyGroup4, 'enemy4');
  enemyGroup4.visible = false;

  //Giving enemies physics and animations
  game.physics.enable(enemyGroup1, Phaser.Physics.ARCADE);
  enemyGroup1.callAll('animations.add', 'animations', 'moving', [1, 2, 3]);
  enemyGroup1.callAll('animations.add', 'animations', 'dying', [10, 11, 12, 13, 14, 15]);
  enemyGroup1.callAll('play', null, 'moving', 5, true);
  //Group 2
  game.physics.enable(enemyGroup2, Phaser.Physics.ARCADE);
  enemyGroup2.callAll('animations.add', 'animations', 'moving', [1, 2, 3]);
  enemyGroup2.callAll('play', null, 'moving', 5, true);
  //Group 3
  game.physics.enable(enemyGroup3, Phaser.Physics.ARCADE);
  enemyGroup3.callAll('animations.add', 'animations', 'moving', [1, 2, 3,]);
  enemyGroup3.callAll('play', null, 'moving', 5, true);
  //Group 4
  game.physics.enable(enemyGroup4, Phaser.Physics.ARCADE);
  enemyGroup4.callAll('animations.add', 'animations', 'moving', [1, 2, 3]);
  enemyGroup4.callAll('play', null, 'moving', 5, true);

  // bullet group
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(1000, 'bullets');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);
  bullets.callAll('animations.add', 'animations', 'moving', [1, 2, 3]);
  bullets.callAll('play', null, 'moving', 5, true);

  // Enemy Bullet group
  enemyBullets = game.add.group();
  enemyBullets.enableBody = true;
  enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
  enemyBullets.createMultiple(1000, 'bullets', 4);
  enemyBullets.setAll('anchor.x', 0.5);
  enemyBullets.setAll('anchor.y', 1);
  enemyBullets.setAll('scale.x', -1);
  enemyBullets.setAll('outOfBoundsKill', true);
  enemyBullets.setAll('checkWorldBounds', true);
  enemyBullets.callAll('animations.add', 'animations', 'moving', [4, 5, 6]);
  enemyBullets.callAll('play', null, 'moving', 5, true);

  //This makes the enemies fire bullets
  game.time.events.repeat(300, bulletShootTimes, enemyFireBullet, this);

  //For user input
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
  unpauseButton = game.input.keyboard.addKey(Phaser.Keyboard.I);

  game.input.mouse.capture = true;


}
function update() {

  //This moves the background
  background.tilePosition.x -= 2;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  //This checks for collision between these two and runs playerHitEnemy when they end up colliding
  game.physics.arcade.overlap(bullets, enemyGroup1, playerHitEnemy);
  game.physics.arcade.overlap(enemyBullets, player, enemyHitPlayer);

  //This is to keep the player from moving when pressing nothing
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;

  //If statements for user input.
  if(cursors.up.isDown){
    player.body.velocity.y -= 150;
  }else if(cursors.down.isDown) {
    player.body.velocity.y += 150;
  }
  if(cursors.left.isDown) {
    player.body.velocity.x -= 200;
  }else if(cursors.right.isDown) {
    player.body.velocity.x += 200;
  }
    if(fireButton.isDown) {
      fireBullet();
      player.animations.play('shoot', 15, true);
    }else{
      player.animations.stop();
      player.frame = 0;
    }
  if(pauseButton.isDown) {
    game.paused = true;
  }
  if(unpauseButton.isDown) {
    game.paused = false;
  }

  //===========For debugging purposes===========
  game.debug.text("Current Wave: " + waveNumber, 300, 350);
  game.debug.text("DEBUG TEXT: " + enemyHolder, 100, 350);
  game.debug.text("SCORE: " + score, 100, 370);
  game.debug.text("Player velocity X & Y: " + player.body.velocity.x + " " + player.body.velocity.y, 100, 390);
  game.debug.text("BOSS HP: " + bossHP, 300, 370);
  game.debug.text("TIME: " + game.time.now / 1000, 400, 390);

  // These if statements spawn the later waves if the previous wave is killed
  if(enemyHolder <= 300){
    enemyGroup2.visible = true;
    game.physics.arcade.overlap(bullets, enemyGroup2, playerHitEnemy2);
    waveNumber = 2;
  }
  if(enemyHolder <= 200) {
    enemyGroup3.visible = true;
    game.physics.arcade.overlap(bullets, enemyGroup3, playerHitEnemy3);
    waveNumber = 3;
  }
  if(enemyHolder <= 100) {
    enemyGroup4.visible = true;
    game.physics.arcade.overlap(bullets, enemyGroup4, playerHitEnemy4);
    waveNumber = 4;
  }
  if(enemyHolder === 0) {
    bossGroup.visible = true;
    game.physics.arcade.overlap(bullets, bossGroup, playerHitBoss);
    waveNumber = "BOSS";
  }


}

//I don't remember what this is but it'll be something I guess
function moveDown() {

}
// ===============================================================================================================FUNCTIONS========================================================================================================================



//This is the function that fires the bullets. It makes checks for a bullet object in the array, then grabs the first one.
//It also maintains a proper fire rate.
function fireBullet() {

  if (game.time.now > bulletTime) {
      bullet = bullets.getFirstExists(false);

      if (bullet) {
          bullet.reset(player.x+50, player.y+15);
          bullet.body.velocity.x = 400;
          //This code determines how fast you can fire bullets.
          bulletTime = game.time.now + 100;
      }
  }
}
function enemyFireBullet() {

  if (game.time.now > bulletTime) {
      enemyBullet = enemyBullets.getFirstExists(false);

      enemyGroup1.forEach(function(baddy) {
        livingEnemies.push(baddy);
      });

      var random=game.rnd.integerInRange(0,livingEnemies.length-1);

      var shooter=livingEnemies[random];

      enemyBullet.reset(shooter.body.x, shooter.body.y);

      game.physics.arcade.moveToObject(enemyBullet, player, 200);
      firingTimer = game.time.now + 500;
      }
}

//These are the functions that handle collision
function playerHitEnemy(bullets, enemyGroup1) {
  enemyGroup1.kill();
  enemyHolder--;
  if(enemyHolder === 0){
    waveOne = true;
  }
  score++;
  // enemyGroup1.remove(baddy1);
  bullets.kill();
}
function playerHitEnemy2(bullets, enemyGroup2) {
  enemyGroup2.kill();
  score++;
  enemyHolder--;
  if(enemyHolder === 0){
    waveOne = true;
  }
  // enemyGroup1.remove(baddy1);
  bullets.kill();
}
function playerHitEnemy3(bullets, enemyGroup3) {
  enemyGroup3.kill();
  enemyHolder--;
  if(enemyHolder === 0){
    waveOne = true;
  }
  score++;
  // enemyGroup1.remove(baddy1);
  bullets.kill();
}
function playerHitEnemy4(bullets, enemyGroup4) {
  enemyGroup4.kill();
  enemyHolder--;
  if(enemyHolder === 0){
    waveOne = true;
  }
  score++;
  // enemyGroup1.remove(baddy1);
  bullets.kill();
}
//These two functions contain the win/lose conditions and then interact with firebase to update scores.
function playerHitBoss(bullets, bossGroup) {
  bossHP--;
  if(bossHP === 0) {
    bossGroup.kill();

    var bmd = game.add.bitmapData(1, 1);
    bmd.fill(0, 0, 0);
    var semiTransparentOverlay = game.add.sprite(0, 0, bmd);
    semiTransparentOverlay.scale.setTo(game.width, game.height);
    semiTransparentOverlay.alpha = 0;
    game.add.tween(semiTransparentOverlay).to({alpha:0.7}, 500, Phaser.Easing.Quadratic.In, true);

    var endTime = game.time.now;
    if(endTime / 1000 < 50) {
      score += Math.floor(endTime / 50) + lives * 100;
    }else if(endTime / 1000 < 60) {
      score += Math.floor(endTime / 100) + lives * 100;
    }else if(endTime / 1000 < 80) {
      score += Math.floor(endTime / 400) + lives * 100;
    }else {
      score += Math.floor(endTime / 1000) + lives * 100;
    }

    //WIN TEXT
    winner = game.add.text(game.width/2, game.height/2, 'YOU WIN', { font: "70px Arial", fill: "#19de65" });
    winner.anchor.setTo(0.5);
    winScore = game.add.text(game.width/2 - 40, game.height/2 + 70, 'Score: ' + score, { font: "30px Arial", fill: "#19de65" });
    winScore.anchor.setTo(0.5);

    var data = {
      name: "TKN",
      score: score
    }
    ref.push(data);
    bulletShootTimes = 0;

    game.time.events.add(5000, displayHighScoresWin, this);

    //This stops enemies from firing
    // game.time.events.stop();
  }
  score++;
  bullets.kill();
}
function enemyHitPlayer(enemyBullets, player){
  lives--;
  enemyBullets.reset(0, 200);
  if(lives <= 0) {
    playerAlive = false;
    enemyBullets.kill();

    // FOR GAMEOVER
    var bmd = game.add.bitmapData(1, 1);
    bmd.fill(0, 0, 0);
    var semiTransparentOverlay = game.add.sprite(0, 0, bmd);
    semiTransparentOverlay.scale.setTo(game.width, game.height);
    semiTransparentOverlay.alpha = 0;
    game.add.tween(semiTransparentOverlay).to({alpha:0.9}, 500, Phaser.Easing.Quadratic.In, true);
    gameover = game.add.sprite(game.width/2, game.height/2, 'GameOver');
    gameover.anchor.setTo(0.5);
    //This stops the enemy from firing
    // game.time.events.stop();
    var data = {
      name: "TKN",
      score: score
    }
    ref.push(data);
    bulletShootTimes = 0;

    yourScore = game.add.text(game.width/2 - 40, game.height/2 + 70, 'Score: ' + score, { font: "30px Arial", fill: "#ffffff" });
    yourScore.anchor.setTo(0.5);

    game.time.events.add(5000, displayHighScores, this);



  }
  player.kill();
}

//These are the functions that handle making the enemies etc.
function makeEnemyGroup(group, type) {
  for(var x = 0; x < 10; x++) {
    for(var y = 0; y < 10; y++){
      // baddy = group.create(200 + Math.random()*500, 50 + Math.random()*200, type);
      enemyHolder++
      baddy = group.create(480 + x*33, 50 + y*33, type);
      baddy.anchor.setTo(0.5);
      baddy.scale.x *= -1
      var tween = game.add.tween(baddy).to( { x: baddy.x-20 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

      tween.onLoop.add(descend, this);
    }

  }
}
function descend() {
  baddy.y-= 5;
}

//These functions display the highscores at the end
function displayHighScores() {

  gameover.visible = false;
  yourScore.visible = false;
  scoresTitle = game.add.text(game.width/2, game.height/2 - 150, 'HIGHSCORES', { font: "70px Chalkduster", fill: "#ffffff" });
  scoresTitle.anchor.setTo(0.5);

  hiScore1 = game.add.text(game.width/2, game.height/2 - 50, '1: ' + testScores[0], highScoreText);
  hiScore1.anchor.setTo(0.5);
  hiScore2 = game.add.text(game.width/2, game.height/2, '2: ' + testScores[1], highScoreText);
  hiScore2.anchor.setTo(0.5);
  hiScore3 = game.add.text(game.width/2, game.height/2 + 50, '3: ' + testScores[2], highScoreText);
  hiScore3.anchor.setTo(0.5);
  hiScore4 = game.add.text(game.width/2, game.height/2 + 100, '4: ' + testScores[3], highScoreText);
  hiScore4.anchor.setTo(0.5);
  hiScore5 = game.add.text(game.width/2, game.height/2 + 150, '5: ' + testScores[4], highScoreText);
  hiScore5.anchor.setTo(0.5);

  game.time.events.stop();


}
function displayHighScoresWin() {
    winner.visible = false;
    winScore.visible = false;

    scoresTitle = game.add.text(game.width/2, game.height/2 - 150, 'HIGHSCORES', { font: "70px Chalkduster", fill: "#ffffff" });
    scoresTitle.anchor.setTo(0.5);

    hiScore1 = game.add.text(game.width/2, game.height/2 - 50, '1: ' + testScores[0], highScoreText);
    hiScore1.anchor.setTo(0.5);
    hiScore2 = game.add.text(game.width/2, game.height/2, '2: ' + testScores[1], highScoreText);
    hiScore2.anchor.setTo(0.5);
    hiScore3 = game.add.text(game.width/2, game.height/2 + 50, '3: ' + testScores[2], highScoreText);
    hiScore3.anchor.setTo(0.5);
    hiScore4 = game.add.text(game.width/2, game.height/2 + 100, '4: ' + testScores[3], highScoreText);
    hiScore4.anchor.setTo(0.5);
    hiScore5 = game.add.text(game.width/2, game.height/2 + 150, '5: ' + testScores[4], highScoreText);
    hiScore5.anchor.setTo(0.5);

    game.time.events.stop();
}
