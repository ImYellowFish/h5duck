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

		// player state
		playerfsm.state = "none";
		playerfsm.animation = null;

		// init playerfsm state
		playerfsm.init = function(){
			playerfsm.goto("idle", false);

			if(playerfsm.basefsm){
				playerfsm.basefsm.init();
			}
		}

		// go to some state and play animation
		playerfsm.goto = function(tostate, enableSelfTransition){
			if(playerfsm.state == tostate){
				if(enableSelfTransition){
					playerfsm.animation.restart();
				}else{
					return;
				}
			}
			else{
				playerfsm.state = tostate;
				playerfsm.playAnimation(tostate);
			}

			// if localplayer, send stateChange message
			if(playerfsm.player.isLocalPlayer){
				Game.sendPlayerState(tostate);
			}
		}

		playerfsm.onRemove = function(){
			if(playerfsm.timer){
				playerfsm.timer.destroy();
			}
		}

		playerfsm.playAnimation = function(animation){
			playerfsm.animation = playerfsm.player.sprite.animations.play(animation);
		}
		
// --------------------------------------------
// Local player state control
// --------------------------------------------
		playerfsm.update = function(){
			if(player.isLocalPlayer){
				// update isGrounded and isFlying


				// update idle base state
				if(playerfsm.basefsm.state === "idle"){
					playerfsm.updateIdleBaseState();
				}

				// reset isFlying
				playerfsm.isFlying = false;
			}			
		}


		playerfsm.onRespawn = function(){
			playerfsm.goto("idle", true);
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
		playerfsm.onGetHit = function(){
			if(player.isLocalPlayer){
				if(playerfsm.basefsm.state == "onhit"){
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

		// base states: idle, attack, onhit
		// -------- idle substates: idle, move, airmove0, airmove1
		// -------- attack substates: attack1, attack0
		// -------- onhit substates: onhit0, onhit1
		if(playerfsm.player.isLocalPlayer){
			playerfsm.basefsm = new StateMachine({
				transitions: [
					{name:"init", from:"none", to:"idle"},
					{name:"fire", from:["idle","attack"], to:"attack"},
					{name:"fireEnd", from:"attack", to:"idle"},
					{name:"gethit", from:["idle","attack","onhit"], to:"onhit"},
					{name:"recover", from:"onhit", to:"idle"},
				],
				methods:{
					onIdle: function(){
						playerfsm.updateIdleBaseState();
					},
					onAttack: function(){
						playerfsm.onAttackBaseState();
					},
					onOnhit: function(){
						playerfsm.onHitBaseState();
					},
				},
			});
		}


		// helpers
		playerfsm.isVxZero = function(){
			var v = playerfsm.player.sprite.body.velocity;
			return Math.abs(v.x) < config.playerIdleMaxSpeed;
		}

		playerfsm.isVyZero = function(){
			var v = playerfsm.player.sprite.body.velocity;
			return Math.abs(v.y) < config.playerIdleMaxSpeed;
		}

		return playerfsm;
	}
}