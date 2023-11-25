function add_gui_controls(sc){
  glo.advancedTexture                  = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, sc);
  glo.advancedTexture.useSmallestIdeal = true;

  add_text("Variation:", BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
  BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, '0px', '1%', '20%', '20px', '0%');

  add_raz_button(sc);
  addButtonsShowSwitchHelp(sc);

  add_masse_slider(sc);
  add_var_taille_slider(sc);
  add_colors_radios(sc);
  add_save_state_button(sc);
  add_restore_state_button(sc);

  add_radios(sc);

  add_nb_particules_slider(sc);
  add_masse_posee_slider(sc);
  add_ecart_slider(sc);
  add_taille_mesh_slider(sc);
  add_cohesion_posee_slider(sc)
  add_lim_newton_slider(sc);
  add_lim_cohesion_slider(sc);
  add_vitesse_x_slider(sc);
  add_vitesse_y_slider(sc);
  add_vitesse_z_slider(sc);
  add_echelle_slider(sc);

  param_controls(sc);
  param_buttons();
  mergeAllGuiElemsArrays();
}

function add_gui_controls_suit(sc){
  glo.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, sc);
  add_text("MODES:", BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
  BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP, '0px', '1%', '20%', '20px', '0%', "second");

  add_var_trail_length_slider(sc);
  add_var_trail_diameter_slider(sc);
  add_var_time_slider(sc);
  add_simple_glo_slider("closest_precision", "Closest precision", 0.01, 1, "closest_precision", "");
  add_simple_glo_slider("echelle_vitesse_cible", "Vitesse vers cible", 1, 10, "echelle_vitesse_cible", "");
  add_var_scale_slider(sc);
  add_color_picker_background_scene(sc);
  /*add_glo_slider("div_rot_1_x", "Div Rot 1 X", 0.1, 10, "div_rot_1", "x");
  add_glo_slider("div_rot_1_y", "Div Rot 1 Y", 0.1, 10, "div_rot_1", "y");
  add_glo_slider("div_rot_1_z", "Div Rot 1 Z", 0.1, 10, "div_rot_1", "z");
  add_glo_slider("div_rot_2_x", "Div Rot 2 X", 0.1, 10, "div_rot_2", "x");
  add_glo_slider("div_rot_2_y", "Div Rot 2 Y", 0.1, 10, "div_rot_2", "y");
  add_glo_slider("div_rot_2_z", "Div Rot 2 Z", 0.1, 10, "div_rot_2", "z");
  add_glo_slider("pos_x", "POS X", -10, 10, "pos", "x");
  add_glo_slider("pos_y", "POS Y", -10, 10, "pos", "y");
  add_glo_slider("pos_z", "POS Z", -10, 10, "pos", "z");
  add_glo_slider("rot_1_num", "Rot 1", 1, 3, "rot_1_num", "");
  add_glo_slider("rot_2_num", "Rot 2", 1, 3, "rot_2_num", "");
  add_glo_slider("angle_1_start", "Angle 1 Start", 0, 360, "angle_1", "from");
  add_glo_slider("angle_1_end", "Angle 1 End", 0, 360, "angle_1", "to");
  add_glo_slider("angle_2_start", "Angle 2 Start", 0, 360, "angle_2", "from");
  add_glo_slider("angle_2_end", "Angle 2 End", 0, 360, "angle_2", "to");*/

  add_checks(sc);

  param_controls_suit(sc);
}

function designButton(button){
  button.width        = 0.3;
  button.paddingRight = '10px';
  button.height       = "35px";
  button.color        = "white";
  button.cornerRadius = 10;
  button.background   = "green";
  button.fontSize     = "15%";
}

