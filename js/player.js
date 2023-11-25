const PI = Math.PI;

var num_mesh = 0;
var pause = false;
var Sujet = class {
	constructor(masse, postion, vitesse){

  }
}
var glo = {
	mode:{
		pause: false,
		particule: false,
		first_particule: false,
		light: false,
		random: false,
		texture: false,
		random_taille: false,
		pose_fixe: false,
		gui_visible: true,
		gui_suit_visible: true,
		slider: true,
		collision: false,
		multi_wall_visible: false,
		wall_visible: false,
		trail: false,
		meta_mesh: false,
		cible: false,
		inv_g: false,
		rotate_mesh: false,
		box: false,
		numero: false,
		cameraFollowMesh: true,
	},
	mode_check:{
		parent: this,
		checks:[
			{text: "Trainées", name: "trail", state: false},
			{text: "Collision", name: "collision", state: false,
				/*callback: function(){
					this.parent.glo.headers.getHeader('lim_cohesion').text = "Distance limite de cohésion: " + this.parent.glo.lim_cohesion;
				},**/
			},
			{text: "Méta", name: "meta_mesh", state: false},
			{text: "Pose fixe", name: "pose_fixe", state: false},
			{text: "Sélection", name: "selection", state: false},
			{text: "Delete", name: "suppression", state: false},
			{text: "Cible", name: "cible", state: false},
			{text: "Link", name: "link", state: false},
			{text: "Closest", name: "link_closest", state: false},
			{text: "Invisible", name: "visibility", state: false},
			{text: "Inverse G", name: "inv_g", state: false, callback: function(){
				inverse_g(meshes);
			}},
			{text: "Visée", name: "wall_visible", state: false, callback: function() {
					var pos = {x: glo.camera.position.x, y: glo.camera.position.y, z: glo.camera.position.z};
					wall_visible(!glo.mode.wall_visible, pos, 18, 5, 0.2112);
				}
			},
			{text: "Cube", name: "box", state: false},
			{text: "Rotation", name: "rotate_mesh", state: false},
			{text: "Numéro", name: "numero", state: false,
				callback: function(){
					num_meshes(meshes);
				}
			},
			{text: "Pause", name: "pause", state: false},
		],
		invCheck: function(name){
			var checks_length = this.checks.length;
			for(var i = 0; i < checks_length; i++){
				if(this.checks[i].name == name){
					this.checks[i].state = !this.checks[i].state;
					if(typeof(this.checks[i].callback) != "undefined"){ this.checks[i].callback(); }
					break;
				}
			}
			if(typeof(this.parent.glo.mode[name]) != "undefined"){ this.parent.glo.mode[name] = !this.parent.glo.mode[name]; }
		},
		setCheck: function(name, state){
			var checks_length = this.checks.length;
			for(var i = 0; i < checks_length; i++){
				if(this.checks[i].name == name){
					this.checks[i].state = state;
					if(typeof(this.checks[i].callback) != "undefined"){ this.checks[i].callback(); }
					break;
				}
			}
			if(typeof(this.parent.glo.mode[name]) != "undefined"){ this.parent.glo.mode[name] = state; }
		},
		getCheck: function(name){
			var checks_length = this.checks.length;
			for(var i = 0; i < checks_length; i++){
				if(this.checks[i].name == name){ return this.checks[i].state; }
			}
		}
	},
	trail: {
		diameter: 0.2,
		length: 60,
		autoStart: true,
		color: true,
	},
	formes:{
		parent: this,
		select:[
			{text: "Cube", pow_nb_particules: 3, selected: true, mult_nb_particules: 1, check: true, },
			{text: "Carrée", pow_nb_particules: 2, selected: false, mult_nb_particules: 1, check: false, },
			{text: "One", pow_nb_particules: 2, selected: false, mult_nb_particules: 1, check: false, },
			{text: "Sphère Y", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false,
				formule: function(n){
					if(n%2 != 0){
						return (n* Math.floor(n/2)) + 2;
					}
					return n*(n/2 - 1) + 2;
				},
			},
			{text: "Sphère Q", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false,
			formule_pair: "n*(n/2 - 1) + 2", formule_impair: "n*arrondi_entier_inferieur(n/2) + 2"},
			{text: "Cercle", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false, },
			{text: "Cercles", pow_nb_particules: 1, selected: false, mult_nb_particules: 6, check: false, },
			{text: "Pyramide", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false,
				formule: function(n){
					var n_particules_to_return = 0;
					for(var i = n; n > 0; n-=2){
						n_particules_to_return += Math.pow(n, 2);
					}

					return n_particules_to_return;
				},
			},
			{text: "Spirale", pow_nb_particules: 1, selected: false, mult_nb_particules: 6, check: false, },
			{text: "Spirale 3D", pow_nb_particules: 1, selected: false, mult_nb_particules: 6, check: false, },
			//{text: "Coquillage", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false, },
			{text: "Tore", pow_nb_particules: 2, selected: false, mult_nb_particules: 1, check: false, },
			{text: "ToreTest", pow_nb_particules: 2, selected: false, mult_nb_particules: 1, check: false, },
			//{text: "Vortex", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false, },
			//{text: "SpiBoat", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false, },
			{text: "Test", pow_nb_particules: 1, selected: false, mult_nb_particules: 1, check: false, },
		],
		options:{
			rot_1: "z",
			rot_2: "y",
			rot_1_num: 3,
			rot_2_num: 2,
			div_rot_1:{x: 1, y: 1, z: 1},
			div_rot_2:{x: 1, y: 1, z: 1},
			angle_1:{from: 0, to: 360},
			angle_2:{from: 0, to: 360},
			pos: {x: 0, y: 6, z: 0},
			getRot1: function(){
				switch (this.rot_1_num) {
					case 1:
						return "x";
					case 2:
						return "y";
					case 3:
						return "z";
				}
			},
			getRot2: function(){
				switch (this.rot_2_num) {
					case 1:
						return "x";
					case 2:
						return "y";
					case 3:
						return "z";
				}
			},
			raz: function(){
				this.rot_1 = "z";
				this.rot_2 = "y";
				this.div_rot_1 = {x: 1, y: 1, z: 1};
				this.div_rot_2 = {x: 1, y: 1, z: 1};
				this.angle_1 = {from: 0, to: 360};
				this.angle_2 = {from: 0, to: 360};
			},
		},
		setFormeSelect: function(txt){
			this.select.map(sel => {
				if(sel.text == txt){ sel.selected = true; }
				else{ sel.selected = false; }
			});
		},
		getFormeSelect: function(){
			var select_length = this.select.length;
			for(var i = 0; i < select_length; i++){
				if(this.select[i].selected){ return this.select[i]; break; }
			}
		},
	},
	bab_colors:{
		emissive_fixe: new BABYLON.Color3(155 / 666, 255 / 666, 245 / 666),
		diffuse_fixe: new BABYLON.Color3(155 / 166, 255 / 166, 245 / 166),
	},
	rotation_self: {
		x: .012, y: .12, z: .2,
		set: function(x, y, z){
			this.x = x;
			this.y = y;
			this.z = z;
		},
	},
	text: {
		pos:{
			x: 25, y: 150,
			set: function(x, y){
				this.x = x;
				this.y = y;
			},
		},
		size: 84,
	},
	temps: 1,
	scale: 0,
	moveDistMeshesByKey : 0.178,
	camera_start_alpha: Math.PI * 1.5,
	camera_start_beta: Math.PI * 1.5,
	form_select: "Cube",
	material_type_index_select: 0,
	closest_precision: 0.1,
	material_type_select: 'standard',
	materials_type: ['standard', 'cloud', 'alpha', 'wireframe'],
	gui_type_index_select: 0,
	gui_type_select: 'main',
	guis_type: ['main', 'second'],
	form_mesh_index_select: 0,
	form_mesh_select: 'sphere',
	forms_mesh: ['sphere', 'box', 'line', 'custom'],
	id_meta_mesh: 0,
	alpha_diffuse: 1,
	alpha_emissive: 1,
	scale_echelle: 16,
	cam_dist: 12,
	cam_pose: 18,
	modulation: 500,
	var_masse: 5,
	nb_particules: 5,
	masse_particules: 0.01,
	ecart_particules: 1,
	taille_mesh: 7/25,
	cohesion: 1,
	cohesion_posee: 1.00000,
	echelle_cohesion: 100000,
	echelle: 1,
	echelle_lin: 1,
	echelle_vitesse: 0.01,
	echelle_taille: 25,
	lim_newton: 1,
	lim_cohesion: 0,
	var_taille: 0,
	vitesse_pose_x: 0,
	vitesse_pose_y: 0,
	vitesse_pose_z: 0,
	echelle_vitesse_cible: 1,
	div_diffuse_color: 166,
	div_emissive_color: 666,
	div_ambiant_color: 255,
	rot: 0.5,
	trail_length: 60,
	coeff_spiral: 500,
	nb_clo: 0,
	first_line: true,
	sliders_val: [],
	walls: [],
	trails: [],
	headers: [],
	panels_right: [],
	sliders_right: [],
	headers_suit: [],
	headers_radios: [],
	panels_right_suit: [],
	sliders_right_suit: [],
	panels_left: [],
	sliders_left: [],
	panels_left_suit: [],
	sliders_left_suit: [],
	panels_buttons: [],
	buttons: [],
	checkboxes: [],
	url_texture: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/4013c234-b843-4331-84cd-8a86d940d26f/dcrbmun-38493001-d0cc-4bd6-9acb-2bf1109b488b.jpg",
};

