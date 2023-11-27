Player = function(game, canvas) {
  // La scène du jeu
  this.scene = game.scene;

  // Initialisation de la caméra
  this._initCamera(this.scene, canvas);
};

Arena = function(game) {
  this.game = game;
  var scene = game.scene;

  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0.3, 0.6, 0),
    scene
  );
  light.intensity = 0.7;
  glo.light = light;
};

Player.prototype = {
  _initCamera : function(scene, canvas) {

    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      -glo.cam_pose,
      new BABYLON.Vector3.Zero(),
      scene
    );

    this.camera.attachControl(canvas, true);
    this.camera.inputs.attached.keyboard.detachControl();
    this.camera.lowerAlphaLimit = null;
    this.camera.upperAlphaLimit = null;
    this.camera.lowerBetaLimit = null;
    this.camera.upperBetaLimit = Math.PI;
    glo.camera = this.camera;
    glo.camera_start_orientation = {
      alpha: glo.camera.alpha,
      beta: glo.camera.beta,
    };
    glo.camera_target = this.camera.getTarget();
  }
}

Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true, {doNotHandleContextLost: true});
    engine.enableOfflineSupport = false;
    var _this = this;

    this.scene = this._initScene(engine);

	//***************************LANCE LE PLAYER***************************//
	var _player = new Player(_this, canvas);
	//***************************LANCE L'ARENA***************************//
	var _arena = new Arena(_this);
  _this.scene.executeWhenReady(function () {
    engine.runRenderLoop(function () {
	    if(meshes.length > 0 && !glo.mode.pause){
            if(glo.mode.cameraFollowMesh){ cameraFollowMesh(); }
            
            calcul_gravity();
        }
      _this.scene.render();
    });
  });

    // Ajuste la vue 3D si la fenetre est agrandi ou diminué
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);
};


Game.prototype = {
    // Prototype d'initialisation de la scène
    _initScene : function(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearCachedVertexData();
        scene.cleanCachedTextureBuffer();
        scene.clearColor=new BABYLON.Color3(0,0,0);

        add_gui_controls_suit(scene);
        toggle_gui_controls_suit(false);

        add_gui_controls(scene);
        //add_button(scene);

        scene.collisionsEnabled = false;

        glo.scene = scene;

        return scene;
    }
};

var g = new Game('renderCanvas');