function addButtonsShowSwitchHelp(sc){
  //*********PANEL*********//
  glo.advancedTextureButton = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, sc);

  let panel                 = new BABYLON.GUI.StackPanel();
  panel.width               = 0.2;
  panel.height              = "10%";
  panel.top                 = "-5%";
  panel.paddingLeft         = "35px";
  //panel.background          = 'orange';
  panel.isVertical          = false;
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  glo.advancedTextureButton.addControl(panel);

  //*********SHOW*********//
  var button = BABYLON.GUI.Button.CreateSimpleButton("showButton", "Show/Hide");
  designButton(button);

  button.onPointerUpObservable.add(function() {
    switch(glo.gui_type_select){
      case "main":
      glo.mode.gui_visible = !glo.mode.gui_visible;
      toggle_gui_controls();

      break;
      case "second":
      glo.mode.gui_suit_visible = !glo.mode.gui_suit_visible;
      toggle_gui_controls_suit();

      break;
    }
  });
  panel.addControl(button);
  glo.panelLeftBottom = panel;

  //*********SWITCH*********//
  var button = BABYLON.GUI.Button.CreateSimpleButton("switchButton", "SWITCH");
  designButton(button);

  button.onPointerUpObservable.add(function() {
    move_in_glo_tab('guis_type', 'gui_type_select', 'gui_type_index_select');
    switch(glo.gui_type_select){
      case "main":
      toggle_gui_controls_suit(false);
      toggle_gui_controls(true);

      break;
      case "second":
      toggle_gui_controls(false);
      toggle_gui_controls_suit(true);

      break;
    }
  });
  glo.panelLeftBottom.addControl(button);

  //*********HELP*********//
  var button = BABYLON.GUI.Button.CreateSimpleButton("helpButton", "HELP");
  designButton(button);

  button.onPointerUpObservable.add(function() {
    help.toggleHelpDialog();
  });

  glo.panelLeftBottom.addControl(button);
}

function add_raz_button(sc){
  var panel = new BABYLON.GUI.StackPanel();
  panel.width = "10%";
  panel.top = "-8%";
  panel.left = "-7";
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  glo.advancedTexture.addControl(panel);

  var button = BABYLON.GUI.Button.CreateSimpleButton("but_raz", "RAZ");
  designButton(button);
  button.onPointerUpObservable.add(function() {
    raz_meshes();
    meshesList = false;
  });
  panel.addControl(button);

  //glo.buttons.push(button1);
  glo.panels_buttons.push(panel);
}
function add_save_state_button(sc){
  var panel  = new BABYLON.GUI.StackPanel();
  panel.left = "0.5%";

  glo.advancedTexture.addControl(panel);

  var button = BABYLON.GUI.Button.CreateSimpleButton("but_save_state", "SAVE");
  designButton(button);

  button.onPointerUpObservable.add(function() {
    save_meshes();
  });
  panel.addControl(button);

  glo.panels_left.push(panel);
}
function add_restore_state_button(sc){
  var panel  = new BABYLON.GUI.StackPanel();
  panel.left = "0.5%";

  glo.advancedTexture.addControl(panel);

  var button = BABYLON.GUI.Button.CreateSimpleButton("but_restore_state", "RESTORE");
  designButton(button);
  button.onPointerUpObservable.add(function() {
    restore_meshes();
  });
  panel.addControl(button);

  glo.panels_left.push(panel);
}

function add_text(text, align_h, align_v, left, padding_left, width, height, top, gui = glo.gui_type_select){
  var panel_gen = new BABYLON.GUI.StackPanel();
  panel_gen.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel_gen.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel_gen.left = left;
  panel_gen.paddingLeft = padding_left;
  panel_gen.width = width;
  panel_gen.top = top;

  glo.advancedTexture.addControl(panel_gen);

  var header_gen = new BABYLON.GUI.TextBlock();
  header_gen.text = text;
  header_gen.height = height;
  header_gen.left = left;
  header_gen.color = "white";
  panel_gen.addControl(header_gen);

  switch(gui){
    case "main":
      glo.header_gen = header_gen;
      glo.panel_gen = panel_gen;

      break;
    case "second":
      glo.header_gen_suit = header_gen;
      glo.panel_gen_suit = panel_gen;

      break;
  }
}

