function RigBuilder()
{
	function CR_Expressions_builder ()
	{
		/* CameraRig target variables */
		CamRig_zoom = Handheld_camera.cameraOption.zoom;
		CameraRig_travelling = camera_travelling.transform.position;
		CamRig_XRot = camera_pitch.transform.xRotation;
		CamRig_YRot = camera_heading.transform.yRotation;
		CamRig_ZRot = camera_pitch.transform.zRotation;
	
		/* expressions variables */
		//tempXRot = [5, 17, 18]; // [RotCtrl,TargetDataSource, TrackerMultiplier]
		CamRigFX = "thisComp.layer(\"" +camera_rig.name + "\").effect(\"" +CR_EffectPanelName + "\")";
		CheckLookAtObj = "(" + CamRigFX + "(\"Use Look at (X/Y rotation)\"))";
		LookAtObj = CamRigFX + "(\"Look at\")";
		XRotation = "(" + CamRigFX + "(\"Default X Rotation\"))";
		YRotation = "(" + CamRigFX + "(\"Default Y Rotation\"))";
		ZRotation = "(" + CamRigFX + "(\"Default Z Rotation\"))";
		TrackingType = "(" + CamRigFX + "(\"Tracking Type\"))";
		TrackLayer = "(" + CamRigFX + "(\"Track Layer\"))";

		/**/
		
		/* FOCAL LENGTH LINK TO CAM-ZOOM PARAM */
		CamRig_zoom.expression = CamRigFX + "(\"Focal Length\")*(3200/60)";
		
		/* POSITION CONTROLERS EXPRESSION LINKS */
		XControler = "xpos = "+CamRigFX+"(\"X Position\");";
		YControler = "ypos = "+CamRigFX+"(\"Y Position\");";
		ZControler = "zpos = "+CamRigFX+"(\"Z Position\");";
		CameraRig_travelling.expression =
			XControler + "\
			" + YControler + "\
			" + ZControler + "\
			if (" + TrackingType + " == 2)\
			{\
				try\
				{\
					l = " + TrackLayer + ";\
					xpos += (l.position[0] - thisComp.width/2) * " + CamRigFX + "(\"Position X Position Multiplier\");\
					ypos += (l.position[1] - thisComp.height/2) * " + CamRigFX + "(\"Position Y Position Multiplier\");\
				} catch (err) {}\
			}\
			[xpos,ypos,zpos]";
		
		/* ROTATION CONTROLERS EXPRESSION LINKS */
		CamRig_XRot.expression =
			"v = " + XRotation + ";\
			if (" + CheckLookAtObj + " == true)\
				v += (" + LookAtObj + "[1]) / 25;\
			if (" + TrackingType + " == 3)\
				try\
				{\
					l = " + TrackLayer + ";\
					v += (l.position[1] - thisComp.height/2)/50 * " + CamRigFX + "(\"Rotation Y Position Multiplier\");\
				} catch (err) {}\
			v";

		CamRig_YRot.expression = 
			"v = " + YRotation + ";\
			if (" + CheckLookAtObj + " == true)\
				v -= (" + LookAtObj + "[0]) / 25;\
			if (" + TrackingType + " == 3)\
				try\
				{\
					l = " + TrackLayer + ";\
					v += (l.position[0] - thisComp.width/2)/50 * " + CamRigFX + "(\"Rotation X Position Multiplier\");\
				} catch (err) {}\
			v";

		CamRig_ZRot.expression = 
			"v = " + ZRotation + ";\
			if (" + TrackingType + " > 1)\
				try\
				{\
					l = " + TrackLayer + ";\
					v += l.transform(\"Z Rotation\") * " + CamRigFX + "(\"Z Rotation Multiplier\");\
				} catch (err) {}\
			v";
	}
	
	// camera
	Handheld_camera = undefined;
	for (var e=1; e <= comp.layers.length; e++)
	{
		if (comp.layers[e] instanceof CameraLayer)
		{
			Handheld_camera = comp.layers[e];
			Handheld_camera.name = "Handheld_camera";
			Handheld_camera.position.setValue([(comp.width/2),(comp.height/2),-( Handheld_camera.cameraOption.zoom.value )]);
		}
	}
	if (!Handheld_camera)
	{
		Handheld_camera = comp.layers.addCamera("Handheld_camera",[(comp.width/2),(comp.height/2)]);
		Handheld_camera.cameraOption.zoom.setValue(startingZoomValue);
		Handheld_camera.position.setValue([(comp.width/2),(comp.height/2),-( startingZoomValue )]);
	}
	Handheld_camera.transform.position.dimensionsSeparated = true;
	Handheld_camera.shy = true ;
	Handheld_camera.startTime = StartFrame;
	// camera_pitch null object
	camera_pitch = comp.layers.add(Itemcamera_pitch);
	camera_pitch.name="camera_pitch";
	camera_pitch.threeDLayer = true;
	camera_pitch.transform.property(1).setValue([0,0,0]);
	camera_pitch.transform.position.setValue( Handheld_camera.transform.position.value);
	camera_pitch.transform.position.dimensionsSeparated = true;
	camera_pitch.enabled = false;
	camera_pitch.shy = true ;
	camera_pitch.startTime = StartFrame;
	// camera_heading null object
	camera_heading = comp.layers.add(Itemcamera_heading);
	camera_heading.name="camera_heading";
	camera_heading.threeDLayer = true;
	camera_heading.transform.property(1).setValue([0,0,0]);
	camera_heading.transform.position.setValue( Handheld_camera.transform.position.value );
	camera_heading.shy = true ;
	camera_heading.enabled = false;
	camera_heading.startTime = StartFrame;
	// camera_travelling null object
	camera_travelling = comp.layers.add(Itemcamera_travelling);
	camera_travelling.name="camera_travelling";
	camera_travelling.threeDLayer = true;
	camera_travelling.transform.property(1).setValue([0,0,0]);
	camera_heading.transform.position.setValue(Handheld_camera.transform.position.value );
	camera_travelling.enabled = false;
	camera_travelling.shy = true ;
	camera_travelling.startTime = StartFrame;
	// camera rig layer
	camera_rig = comp.layers.add(ItemCameraRig);
	camera_rig.name = "CAMERA_RIG";
	camera_rig.transform.property(1).setValue([0,0]);
	camera_rig.enabled = false;
	camera_rig.startTime = StartFrame;
	// parent links creation
	Handheld_camera.parent =camera_pitch;
	camera_pitch.parent = camera_heading ;
	camera_heading.parent = camera_travelling;

	// Add Camera Control Panel to Camera_RIG layer
	if (camera_rig.Effects.property(CR_EffectPanelName) == null)
	{
		// mise en place du panel de controllers
		try
		{
			CamRigEffect = camera_rig.Effects.addProperty(CR_EffectPanelName);
			CamRigFocal = CamRigEffect.property(1);
			CamRigFocal.setValue(NCR_Focal.text);
			CR_Expressions_builder ();
		}
		catch(err)
		{
			alert(err.message + "\n\nThe CameraRig script is not correctly installed !");
		}
	}
	else { alert("The CameraRig effect panel is already existing."); };
};

if (comp.layers.length) // layers in the comp
{
	oldLayers = new Array (); // will store all layers composants of an existing cameraRig
	toKill = new Array();
	for (var e=0; e < comp.layers.length; e++)
	{
		if (comp.layers[e+1].name.match(/(CAMERA_RIG|camera_travelling|camera_heading|camera_pitch|Handheld_camera)/gi))
		{
			oldLayers.push([comp.layers[e+1].index, comp.layers[e+1].name]);
			toKill.push(comp.layers[e+1]);
		};
	};
	if (oldLayers.length) // ask if want to conitnue in case of existing Rig
	{
		layersList = new Array();
		for (var e=0; e < oldLayers.length; e++)
		{
			layersList[e] = oldLayers[e].join(" | ");
		};
		layersList = layersList.join("\n");
		removeLyr = confirm("Layers part of an existing CameraRig have been found in \"" +comp.name+ "\": \n\n" + layersList + "\n\nDo you want to kill the old CameraRig ?");
		if (removeLyr == true)
		{
			for (var i=toKill.length-1; i >= 0; i--)
			{
				toKill[i].remove();
			}
			RigBuilder();
		}
		else;
	}
	else
	{
		RigBuilder();
	};
}
else
{
	RigBuilder();
};