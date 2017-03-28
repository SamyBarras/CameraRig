/*
           CameraRig General Paths
    
    SCRIPT DEVELOPPED BY SAMY BARRAS
FOR "The Amazing World of Gumball" Production
            samy.barras@gmail.com

INFOS :
here are path that you can modify for using the CameraRig script
read infos to understand to what they are linked.
*/
startupFolder = Folder (Folder.startup);
var CR = new Object();	// Store globals in an object
CR.version = "4.0";
CR_scriptName = "CameraRig v" + CR.version;
CR_EffectPanelName = "CameraRig_ControlPanel v4.0"; // the name of effect installed in "PresetEffexts.xml" file
CR.scriptsFolder = Folder(decodeURI(startupFolder) + "/Scripts/("+CR_scriptName+"/)");
//
var PresetsFolder = new Object();
PresetsFolder.location = "external"; // "local" or "external" [in this case define PresetsFolder.externalpath]
PresetsFolder.external = "PresetsDirectory/"; // path as string
//
var BakeAnim= new Object();
BakeAnim.FolderLocation = "local"; // "external" [in this case define PresetsFolder.externalpath]
BakeAnim.FolderExternal = "C:/Users/.../Documents/maya/AFX_baked_anim/"; // path as string
BakeAnim.FileName = "temp.anim";
BakeAnim.option = "always"; // KeysOnly
BakeAnim.post = ""; // "open_File" OR "open_Folder" or empty
CamNameTemplate = "GB600EPISODE_SC###_RENDERCAM";
TransCamNameTemplate = "RENDERCAM_ANIM_TRANSLATION";
