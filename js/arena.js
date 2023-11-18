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
