/*
           CameraRig
    
    SCRIPT DEVELOPPED BY SAMY BARRAS
FOR "The Amazing World of Gumball" Production
            samy.barras@gmail.com


UPDATES LOG :
v4.0 - J Hearn
		- Choose layer to track
		- Choose position or rotation tracking
v3.0
        - in instance of improve the use of tracking data, old tools from previous versions ("expression builder" and "Handheld Animation Preset") have been removed and new tools added
        - check if multiple creation of cameraRig to do not duplicate "CameraRig" folder (and sub items) in Project Panel
            
*/
#include "../(CameraRig v4.0)/CR_gen_functions.jsx"
#include "../(CameraRig v4.0)/CR_gen_var.jsx"
/* presets variables */
try 
    {
        if (PresetsFolder.location == "local")
            {
                PresetsFolder.path = Folder(decodeURI(startupFolder) + "/Scripts/("+CR_scriptName+")/");
            }
        else if (PresetsFolder.location == "external")
            {
                PresetsFolder.path = Folder(PresetsFolder.external);
            };
    }
catch (err)
    {
        alert(err.message);
    };
/**/
function CameraRig (thisObj)
{
    function checkIfEffectExists () // to start when script launch
        {
            CR_EffectPanelNameExists = false;
            for (var e=0; e < app.effects.length; e++)
                {
                    if (app.effects[e].matchName == CR_EffectPanelName) { CR_EffectPanelNameExists = true; writeLn (CR_EffectPanelName + " found");};
                }
            return CR_EffectPanelNameExists;
        }
    /* NEW CAMERA RIG BUILDER */
    function CreateNewCamRig()
        {
            app.beginUndoGroup("New CameraRig");
            // Get the active comp
            startingZoomValue = (NCR_Focal.text)*(3200/60);
            comp = app.project.activeItem;
            //var Itemcamera_heading, Itemcamera_pitch, ItemCameraRig, Itemcamera_travelling, StartFrame;
            if (comp != null && comp instanceof CompItem)
                {
                    // check if layers have to start at 0 or at current time
                    if (NCB_StartFrame.value == true)
                        {
                            StartFrame = comp.time;
                            rigDuration = comp.workAreaDuration - comp.time;
                        }
                    else
                        {
                            //alert(comp.displayStartTime);
                            StartFrame =comp.displayStartTime;
                            rigDuration = comp.workAreaDuration;
                        };
                    /* SCRIPT */
                    //#include "../(CameraRig)/CR_FolderBuilder.jsx"
                    //#include "../(CameraRig)/CR_RigBuilder.jsx"
                    loadScript("CR_FolderBuilder.jsx");
                    loadScript("CR_RigBuilder.jsx");
                }
            else  { alert("Please select a composition first !")};
            /* end of undoGroup */
            app.endUndoGroup();
        }
    
     /* MAIN */
    function CR_BakeAnimFn ()
	{
		app.beginUndoGroup("Bake CameraRig Anim");
		// composition variables
		comp = app.project.activeItem;
		if (comp)
		{
			#include "../(CameraRig v4.0)/CR_BakeAnim.jsx"
			//loadScript("CR_BakeAnim.jsx");
			DataString = String(header);
			app.project.timeDisplayType = TimeDisplayType.FRAMES; // optional
			startTime = Number(timeToCurrentFormat(comp.displayStartTime, 25, true));
			endTime = Number(timeToCurrentFormat(comp.duration, 25, true));
			for (var e=1; e < comp.layers.length; e++)
			{
				if (comp.layer(e).name == "CAMERA_RIG") {camera_rigLyr = comp.layer(e);}
				else if (comp.layer(e).name == "camera_heading") {camera_headingLyr = comp.layer(e);}
				else if (comp.layer(e).name == "camera_pitch") {camera_pitchLyr = comp.layer(e);};
				else if (comp.layer(e).name == "camera_travelling") {camera_travellingLyr = comp.layer(e);};
			};
			if (TargetCamName.text != CamNameTemplate && TargetCamName.text != "")
			{
				if (TransTargetCamName.text != "")
				{
					DataString = DataString.replace('%startTime', startTime);
					DataString = DataString.replace('%endTime', endTime);
					
					// Translation
					for (var e=0; e < transParamToExport.length; e++)
					{
						try
						{
							curveData = newCurve(TransTargetCamName.text, transParamToExport[e]);
							DataString = DataString + "\n" + curveData;
						}
						catch (err) { alert(err.message, CR_scriptName+ "/ BakeAnimTool"); };
					}
					
					// Rotation and focal length
					for ( var e=0; e < paramToExport.length; e++)
					{
						try
						{
							curveData = newCurve (TargetCamName.text, paramToExport[e]);
							DataString = DataString + "\n" + curveData;
						}
						catch (err) { alert(err.message, CR_scriptName+ "/ BakeAnimTool"); };
					}
					
					/* WRITE THE FILE */
					try { writeFile (DataString); alert("CameraRig's anim baked !");}
					catch (err) { alert(err.message); };
				}
				else
					alert("Please enter the name of maya's scene translation target camera");
			}
			else
				alert("Please enter the name of maya's scene target camera");
		}
		else
		{
			if (comp)
			{
				alert("The CameraRig Control Panel is not found !\nPlease make sure you have a CameraRig in the current composition.");
			}
			else
			{
				alert("There is no active composition.");
			};
		};
		/* end of undoGroup */
		app.endUndoGroup();
	}
	
/* UIPanel BUILDER*/
    function CameraRig_buildUI(thisObj)
        {
            var mpanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", CR_scriptName, undefined, {resizeable:true});
            if (mpanel != null)
                {
                    var res =
                            "group { \
                                orientation:'column', alignment:['fill','fill'], \
                                NewCamBuilder : Panel {\
                                                text:'New Camera Rig Builder', orientation:'column', alignment:'fill', alignChildren:'center', spacing:5, margins:[10,15,15,5], \
                                                                                    \
                                                                                    \
                                                                                    optgrp : Group { orientation:'row', alignment:'left', spacing:5, margins:[5,5,5,5],\
                                                                                                    Focal : StaticText {text:'Focal Length'}, \
                                                                                                        FocalLength: EditText { text:'50', alignment:'left', preferredSize:[40,20] },\
                                                                                                    AngleOfView : StaticText {text:'AOV'}, \
                                                                                                        AOV: EditText { text:'39.60', alignment:'left', preferredSize:[40,20] },\
                                                                                                    NCB_StartFrame : Checkbox { text:'Start at current time ', value:'false', alignement:'left', helpTip:'if not camera layer start at the beginning of comp'}, \
                                                                                    },\
                                                                                    \
                                                                                    buttngrp : Group {alignment:'left', spacing:5, margins:[5,5,5,5],\
                                                                                                    NewCamButton : Button { text:'Create new Camera Rig'}, \
                                                                                                    helpButton: Button { text:'?', alignment:'right', preferredSize:[25,20] }, \
                                                                                    }\
                                                                                    },\
                                Tools : Panel {\
                                            text:'CameraRig Tools', orientation:'column', alignment:'fill', alignChildren:'center', spacing:5, margins:[10,15,15,5], \
                                            CustomPresets : Panel {\
                                                                    text:'Camera Rig Anim Preset', orientation:'column', alignment:'fill', alignChildren:'center', spacing:5, margins:[10,15,15,5], \
                                                                            CreationGroup: Group { orientation:'row', alignment:'left', spacing:5, margins:[2,2,2,2],\
                                                                                                        PresetName: EditText { text:'new preset name', alignment:'left', preferredSize:[150,20] },\
                                                                                                        savebttn: Button { text:'Save new preset'},\
                                                                                                    }\
                                                                            LoaderGrp: Group { orientation:'row', alignment:'left', spacing:5, margins:[2,2,2,2],\
                                                                                                        PresetsList: DropDownList { alignment:['fill','fill'], properties:{items:''}, preferredSize:[150,20]}, \
                                                                                                        applybttn: Button { text:'Load Preset',},\
                                                                                                    }\
                                                                            bttngroup: Group { orientation:'row', alignment:'left', spacing:5, margins:[2,2,2,2],\
                                                                                                        refresh: Button { text:'Refresh list',},\
                                                                                                        folderbttn: Button { text:'Open presets folder',},\
                                                                                                        helpButton: Button { text:'?', alignment:'right', preferredSize:[25,20] }, \
                                                                                                    }, \
                                                                            }, \
                                            BakeAnimPanel : Panel {\
                                                                    text:'Bake CameraRig to Maya', orientation:'column', alignment:'fill', spacing:5, margins:[10,15,15,5], \
                                                                            CamTarget: StaticText { text:'Target Camera :', alignment:'left'},\
                                                                            CamName: EditText { text: CamNameTemplate, alignment:'center', preferredSize:[250,20], spacing:5,}\
                                                                            CamTransTarget: StaticText { text:'Camera Translation Target :', alignment:'left'},\
                                                                            CamTransName: EditText { text: TransCamNameTemplate, alignment:'center', preferredSize:[250,20], spacing:5,}\
                                                                            BttnGrp: Group { orientation:'row', alignment:'right', spacing:5, margins:[5,5,5,5],\
                                                                                                        exportbttn: Button { text:'Export Anim', alignment:'right'},\
                                                                                                        helpButton: Button { text:'?', alignment:'right', preferredSize:[25,20] }, \
                                                                                                   }\
                                                                            }, \
                                                                }, \
                            }";
                    mpanel.grp = mpanel.add(res);
                    
                    mpanel.layout.layout(true);
                    mpanel.grp.minimumSize = [mpanel.grp.size.width, mpanel.grp.NewCamBuilder.size.height + mpanel.grp.spacing * 5];
                    mpanel.layout.resize();
                    mpanel.onResizing = mpanel.onResize = function () {this.layout.resize();}
                    
                }
            else { alert("Impossible to build UI for CameraRig script !") };			
            return mpanel;
        }

    /* MAIN SCRIPT TO BUILD PALETTE */
    if (parseFloat(app.version) < 10) {alert("!! CameraRig !!\nScript optimised for After Effect CS5 at least.");};
    else
        {      
            //var CR_Exists  = checkIfEffectExists ();
            var myPanel= CameraRig_buildUI(thisObj);
            if (myPanel != null /*&& CR_Exists == true*/)
                {
                    /* variables definitions for UI */
                    /* newcamerarig grp */
                    NewCamBuilderPanel = myPanel.children[0].children[0];
                    NCR_Focal = NewCamBuilderPanel.children[0].children[1];
                    NCR_AOV = NewCamBuilderPanel.children[0].children[3];
                    NCB_StartFrame = NewCamBuilderPanel.children[0].children[4];
                        NCB_StartFrame.value = false;
                    NCR_BuildBttn = NewCamBuilderPanel.children[1].children[0];
                    NCR_HelpBttn = NewCamBuilderPanel.children[1].children[1];
                    /* tools panel */
                    ToolsPanel = myPanel.children[0].children[1];
                    CustomPresetsPanel = myPanel.children[0].children[1].children[0];
                    CustomPresetsPanel.enabled = false;
					PresetName = CustomPresetsPanel.children[0].children[0].text;
					SavePresetBttn = CustomPresetsPanel.children[0].children[1];
					PresetsList = CustomPresetsPanel.children[1].children[0];
					ApplyPresetbttn = CustomPresetsPanel.children[1].children[1];
					refreshListBttn = CustomPresetsPanel.children[2].children[0];
					OpenFolderbttn = CustomPresetsPanel.children[2].children[1];
					CP_helpButton = CustomPresetsPanel.children[2].children[2];
					BakeAnimPanel = myPanel.children[0].children[1].children[1];
					TargetCamName = BakeAnimPanel.children[1];
					TargetCamName.text = CamNameTemplate;
					TransTargetCamName = BakeAnimPanel.children[3];
					TransTargetCamName.text = TransCamNameTemplate;
					BA_exportbttn = BakeAnimPanel.children[4].children[0];
					BA_helpbttn = BakeAnimPanel.children[4].children[1];
                    
                    /* apply functions */
                    NCR_Focal.onChange =  NCR_Focal.onChanging = onFocalChanged;
                    NCR_AOV.onChange =  NCR_AOV.onChanging = onAOVChanged;
                    NCR_BuildBttn.onClick = CreateNewCamRig;
                    
                    #include "../(CameraRig v4.0)/CR_PresetsTool.jsx"
                    //loadScript ("CR_PresetsTool.jsx");
                    CR_buildCustomPresetsList(); // build the list of presets
                    ApplyPresetbttn.onClick = doLoadAnimPreset;
                    SavePresetBttn.onClick = doSaveAnimPreset;
                    refreshListBttn.onClick = CR_buildCustomPresetsList;
                    OpenFolderbttn.onClick = function () { PresetsFolder.path.execute(); };
                    
                    paramToExport = ["X Rotation", "Y Rotation", "Z Rotation", "Focal Length"];
					transParamToExport = ["X Translation", "Y Translation", "Z Translation"];
                    BA_exportbttn.onClick = CR_BakeAnimFn;
                    
                    if (myPanel instanceof Window)
					{
						myPanel.center();
						myPanel.show();
					}
                    else myPanel.layout.layout(true);
                }
        }
}
CameraRig(this);
