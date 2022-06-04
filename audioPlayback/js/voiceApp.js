// this module is all the logic for the voice playback app

function VoiceAppStateManager() {
	// enum
	this.State = {
		Idle: "idle",
		Recording: "recording",
		Reviewing: "reviewing"
	};

	const DOM_ActionButton = document.getElementById("actionButton");
	const DOM_TextField = document.getElementById("textfield");
	const DOM_Waveforms = document.getElementById("waveforms");

	var currentState = this.State.Idle;

	// public function:
	// this.functionName = () => {...}

	// private function:
	// var functionName = () => {...}

	this.initialize = () => {
		DOM_ActionButton.addEventListener("click", this.nextState)
	}

	this.nextState = () => {
		switch (currentState) {
			case this.State.Idle:
				this.transitionState(this.State.Recording)
				break;
			case this.State.Recording:
				this.transitionState(this.State.Reviewing)
				break;
			case this.State.Reviewing:
				this.transitionState(this.State.Idle)
				break;
		}
	}

	this.transitionState = (state) => {
		switch (state) {
			case this.State.Idle:
				if (currentState == this.State.Reviewing)
					changeState(state);
				break;
			case this.State.Recording:
				if (currentState == this.State.Idle)
					changeState(state);
				break;
			case this.State.Reviewing:
				if (currentState == this.State.Recording)
					changeState(state);
				break;
		}
		// reset to Idle
	}

	var changeState = (state) => {
		switch (state) {
			case this.State.Idle:
				changeStateIdle();
				break;
			case this.State.Recording:
				changeStateRecording();
				break;
			case this.State.Reviewing:
				changeStateReviewing();
				break;
			default:
				//reset to State.Idle
				break;
		}
	}

	var changeStateIdle = () => {
		// stop actions
		// change button
		// change textfield text
		console.log("idle");
		currentState = this.State.Idle;
	}

	var changeStateRecording = () => {
		// stop actions
		// change button
		// change textfield text
		console.log("recording");
		currentState = this.State.Recording;
	}

	var changeStateReviewing = () => {
		// stop actions
		// change button
		// change textfield text
		console.log("reviewing");
		currentState = this.State.Reviewing;
	}
}

new VoiceAppStateManager().initialize();
