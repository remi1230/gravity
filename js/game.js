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
