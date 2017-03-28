/*
Analyse the "presetEffects.xml" file in application folder
and install or update presets for CameraRig plug-in
*/
// first need to check if "allow script to write" pref is enabled :
while (!app.preferences.getPrefAsLong("Main Pref Section","Pref_SCRIPTING_FILE_NETWORK_SECURITY"))
    {
         // >> need to advise the user and ask him to change property status and restart after effects
        alert("Please tick the \"Allow Scripts to Write Files and Access Network\" checkbox if Preferences > General");
        // Then open Preferences > General to let people tick the checkbox
        app.executeCommand(2359);
    }

#include "../(CameraRig v4.0)/CR_gen_var.jsx"
function checkIfEffectExists () // to start when script launch
        {
            CR_EffectPanelNameExists = false;
            for (var e=0; e < app.effects.length; e++)
                {
                    if (app.effects[e].matchName == CR_EffectPanelName) { CR_EffectPanelNameExists = true; };
                }
            return CR_EffectPanelNameExists;
        }

// first need to check if "allow script to write" pref is enabled :
if(app.preferences.getPrefAsLong("Main Pref Section","Pref_SCRIPTING_FILE_NETWORK_SECURITY"))
    {
        CR_Exists  = checkIfEffectExists ();
        if (CR_Exists == false)
            {
                PresetEffectsXMLFile = new File(decodeURI(startupFolder) + "/PresetEffects.xml");
                if (app.version >= "10.5x253") // After Effect CS5
                    {
                        newPresetsFile = new File (decodeURI(CR.scriptsFolder)+ "/CS5_PresetEffects.xml");
                        if (newPresetsFile.exists)
                            {
                                newPresetsFile.open("r");
                                var newPresetsString = newPresetsFile.read();
                                var newEffectsRoot = new XML (newPresetsString);
                                new_camrigeffect = newEffectsRoot.Effect.(@matchname == CR_EffectPanelName);
                                new_camrigeffectVersion = new_camrigeffect.@version.toString();
                                newPresetsFile.close();
                            }
                        else;
                    }
                else  // older version than After Effect CS5
                    {
                        alert("The version of After Effects is too old !");
                    };
                if (PresetEffectsXMLFile.exists && new_camrigeffect && new_camrigeffectVersion) // it's supposed to exists
                    {
                        /*
                                # open and analyse XML file : "PresetEffects.xml" in local AE folder
                                # delete existing "CameraRig_ControlPanel" &  "GumballShake" effect presets
                            */
                        PresetEffectsXMLFile.open("r");
                        var PresetEffectsXMLString = PresetEffectsXMLFile.read();
                        var EffectsRoot = new XML (PresetEffectsXMLString);
                        
                        if (PresetEffectsXMLString.length != 0)
                            {
                                camrigeffect = EffectsRoot.Effect.(@matchname == CR_EffectPanelName);
                                /*
                                        if effects with "CameraRig_ControlPanel" found in PresetEffects.xml file
                                            - compare version of effect with new_PresetsVersion
                                            - if different, delete the Effect, if same, keep the effect
                                        then, append unexisting effects preset at the end of XML file
                                    */
                                update = "";
                                if (camrigeffect.length == 0) // no cameraRig effect installed
                                    {
                                        EffectsRoot.appendChild(new_camrigeffect);
                                        update = update + CR_EffectPanelName +" v." + new_camrigeffectVersion+ "\n";
                                    }
                                else
                                    {
                                        for (var e=0; e < camrigeffect.length; e++)
                                            {
                                                version = EffectsRoot.Effect[camrigeffect[e].childIndex].@version.toString();
                                                if (version < new_camrigeffectVersion)
                                                {
                                                   delete EffectsRoot.Effect[camrigeffect[e].childIndex];
                                                   EffectsRoot.appendChild(new_camrigeffect);
                                                   update = update + CR_EffectPanelName + "\n";
                                                }
                                            }
                                    };
                            }
                        else
                            {
                                alert('PresetEffects.xml is empty !');
                                EffectsRoot = newEffectsRoot;
                                 update = update + CR_EffectPanelName + "\n";
                            }
                        // close XML file to re-write it later using EffectsRoot update
                        PresetEffectsXMLFile.close();
                        /* re-write PresetEffects.xml  */
                        PresetEffectsXMLFile = new File(PresetEffectsXMLFile);
                        PresetEffectsXMLFile.open("w","TEXT","????");
                        PresetEffectsXMLFile.write (EffectsRoot.toString());
                        PresetEffectsXMLFile.close();
                        
                        if (update.length != 0)
                            {
                                var restartAE = confirm("Following preset effects have been installed :\n" + update + "\nDo you want to restart After Effect now to make changes effective.");
                                if (restartAE)
                                    {
                                        currentproject = new File (app.project.file);
                                        if (currentproject.exists) // si project AE ouvert
                                            {
                                                app.quit();
                                                app.open(currentproject);
                                             }
                                        else
                                            {
                                                savePath = String(decodeURI(startupFolder) + "/restartAE.bat");
                                                var txtFile = new File(savePath);
                                                txtFile.open("w","TEXT","????");
                                                txtFile.write ("@ECHO OFF\n");
                                                txtFile.write ("taskkill /f /im afterfx.exe\n");
                                                txtFile.write ("start afterfx.exe");
                                                // .bat close and execute
                                                txtFile.close();                            
                                                txtFile.execute();
                                             }
                                    }
                                else;
                             }
                    }
                else
                    {
                        alert("CameraRig's presets installation failed. \nThe script will not working correctly.\n Please try to re-install the plugin.");
                    }
            };

    }
else
    {
        //script can't write to Files
        // >> need to advise the user and ask him to change property status and restart after effects
        alert("Please tick the \"Allow Scripts to Write Files and Access Network\" checkbox if Preferences > General");

    // Then open Preferences > General to let people tick the checkbox
    app.executeCommand(2359);
    }
