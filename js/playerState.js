// --------------------------------------------
// Player state machine
// --------------------------------------------

var PlayerFSM = {
	createNew : function(player){
		var playerfsm = {};
		playerfsm.player = player;

		// parameters
		playerfsm.isGrounded = false;
		playerfsm.isFlying = false;

		// player state: idle, move, airmove0, airmove1, attack0, attack1, onhit0, onhit1, zapping, die
		playerfsm.state = "none";
		playerfsm.animation = null;
		playerfsm.zapSprite = null;
		playerfsm.deathSprite = null;


// --------------------------------------------
// API
// --------------------------------------------
		// base states: idle, attack, onhit, zapping
		// -------- idle substates: idle, move, airmove0, airmove1, die
		// -------- attack substates: attack1, attack0
		// -------- onhit substates: onhit0, onhit1
		// -------- zapping substates: zapping

		// init playerfsm state
		playerfsm.init = function(){
			playerfsm.goto("idle", false);

			if(playerfsm.basefsm){
				playerfsm.basefsm.init();
			}
		}


		// change the state of fsm
		playerfsm.goto = function(tostate, enableSelfTransition){
			// call onExit
			if(playerfsm.state == "zapping"){
				playerfsm.leaveZap();
			}else if(playerfsm.state == "die"){
				playerfsm.leaveDie();
			}

			// call onEnter
			if(tostate == "zapping"){
				playerfsm.gotoZap();
			}else if(tostate == "die"){
				playerfsm.gotoDie();
			}else{
				playerfsm.gotoDefault(tostate, enableSelfTransition);
			}
		}

		playerfsm.onRemove = function(){
			if(playerfsm.timer){
				playerfsm.timer.destroy();
			}
		}


// --------------------------------------------
// State flags
// --------------------------------------------
		// whether the sprite is visible to the camera
		playerfsm.visible = function(){
			return playerfsm.state != "zapping";
		}

		// whether the sprite can fire
		playerfsm.canFire = function(){
			return playerfsm.state != "zapping";
		}

		// wheter the sprite can move
		playerfsm.canMove = function(){
			return playerfsm.state != "zapping";
		}

		playerfsm._entangled = false;
		// if true, the sprite cannot be moved by input or gravity.
		playerfsm.entangled = function(){
			return playerfsm._entangled;
		}


// --------------------------------------------
// Helpers
// --------------------------------------------
		playerfsm.updateEffectPos = function(sprite, state){
			if(sprite && playerfsm.state == state){
				sprite.x = playerfsm.player.x;
				sprite.y = playerfsm.player.y;
				sprite.visible = playerfsm.player.isInView;
			}
		}

		playerfsm.isVxZero = function(){
			var v = playerfsm.player.sprite.body.velocity;
			return Math.abs(v.x) < config.playerIdleMaxSpeed;
		}

		playerfsm.isVyZero = function(){
			var v = playerfsm.player.sprite.body.velocity;
			return Math.abs(v.y) < config.playerIdleMaxSpeed;
		}

		playerfsm.playAnimation = function(animation){
			playerfsm.animation = playerfsm.player.sprite.animations.play(animation);
		}

		// death check
		playerfsm.deathCheck = function(){
			if(playerfsm.player.life <= 0)
				playerfsm.player.die(player.killerID);
		}

		playerfsm.checkOnEnter = function(state){

		}

		playerfsm.checkOnExit = function(state){

		}

// --------------------------------------------
// State change functions
// --------------------------------------------
		// general goto: change state and play animation
		playerfsm.gotoDefault = function(tostate, enableSelfTransition){
			// check if we need to goto self state
			if(playerfsm.state == tostate){
				if(!enableSelfTransition){
					return;
				}
				playerfsm.animation.restart();
			}
			else{
				// change to new state and play animation
				playerfsm.state = tostate;
				playerfsm.playAnimation(tostate);
			}		

			// if localplayer, send stateChange message
			if(playerfsm.player.isLocalPlayer){
				Game.sendPlayerState(tostate);
			}

		}

		// special goto for zap state
		playerfsm.gotoZap = function(){
			playerfsm.state = "zapping";
			// create zap sprite
			if(!playerfsm.zapSprite){
				playerfsm.zapSprite = effect.createfx(playerfsm.player.x, 
					playerfsm.player.y, -playerfsm.player.direction, 'zaphit');
			}

			// if localplayer, send stateChange message
			if(playerfsm.player.isLocalPlayer){
				Game.sendPlayerState("zapping");
			}

		}

		// enter dying state
		playerfsm.gotoDie = function(){
			playerfsm.state = "die";
			// create zap sprite
			if(!playerfsm.deathSprite){
				playerfsm.deathSprite = effect.createfx(playerfsm.player.x, 
					playerfsm.player.y, 1, 'die');
			}

			// if localplayer, send stateChange message
			if(playerfsm.player.isLocalPlayer){
				Game.sendPlayerState("die");
			}

		}

		// special onExitHandler for zap state
		playerfsm.leaveZap = function(){
			if(playerfsm.zapSprite){
				playerfsm.zapSprite.kill();
			}
			playerfsm.zapSprite = null;
			playerfsm._entangled = false;
		}

		// special onExitHandler for zap state
		playerfsm.leaveDie = function(){
			playerfsm.deathSprite = null;
		}
		
		

// --------------------------------------------
// Local player state control
// --------------------------------------------
		playerfsm.update = function(){
			if(player.isLocalPlayer){
				// update isGrounded and isFlying
				playerfsm.isGrounded = playerfsm.player.sprite.body.touching.down;

				// update idle base state
				if(playerfsm.basefsm.state === "idle"){
					playerfsm.updateIdleBaseState();
				}

				// reset isFlying
				playerfsm.isFlying = false;
			}

			// update zap effect pos
			playerfsm.updateEffectPos(playerfsm.zapSprite, "zapping");
			playerfsm.updateEffectPos(playerfsm.deathSprite, "die");
		}


		playerfsm.onRespawn = function(){
			playerfsm.goto("idle", true);
			if(playerfsm.basefsm)
				playerfsm.basefsm.init();		
		}

		// called when local player fires.
		playerfsm.onFire = function(){
			if(player.isLocalPlayer){
				if(playerfsm.basefsm.state == "attack")
					playerfsm.onAttackBaseState();
				else
					playerfsm.basefsm.fire();
			}
		}

		// called when local player is hit.
		playerfsm.onGetHit = function(onhitType){
			if(player.isLocalPlayer){
				if(onhitType == "zaphit"){
					// do special treatment here
					playerfsm.basefsm.zap();
				}

				else if(playerfsm.basefsm.state == "onhit"){
					// trigger the state again
					playerfsm.onHitBaseState();
				}
				else
					playerfsm.basefsm.gethit();
			}
		}

		playerfsm.onStepMove = function(){
			playerfsm.isFlying = true;
		}

		// timer for delay operation
		playerfsm.timer = game.time.create(false);
		playerfsm.timer.start();

		
		// called when local player is in idle base state.
		// called every update.
		playerfsm.updateIdleBaseState = function(){
			if(!player.isAlive)
				return;

			if(playerfsm.isGrounded && playerfsm.isVyZero()){
				if(playerfsm.isFlying){
					playerfsm.goto("move", false);
				}else if(playerfsm.isVxZero()){
					playerfsm.goto("idle", false);
				}else{
					playerfsm.goto("move", false);
				}
			}else{
				var v = playerfsm.player.sprite.body.velocity;
				if(playerfsm.isFlying){
					playerfsm.goto("airmove0", false);
				}else{
					playerfsm.goto("airmove1", false);
				}
			}		
		}

		// called when local player enters attack base state
		playerfsm.onAttackBaseState = function(){
			if(playerfsm.isGrounded && playerfsm.isVyZero()){
				// ground attack
				playerfsm.goto("attack1", true);
			}else{
				// air attack
				playerfsm.goto("attack0", true);
			}

			playerfsm.timer.removeAll();
			playerfsm.timer.add(playerfsm.player.attackDuration, 
				function(){
					playerfsm.basefsm.fireEnd();
				}, 
				this);
		}

		// called when local player enters onhit base state
		playerfsm.onHitBaseState = function(){
			if(playerfsm.isGrounded && playerfsm.isVyZero()){
				// ground onhit
				playerfsm.goto("onhit0", true);
			}else{
				// air onhit
				playerfsm.goto("onhit1", true);
			}

			playerfsm.timer.removeAll();
			playerfsm.timer.add(playerfsm.player.onhitDuration, 
				function(){
					playerfsm.basefsm.recover();
				}, 
				this);
		}

		// called when local player enters zap state
		playerfsm.onZapBaseState = function(){
			playerfsm.goto('zapping', false);	
			playerfsm._entangled = true;
			// set timer
			playerfsm.timer.removeAll();
			playerfsm.timer.add(config.playerZapLockDuration, 
				function(){					
					playerfsm._entangled = false;
				}, 
				this);	
			playerfsm.timer.add(config.playerZapDuration, 
				function(){					
					playerfsm.basefsm.zapover();
				}, 
				this);	
		}

		// base states: idle, attack, onhit
		// -------- idle substates: idle, move, airmove0, airmove1
		// -------- attack substates: attack1, attack0
		// -------- onhit substates: onhit0, onhit1
		// -------- zapping substates: zapping
		if(playerfsm.player.isLocalPlayer){
			playerfsm.basefsm = new StateMachine({
				transitions: [
					{name:"init", from:["none","idle","attack","onhit","zapping"], to:"idle"},
					{name:"fire", from:["idle","attack"], to:"attack"},
					{name:"fireEnd", from:"attack", to:"idle"},
					{name:"gethit", from:["idle","attack","onhit"], to:"onhit"},
					{name:"recover", from:"onhit", to:"idle"},
					{name:"zap", from: ["idle","attack","onhit"], to: "zapping"},
					{name:"zapover", from: ["zapping"], to: "idle"},
				],
				methods:{
					onIdle: function(){
						playerfsm.updateIdleBaseState();
						playerfsm.deathCheck();
					},
					onAttack: function(){
						playerfsm.onAttackBaseState();
					},
					onOnhit: function(){
						playerfsm.onHitBaseState();
					},
					onZapping: function(){
						playerfsm.onZapBaseState();
					},
					onInvalidTransition: function(transition, from, to) {
				        console.warn("transition not allowed from ", from, " to ", to);
					},
				},
			});
		}


		return playerfsm;
	}
}