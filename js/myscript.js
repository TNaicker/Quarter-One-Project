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
var bossHP = 300;
var livingEnemies = [];
var playerAlive = true;
var waveTwoHP = 5;

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
  game.load.image('background', 'img/background.png')

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
  bossGroup.create(400, 20, 'boss');
  bossGroup.visible = false;
  // boss = game.add.sprite(900, 20, 'boss');
  // boss.scale.setTo(-1, 1);
  // boss.visible = false;
  game.physics.enable(bossGroup, Phaser.Physics.ARCADE);

  // enemy groups
  enemyGroup2 = game.add.group();
  enemyGroup3 = game.add.group();
  enemyGroup4 = game.add.group();
  enemyGroup5 = game.add.group();
  enemyGroup1 = game.add.group();

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

  game.time.events.repeat(1000, 99999, enemyFireBullet, this);

  //For user input
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
      // enemyFireBullet();
      player.animations.play('shoot', 15, true);
    }else{
      player.animations.stop();
      player.frame = 0;
    }

  //For debug purposes
  game.debug.text("Current Wave: " + waveNumber, 400, 350);
  game.debug.text("DEBUG TEXT: " + enemyHolder, 200, 350);
  game.debug.text("SCORE: " + score, 200, 370);
  game.debug.text("Player velocity X & Y: " + player.body.velocity.x + " " + player.body.velocity.y, 200, 390);
  game.debug.text("BOSS HP: " + bossHP, 400, 370);
  game.debug.text("GAME TIME: " + waveTwoHP, 500, 390);

  if(enemyHolder <= 300){
    bullets.destroy();
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

      game.physics.arcade.moveToObject(enemyBullet, player, 300);
      firingTimer = game.time.now + 500;
      }
}

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
  waveTwoHP--;
  if(waveTwoHP < 0){
    enemyGroup2.kill();
    score++;
  }
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

function playerHitBoss(bullets, bossGroup) {
  bossHP--;
  if(bossHP === 0) {
    bossGroup.kill();
  }
  score++;
  bullets.kill();
}

function enemyHitPlayer(enemyBullets, player){
  player.kill();
  enemyBullets.kill();
  playerAlive = false;
}
function makeEnemyGroup(group, type) {
  for(var x = 0; x < 10; x++) {
    for(var y = 0; y < 10; y++){
      // baddy = group.create(200 + Math.random()*500, 50 + Math.random()*200, type);
      enemyHolder++
      baddy = group.create(500 + x*30, 50 + y*30, type);
      baddy.anchor.setTo(0.5);
      baddy.scale.x *= -1
    }

    // var tween = game.add.tween(baddy).to( { x: 400 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //
    // tween.onLoop.add(descend, this);
  }
}

function descend() {
  baddy.x -= 10;
}