function add_masse_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Masses";
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.prop_value = 'none';
  slider.minimum = 0;
  slider.maximum = 10;
  slider.value = 5;
  slider.name = 'masse_var';
  slider.onValueChangedObservable.add(function (value) {
      var coeff_masse = 4/3;
      if(value < glo.var_masse){ coeff_masse = 3/4; }
      if(meshes.length > 0){
        meshes.map(sp => {
          var selection = true;
          if(glo.mode_check.getCheck("selection") && !sp.selection){ selection = false; }
          if(selection){ sp.z_masse *= coeff_masse; }
        });
      }
      glo.var_masse = value;
  });

  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_left.push(slider);
  glo.panels_left.push(panel);
}
function add_cohesion_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Cohésion";
  panel.addControl(header);

  if(glo.mode.slider){
    var slider = new BABYLON.GUI.Slider();
  }
  else{
    var slider = new BABYLON.GUI.InputText();
  }

  slider.name = 'cohesion_var';
  slider.prop_value = 'none';

  slider.minimum = -11;
  slider.maximum = 10;
  slider.value = 0;
  if(glo.mode.slider){
    slider.onValueChangedObservable.add(function (value) {
      var scale = value;
      if(scale < 0){ scale = Math.abs(1 / scale); }
      else{ scale = value + 1; }
      glo.cohesion *= scale;
    });
  }
  else{
    slider.onTextChangedObservable.add(function (value) {
      glo.cohesion = value.value;
      header.text = "Cohésion: " + value.value;
    });
  }

  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_left.push(slider);
  glo.panels_left.push(panel);
}
function add_var_taille_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Taille";
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();

  slider.name = 'taille_var';
  slider.prop_value = 'none';

  slider.minimum = -26;
  slider.maximum = 25;
  slider.value = glo.var_taille;
  slider.onValueChangedObservable.add(function (value) {
    var scale = value;
    if(scale < 0){ scale = Math.abs(1 / scale); }
    else{ scale = value + 1; }
    if(meshes.length > 0){
      meshes.map(sp => {
        var selection = true;
        if(glo.mode_check.getCheck("selection") && !sp.selection){ selection = false; }
        if(selection){ sp.scaling = new BABYLON.Vector3(scale, scale, scale); }
      });
    }
  });


  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_left.push(slider);
  glo.panels_left.push(panel);
}
function add_var_scale_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Échelle vue";
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();

  slider.name = 'scale_var';
  slider.prop_value = 'none';

  slider.minimum = -26;
  slider.maximum = 25;
  slider.value = glo.scale;
  slider.onValueChangedObservable.add(function (value) {
    var scale = value;
    if(scale < glo.scale){ scale = 4/5; }
    else{ scale = 5/4; }
    glo.scale = value;
    if(meshes.length > 0){
      meshes.map(mesh => {
        mesh.scale_scale(scale);
      });
    }
  });


  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function add_color_picker_background_scene(sc){
  var panel = new BABYLON.GUI.StackPanel();
  panel.isVertical = true;

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Couleur de fond";
  panel.addControl(header);

  var picker = new BABYLON.GUI.ColorPicker();
    picker.value = new BABYLON.Color3(0,0,0);
    picker.height = "150px";
    picker.width = "150px";
    picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.onValueChangedObservable.add(function(value) { // value is a color3
        glo.scene.clearColor = value;
        var new_color = "rgb(" + value.b + ", " + value.g + ", " + value.r + ")";
        if(value.r < 77/255 && value.g < 77/255 && value.b < 77/255){
          new_color = "white";
        }
        glo.headers.changeColor(new_color);
        glo.headers_suit.changeColor(new_color);
        glo.headers_radios.changeColor(new_color);
        glo.header_gen.color = new_color;
        glo.header_gen_suit.color = new_color;
    });


  panel.addControl(picker);
  glo.picker_color = picker;

  glo.headers_suit.push(header);
  //glo.sliders_right_suit.push(picker);
  glo.panels_right_suit.push(panel);
}
function add_checks(sc){
  var panel = new BABYLON.GUI.StackPanel();
  glo.advancedTexture.addControl(panel);

  var addCheck = function(text, name, parent, state = false) {
    var checkbox = new BABYLON.GUI.Checkbox();
    checkbox.name = name;
    checkbox.width = "15px";
    checkbox.height = "15px";
    checkbox.isChecked = state;
    checkbox.color = "green";
    checkbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    checkbox.onIsCheckedChangedObservable.add(function(value) {
        glo.mode_check.invCheck(name);
        if(name == "trail"){
  			   add_trails(glo.mode_check.getCheck('trail'), meshes);
        }
    });
    parent.addControl(checkbox);
    glo.checkboxes.push(checkbox);

    var header = new BABYLON.GUI.TextBlock();
    header.text = text;
    header.width = "35%";
    header.paddingTop = "-20px";
    header.paddingLeft = "0px";
    header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    header.color = "white";

    glo.headers_suit.push(header);

    parent.addControl(header);
  }

  glo.mode_check.checks.map( check => {
    addCheck(check.text, check.name, panel, check.state);
  });

  //glo.headers_suit.push(header);
  glo.panels_left_suit.push(panel);
}
function add_radios(sc){
  var panel = new BABYLON.GUI.StackPanel();
  panel.name = "radios";
  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Formes:";
  panel.addControl(header);

  var addRadio = function(text, parent, group, check = false) {
      var button = new BABYLON.GUI.RadioButton();
      button.width = "13px";
      button.height = "13px";
      button.color = "white";
      button.background = "green";
      button.group = "green";
      button.isChecked = check;

      button.onIsCheckedChangedObservable.add(function(state) {
        if (state) {
          glo.formes.setFormeSelect(text);
          if(typeof(glo.formes.getFormeSelect().formule) == "undefined"){
            var n_particules = Math.pow(glo.nb_particules, glo.formes.getFormeSelect().pow_nb_particules) * glo.formes.getFormeSelect().mult_nb_particules;
          }
          else{
            var n_particules = glo.formes.getFormeSelect().formule(glo.nb_particules);
          }
          glo.header_nb_particules.text = "Nb particules: " + n_particules;
        }
      });

      var header = BABYLON.GUI.Control.AddHeader(button, text, "130px", { isHorizontal: true, controlFirst: true });
      header.paddingTop = "1px";
      header.paddingLeft = "16%";
      header.fontSize = "15px";
      header.height = '15px';
      header.color = "white";

      glo.headers_radios.push(header);

      parent.addControl(header);
  }

  glo.formes.select.map( forme => {
    addRadio(forme.text, panel, "forms", forme.check);
  });

  glo.headers.push(header);
  glo.panels_left.push(panel);
}
function add_colors_radios(sc){
  var panel_param = new BABYLON.GUI.StackPanel();
  glo.advancedTexture.addControl(panel_param);
  var panel_type = new BABYLON.GUI.StackPanel();
  glo.advancedTexture.addControl(panel_type);

  panel_param.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel_param.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel_param.paddingLeft         = '3.5%';
  panel_param.width               = '20%';
  panel_param.height              = '40px';
  panel_param.top                 = '66%';
  //panel_param.background          = 'red';
  panel_type.horizontalAlignment  = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel_type.verticalAlignment    = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel_type.paddingLeft          = '3.5%';
  panel_type.width                = '20%';
  panel_type.height               = '40px';
  panel_type.top                  = '72%';
  //panel_type.background           = 'red';

  /*var header_param = new BABYLON.GUI.TextBlock();
  header_param.text = "Couleurs:";
  header_param.paddingLeft = 0;
  header_param.width = "200%";
  header_param.name = "headerColorsTitle";
  header_param.zIndex = -1;
  header_param.background = 'blue';
  panel_param.addControl(header_param);*/
  panel_param.name = 'panelColorsParam';
  panel_param.isVertical = false;
  panel_type.name = 'panelColorsType';
  panel_type.isVertical = false;

  glo.headersColor = [];
  glo.buttonsColor = [];

  var addRadio = function(text, parent, group, check = false, name = '') {
      var button = new BABYLON.GUI.RadioButton();
      button.width = "15px";
      button.height = "15px";
      button.color = "white";
      button.background = "green";
      button.group = group;
      button.isChecked = check;
      button.name = "button-" + name;

      button.onIsCheckedChangedObservable.add(function(state) {
          if (state) {
            switch(text){
              case "Vitesse":
                is_acceleration = false;
                break;
              case "Accélération":
                is_acceleration = true;
                break;
              case "Relatif":
                mode_moyenne = true;
                break;
              case "Absolu":
                mode_moyenne = false;
                break;
            }
          }
      });

      glo.buttonsColor.push(button);

      var header         = BABYLON.GUI.Control.AddHeader(button, text, "150px", { isHorizontal: true, controlFirst: true });
      header.name        = "header-" + name;
      header.paddingTop  = "2px";
      header.paddingLeft = 0;
      header.zIndex      = -1;

      glo.headers.push(header);
      glo.headersColor.push(header);

      parent.addControl(header);
  }

  addRadio("Vitesse", panel_param, "panelColorsParam", true, "Vitesse");
  addRadio("Accélération", panel_param, "panelColorsParam", false, "Accélération");
  addRadio("Relatif", panel_type, "panelColorsType", true, "Relatif");
  addRadio("Absolu", panel_type, "panelColorsType", false, "Absolu");

  glo.panelParam   = panel_param;
  glo.panelType    = panel_type;
  //glo.header_param = header_param;
}
function add_cohesion_posee_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var coh_txt = parseInt(glo.echelle_cohesion * (glo.cohesion_posee - 1));

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Cohésion: " + coh_txt;
  panel.addControl(header);

  if(glo.mode.slider){
    var slider = new BABYLON.GUI.Slider();
  }
  else{
    var slider = new BABYLON.GUI.InputText();
  }

  slider.name = 'cohesion';

  slider.minimum = 0;
  slider.maximum = 100;
  slider.value = coh_txt;
  if(glo.mode.slider){
    slider.onValueChangedObservable.add(function (value) {
      //var val = parseInt(value * glo.echelle);
      //if(glo.echelle < 1){ val = (value * glo.echelle).toFixed(2); }
      //glo.vitesse_pose_z = val * glo.echelle_vitesse;
      glo.cohesion_posee = (1 + (value / glo.echelle_cohesion)) * glo.echelle;
      header.text = "Cohésion: " + parseInt(value) * glo.echelle;
    });
  }
  else{
    slider.onTextChangedObservable.add(function (value) {
      glo.cohesion_posee = parseFloat(value.value / 1) * glo.echelle;
      header.text = "Cohésion: " + value.value * glo.echelle;
    });
  }

  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_nb_particules_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  if(typeof(glo.formes.getFormeSelect().formule) == "undefined"){
    var n_particules = Math.pow(glo.nb_particules, glo.formes.getFormeSelect().pow_nb_particules) * glo.formes.getFormeSelect().mult_nb_particules;
  }
  else{
    var n_particules = glo.formes.getFormeSelect().formule(glo.nb_particules);
  }
  header.text = "Nb de particules: " + n_particules;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.updating = false;
  slider.name = 'nb_particules';
  slider.prop_value = 'nb_particules';
  slider.echelle_value = 1;
  slider.glo_echelle = glo.echelle;
  slider.minimum = 1;
  slider.maximum = 60;
  slider.value = glo.nb_particules;
  slider.onValueChangedObservable.add(function (value) {
    if(!slider.updating){
      slider.glo_echelle = glo.echelle;
      glo.nb_particules = parseInt(value) * glo.echelle;
      if(typeof(glo.formes.getFormeSelect().formule) == "undefined"){
        var n_particules = Math.pow(glo.nb_particules, glo.formes.getFormeSelect().pow_nb_particules) * glo.formes.getFormeSelect().mult_nb_particules;
      }
      else{
        var n_particules = glo.formes.getFormeSelect().formule(glo.nb_particules);
      }
      header.text = "Nb de particules: " + n_particules;
    }
    else{
      //header.text = "Nb de particules: " + glo.nb_particules;
      slider.updating = false;
    }
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.header_nb_particules = header;
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_masse_posee_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Masse: " + glo.masse_particules * 100;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'masse';
  slider.prop_value = 'masse_particules';
  slider.echelle_value = 100;
  slider.minimum = 0;
  slider.maximum = 100;
  slider.value = glo.masse_particules * 100 * glo.echelle;
  slider.onValueChangedObservable.add(function (value) {
    glo.masse_particules = parseFloat(value / 100) * glo.echelle;
    header.text = "Masse des particules: " + parseInt(value) * glo.echelle;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_ecart_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Écart: " + glo.ecart_particules * 100;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'ecart';
  slider.prop_value = 'ecart_particules';
  slider.echelle_value = 100;
  slider.minimum = 0;
  slider.maximum = 1000;
  slider.value = 227;
  slider.onValueChangedObservable.add(function (value) {
    glo.ecart_particules = parseFloat(value / 100) * glo.echelle;
    header.text = "Écart: " + parseInt(value) * glo.echelle;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_taille_mesh_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Taille: " + (glo.taille_mesh * glo.echelle_taille).toFixed(0);
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'taille_mesh';
  slider.prop_value = 'taille_mesh';
  slider.echelle_value = glo.echelle_taille;
  slider.minimum = 0;
  slider.maximum = 100;
  slider.value = 7;
  slider.onValueChangedObservable.add(function (value) {
    var val = (value / glo.echelle_taille) * glo.echelle;
    var val_txt = parseInt(value * glo.echelle);
    if(glo.echelle < 1){
      val = (value * glo.echelle / glo.echelle_taille).toFixed(2);
      val_txt = (value * glo.echelle).toFixed(2);
    }
    glo.taille_mesh = val;
    header.text = "Taille: " + val_txt;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_lim_newton_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Distance limite d'attraction: " + glo.lim_newton;
  panel.addControl(header);

  if(glo.mode.slider){
    var slider = new BABYLON.GUI.Slider();
  }
  else{
    var slider = new BABYLON.GUI.InputText();
  }

  slider.name = 'lim_distance';
  slider.minimum = 0;
  slider.maximum = 50;
  slider.value = glo.lim_newton;
  if(glo.mode.slider){
    slider.onValueChangedObservable.add(function (value) {
      glo.lim_newton = parseInt(value) * glo.echelle;
      header.text = "Distance limite d'attraction: " + glo.lim_newton;
    });
  }
  else{
    slider.onTextChangedObservable.add(function (value) {
      glo.lim_newton = parseInt(value.value) * glo.echelle;
      header.text = "Distance limite d'attraction: " + glo.lim_newton;
    });
  }

  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_lim_cohesion_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Distance limite de cohésion: " + glo.lim_cohesion;
  header.name = "lim_cohesion";
  panel.addControl(header);

  if(glo.mode.slider){
    var slider = new BABYLON.GUI.Slider();
  }
  else{
    var slider = new BABYLON.GUI.InputText();
  }

  slider.name = 'lim_cohesion';

  slider.minimum = 0;
  slider.maximum = 50;
  slider.value = glo.lim_cohesion;
  if(glo.mode.slider){
    slider.onValueChangedObservable.add(function (value) {
      glo.lim_cohesion = parseInt(value) * glo.echelle;
      header.text = "Distance limite de collision: " + glo.lim_cohesion;
    });
  }
  else{
    slider.onTextChangedObservable.add(function (value) {
      glo.lim_cohesion = parseInt(value.value) * glo.echelle;
      header.text = "Distance limite de collision: " + glo.lim_cohesion;
    });
  }

  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_vitesse_x_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Vitesse X: " + glo.vitesse_pose_x;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'vitesse_x';
  slider.minimum = -10;
  slider.maximum = 10;
  slider.value = glo.vitesse_pose_x;
  slider.onValueChangedObservable.add(function (value) {
    var val = parseInt(value * glo.echelle);
    if(glo.echelle < 1){ val = (value * glo.echelle).toFixed(2); }
    glo.vitesse_pose_x = val * glo.echelle_vitesse;
    header.text = "Vitesse X: " + val;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_vitesse_y_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Vitesse Y: " + glo.vitesse_pose_y;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'vitesse_y';
  slider.minimum = -10;
  slider.maximum = 10;
  slider.value = glo.vitesse_pose_y;
  slider.onValueChangedObservable.add(function (value) {
    var val = parseInt(value * glo.echelle);
    if(glo.echelle < 1){ val = (value * glo.echelle).toFixed(2); }
    glo.vitesse_pose_y = val * glo.echelle_vitesse;
    header.text = "Vitesse Y: " + val;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_vitesse_z_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Vitesse Z: " + glo.vitesse_pose_z;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'vitesse_z';
  slider.minimum = -10;
  slider.maximum = 10;
  slider.value = glo.vitesse_pose_z;
  slider.onValueChangedObservable.add(function (value) {
    var val = parseInt(value * glo.echelle);
    if(glo.echelle < 1){ val = (value * glo.echelle).toFixed(2); }
    glo.vitesse_pose_z = val * glo.echelle_vitesse;
    header.text = "Vitesse Z: " + val;
  });
  panel.addControl(slider);

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_echelle_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Échelle: " + glo.echelle;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'echelle';
  slider.minimum = 1;
  slider.maximum = 10;
  slider.value = 1;
  slider.onValueChangedObservable.add(function (value) {
    var val = parseInt(value);
    //if(glo.echelle < 1){ val = (value * glo.echelle).toFixed(2); }
    glo.echelle_lin = val;
    glo.echelle = Math.pow(10, val - 1);
    header.text = "Échelle: " + val;
  });
  panel.addControl(slider);

  glo.slider_echelle = slider;

  glo.headers.push(header);
  glo.sliders_right.push(slider);
  glo.panels_right.push(panel);
}
function add_var_trail_length_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Longueur trainées: " + glo.trail.length;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'trail_length';
  slider.minimum = 1;
  slider.maximum = 1000;
  slider.value = glo.trail.length;
  slider.onValueChangedObservable.add(function (value) {
    var val = parseInt(value);

    meshes.map(mesh => {
      if(typeof(mesh.trail) != "undefined"){
        mesh.trail._length = val * glo.echelle;
      }
    });

    glo.trail.length = val * glo.echelle;
    header.text = "Longueur trainées: " + val * glo.echelle;
  });
  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function add_var_trail_diameter_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Diamètre trainées: " + glo.trail.diameter;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'trail_length';
  slider.minimum = 0.01;
  slider.maximum = 1;
  slider.value = glo.trail.length;
  slider.onValueChangedObservable.add(function (value) {
    var val = value;

    meshes.map(mesh => {
      mesh.trail._diameter = val * glo.echelle;
    });

    glo.trail.diameter = val * glo.echelle;
    header.text = "Diamètre trainées: " + (val * glo.echelle).toFixed(2);
  });
  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function add_var_time_slider(sc){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = "Ralentissement: " + glo.temps;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = 'trail_length';
  slider.minimum = 1;
  slider.maximum = 10;
  slider.value = glo.temps;
  slider.onValueChangedObservable.add(function (value) {
    glo.temps = 1 / (value * glo.echelle);
    header.text = "Ralentissement: " + value.toFixed(2) * glo.echelle;
  });
  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function add_glo_slider(name, text, min, max, prop_to_change, sous_prop_to_change = ""){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = text;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = name;
  slider.minimum = min;
  slider.maximum = max;
  if(sous_prop_to_change != ""){
    slider.value = glo.formes.options[prop_to_change][sous_prop_to_change];
  }
  else{
    slider.value = glo.formes.options[prop_to_change];
  }
  slider.onValueChangedObservable.add(function (value) {
    if(sous_prop_to_change != ""){
      glo.formes.options[prop_to_change][sous_prop_to_change] = value;
    }
    else{
      glo.formes.options[prop_to_change] = value;
    }
    header.text = text + ": " + value.toFixed(2);
  });
  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function add_simple_glo_slider(name, text, min, max, prop_to_change, sous_prop_to_change = ""){
  var panel = new BABYLON.GUI.StackPanel();

  glo.advancedTexture.addControl(panel);

  var header = new BABYLON.GUI.TextBlock();
  header.text = text;
  panel.addControl(header);

  var slider = new BABYLON.GUI.Slider();
  slider.name = name;
  slider.minimum = min;
  slider.maximum = max;
  if(sous_prop_to_change != ""){
    slider.value = glo[prop_to_change][sous_prop_to_change];
  }
  else{
    slider.value = glo[prop_to_change];
  }
  slider.onValueChangedObservable.add(function (value) {
    if(sous_prop_to_change != ""){
      glo[prop_to_change][sous_prop_to_change] = value;
    }
    else{
      glo[prop_to_change] = value;
    }
    header.text = text + ": " + value.toFixed(2);
  });
  panel.addControl(slider);

  glo.headers_suit.push(header);
  glo.sliders_right_suit.push(slider);
  glo.panels_right_suit.push(panel);
}
function param_buttons(){
  glo.panels_buttons.map(pbt => {
    //pbt.width = "185px";
  });
  glo.buttons.map(bt => {
    bt.color        = "white";
    bt.cornerRadius = 10;
    bt.background   = "green";
    bt.fontSize     = "15%";
    bt.width        = 0.3;
  });
}
function param_controls(sc){
  glo.headers.map(hd => {
    hd.height = '20px';
    hd.color = "white";
    hd.fontSize = "16px";
  });
  var pr_top = 0;
  glo.panels_right.map(pr => {
    pr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    pr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pr.paddingRight = '1%';
    pr.width = '20%';
    pr.top = pr_top + '%';
    pr_top += 7;
  });
  glo.sliders_right.map(sr => {
    sr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    sr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sr.paddingRight = '1%';
    sr.height = '20px';
    sr.color = "#003399";
    sr.background = "grey";
    sr.maximum *= glo.echelle;
  });
  pr_top = 5;
  glo.panels_left.map(pr => {
    pr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pr.paddingLeft = '1%';
    pr.width = '20%';
    pr.top = pr_top + '%';
    pr_top += 8;
  });
  glo.sliders_left.map(sr => {
    sr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sr.paddingLeft = '1%';
    sr.height = '20px';
    sr.color = "#003399";
    sr.background = "grey";
    sr.maximum *= glo.echelle;
  });
}
function toggle_gui_controls(state = glo.mode.gui_visible){
  glo.header_gen.isVisible = state;
  glo.header_gen.isEnabled = state;
  glo.panel_gen.isVisible = state;
  glo.panel_gen.isEnabled = state;
  glo.headers.map(hd => {
    hd.isVisible = state;
    hd.isEnabled = state;
  });
  glo.panels_right.map(pr => {
    pr.isVisible = state;
    pr.isEnabled = state;
  });
  glo.sliders_right.map(sr => {
    sr.isVisible = state;
    sr.isEnabled = state;
  });
  glo.panels_left.map(pr => {
    pr.isVisible = state;
    pr.isEnabled = state;
  });
  glo.sliders_left.map(sr => {
    sr.isVisible = state;
    sr.isEnabled = state;
  });
  glo.buttons.map(bt => {
    bt.isVisible = state;
    bt.isEnabled = state;
  });
  glo.panels_buttons.map(pbt => {
    pbt.isVisible = state;
    pbt.isEnabled = state;
  });

  if(glo.panelLeftBottom){
    glo.panelLeftBottom.children.forEach(button => {
      if(button.name !== 'showButton'){ button.isVisible = state; }
    });
  }
}
function param_controls_suit(sc){
  glo.headers_suit.map(hd => {
    hd.height = '15px';
    hd.color = "white";
    hd.fontSize = "16px";
  });
  var pr_top = 0;
  glo.panels_right_suit.map(pr => {
    pr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    pr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pr.paddingRight = '1%';
    pr.width = '20%';
    pr.top = pr_top + '%';
    pr_top += 6;
  });
  glo.sliders_right_suit.map(sr => {
    sr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    sr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sr.paddingRight = '1%';
    sr.height = '15px';
    sr.color = "#003399";
    sr.background = "grey";
    sr.fontSize = "14px";
    sr.maximum *= glo.echelle;
  });
  pr_top = 5;
  glo.panels_left_suit.map(pr => {
    pr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pr.paddingLeft = '-0%';
    pr.width = '15%';
    pr.top = pr_top + '%';
    pr_top += 6;
  });
  glo.sliders_left_suit.map(sr => {
    sr.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    sr.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sr.paddingLeft = '1%';
    sr.height = '20px';
    sr.color = "#003399";
    sr.background = "grey";
    sr.maximum *= glo.echelle;
  });
}
function toggle_gui_controls_suit(state = glo.mode.gui_suit_visible){
  glo.header_gen_suit.isVisible = state;
  glo.header_gen_suit.isEnabled = state;
  glo.panel_gen_suit.isVisible = state;
  glo.panel_gen_suit.isEnabled = state;
  glo.headers_suit.map(hd => {
    hd.isVisible = state;
    hd.isEnabled = state;
  });
  glo.panels_right_suit.map(pr => {
    pr.isVisible = state;
    pr.isEnabled = state;
  });
  glo.sliders_right_suit.map(sr => {
    sr.isVisible = state;
    sr.isEnabled = state;
  });
  glo.panels_left_suit.map(pr => {
    pr.isVisible = state;
    pr.isEnabled = state;
  });
  glo.sliders_left_suit.map(sr => {
    sr.isVisible = state;
    sr.isEnabled = state;
  });
  glo.buttons.map(bt => {
    bt.isVisible = state;
    bt.isEnabled = state;
  });
  glo.panels_buttons.map(pbt => {
    pbt.isVisible = state;
    pbt.isEnabled = state;
  });

  if(glo.panelLeftBottom){
    glo.panelLeftBottom.children.forEach(button => {
      if(button.name !== 'showButton'){ button.isVisible = state; }
    });
  }
}

function mergeAllGuiElemsArrays(){
  glo.guiElems = [
    ...glo.headers,
    ...glo.headersColor,
    ...glo.panels_right,
    ...glo.sliders_right,
    ...glo.headers_suit,
    ...glo.headers_radios,
    ...glo.panels_right_suit,
    ...glo.sliders_right_suit,
    ...glo.panels_left,
    glo.panelLeftBottom,
    ...glo.sliders_left,
    ...glo.panels_left_suit,
    ...glo.sliders_left_suit,
    ...glo.panels_buttons,
    ...glo.buttons,
    ...glo.checkboxes,
    glo.panelParam,
    glo.panelType,
    glo.header_param,
    ...glo.buttonsColor,
  ];
}

function getGuiElemByName(name){
  for(let i = 0; i < glo.guiElems.length; i++){ 
    if(glo.guiElems[i].name === name){ return glo.guiElems[i]; } 
  }
}













//END