glo.checkboxes.getCheck = function(name){
	var check_length = glo.checkboxes.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.panels_left.getPanel = function(name){
	var check_length = glo.panels_left.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.panels_right.getPanel = function(name){
	var check_length = glo.panels_right.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.sliders_right.getSlider = function(name){
	var check_length = glo.sliders_right.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.headers.getHeader = function(name){
	var check_length = glo.headers.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.headers.changeColor = function(color){
	this.map(header => {
		header.color = color;
	});
};
glo.headers_radios.getHeader = function(name){
	var check_length = glo.headers_radios.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.headers_radios.changeColor = function(color){
	this.map(header => {
		header.color = color;
	});
};
glo.headers_suit.getHeader = function(name){
	var check_length = glo.headers_suit.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.headers_suit.changeColor = function(color){
	this.map(header => {
		header.color = color;
	});
};
glo.panels_right_suit.getPanel = function(name){
	var check_length = glo.panels_right_suit.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.sliders_right_suit.getSlider = function(name){
	var check_length = glo.sliders_right_suit.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.sliders_left.getSlider = function(name){
	var check_length = glo.sliders_left.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.panels_left_suit.getPanel = function(name){
	var check_length = glo.panels_left_suit.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.panels_buttons.getPanel = function(name){
	var check_length = glo.panels_buttons.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};
glo.buttons.getButton = function(name){
	var check_length = glo.buttons.length
	for (var i = 0; i < check_length; i++) {
		if(this[i].name == name){
			return this[i];
		}
	}
};

var o = glo.formes.options;

var glo_save = {};

var mode_moyenne = true;
var is_acceleration = false;

Player = function(game, canvas) {
    // La scène du jeu
    this.scene = game.scene;

    // Initialisation de la caméra
    this._initCamera(this.scene, canvas);
};

/*Player.prototype = {
	_initCamera: function(scene, canvas) {
	  this.camera = new BABYLON.ArcRotateCamera(
		"Camera",
		Math.PI / 2,
		Math.PI / 2,
		-glo.cam_pose,
		new BABYLON.Vector3.Zero(),
		scene
	  );
  
	  this.camera.attachControl(canvas, true);
	  this.camera.setPosition(new BABYLON.Vector3(this.camera.position.x + 18, this.camera.position.y, this.camera.position.z));
	  this.camera.lowerAlphaLimit = null;
	  this.camera.upperAlphaLimit = null;
	  this.camera.lowerBetaLimit = null;
	  this.camera.upperBetaLimit = Math.PI;
	  glo.camera = this.camera;
	  glo.camera_target = this.camera.getTarget();
	}
  };*/

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
  
const toreRots = [
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 0,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 0,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 0,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 0,
	  "y2": 1,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 0,
	  "z2": 1
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 0
	},
	{
	  "x1": 1,
	  "y1": 1,
	  "z1": 1,
	  "x2": 1,
	  "y2": 1,
	  "z2": 1
	}
  ];

  function* getToreRotsGen(){
	var index = -1;
	var tab   = toreRots;
	while(true){
		  index++;
		  if(index == tab.length){ index = 0; }
	  yield tab[index];
	}
  }

getToreRots = getToreRotsGen();
