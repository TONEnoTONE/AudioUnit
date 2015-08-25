define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Master", 
	"Tone/core/Types", "Tone/core/Schedulable"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Base class for sources. Sources have start/stop methods
	 *          and the ability to be synced to the 
	 *          start/stop of Tone.Transport.
	 *
	 *  @constructor
	 *  @extends {Tone.Schedulable}
	 */	
	Tone.Source = function(options){
		//unlike most ToneNodes, Sources only have an output and no input
		Tone.Schedulable.call(this, 0, 1);
		options = this.defaultArg(options, Tone.Source.defaults);

		/**
		 * The volume of the output in decibels.
		 * @type {Decibels}
		 * @signal
		 * @example
		 * source.volume.value = -6;
		 */
		this.volume = new Tone.Signal({
			"param" : this.output.gain,
			"value" : options.volume,
			"units" : Tone.Type.Decibels
		});
		this._readOnly("volume");

		/**
		 * 	keeps track of the timeout for chaning the state
		 * 	and calling the onended
		 *  @type {number}
		 *  @private
		 */
		this._timeout = -1;

		//make the output explicitly stereo
		this.output.channelCount = 2;
		this.output.channelCountMode = "explicit";
	};

	Tone.extend(Tone.Source, Tone.Schedulable);

	/**
	 *  The default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Source.defaults = {
		"volume" : 0,
	};

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.Source#
	 *  @name state
	 */
	Object.defineProperty(Tone.Source.prototype, "state", {
		get : function(){
			return this._getStateAtTime(this.now());
		}
	});

	/**
	 *  Start the source at the specified time. If no time is given, 
	 *  start the source now.
	 *  @param  {Time} [time=now] When the source should be started.
	 *  @returns {Tone.Source} this
	 *  @example
	 * source.start("+0.5"); //starts the source 0.5 seconds from now
	 */
	Tone.Source.prototype.start = function(time){
		time = this.toSeconds(time);
		if (this._getStateAtTime(time) !== Tone.State.Started || this.retrigger){
			this._setStateAtTime(Tone.State.Started, time);
			this._start.apply(this, arguments);
		}
		return this;
	};

	/**
	 *  Stop the source at the specified time. If no time is given, 
	 *  stop the source now.
	 *  @param  {Time} [time=now] When the source should be stopped. 
	 *  @returns {Tone.Source} this
	 *  @example
	 * source.stop(); // stops the source immediately
	 */
	Tone.Source.prototype.stop = function(time){
		time = this.toSeconds(time);
		if (this._getStateAtTime(time) === Tone.State.Started){
			this._setStateAtTime(Tone.State.Stopped, time);
			this._stop.apply(this, arguments);
		}
		return this;
	};

	/**
	 *  Sync the source to the Transport so that when the transport
	 *  is started, this source is started and when the transport is stopped
	 *  or paused, so is the source. 
	 *
	 *  @param {Time} [delay=0] Delay time before starting the source after the
	 *                               Transport has started. 
	 *  @returns {Tone.Source} this
	 *  @example
	 * //sync the source to start 1 measure after the transport starts
	 * source.sync("1m");
	 * //start the transport. the source will start 1 measure later. 
	 * Tone.Transport.start();
	 */
	Tone.Source.prototype.sync = function(delay){
		/*Tone.Transport.syncSource(this, delay);
		Tone.Transport.on("start", this.start.bind(this));
		Tone.Transport.on("stop", this.start.bind(this));*/
		return this;
	};

	/**
	 *  Unsync the source to the Transport. See Tone.Source.sync
	 *  @returns {Tone.Source} this
	 */
	Tone.Source.prototype.unsync = function(){
		// Tone.Transport.unsyncSource(this);
		return this;
	};

	/**
	 *	Clean up.
	 *  @return {Tone.Source} this
	 */
	Tone.Source.prototype.dispose = function(){
		this.stop();
		Tone.Schedulable.prototype.dispose.call(this);
		this._writable("volume");
		this.volume.dispose();
		this.volume = null;
	};

	return Tone.Source;
});