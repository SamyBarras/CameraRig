/*
    check if "CameraRig" folder exists in Project panel
    if yes : check the folder content and delete the whole folder if an object (null) of the CameraRig is missing
    else : continue
*/
CameraRigFolderExists = false; // usually the folder does not exist
for (var s=1; s <= app.project.numItems; s++) 
    {
        temp = app.project.item(s);
        if (temp instanceof FolderItem && temp.name == "CameraRig")
            {
                CameraRigFolderExists = true ;
                // check si items du rig existent dans le dossier CameraRig
                var listlayers = ["camera_heading","camera_pitch","CAMERA_RIG","camera_travelling"];
                var listItems = new Array();
                var lookup = {};
                for (var i = 1; i <= app.project.item(s).numItems; i++)
                    {
                        listItems.push(app.project.item(s).item(i).name);
                    };
                for (var j in listItems)
                    {
                        lookup[listItems[j]] = listItems[j];
                    }
                for (var i=0; i < listlayers.length; i++)
                    {
                        if (lookup[listlayers[i]] == null)
                            {
                                temp.remove();
                                CameraRigFolderExists = false;
                            }
                    };
            }
        else
            {
                if (CameraRigFolderExists != true) // a "CameraRig" folder has not already been find
                    {
                        CameraRigFolderExists = false;
                    }
            }
    };
/*
    if "CameraRig" does not exist :
        - temporary rename the "Solids" folder if exists
        - create null objects used for the CameraRig
        - rename the new "Solids" folder to "CameraRig"
        - get back old "Solids" folder with proper name
*/
var CameraRigFolder;
if (CameraRigFolderExists == false)
    {
        // rename Solid Foder 
        orig_solidsdir = new Array() ; // will store all "Solids" folders
        for (var s = 1; s <= app.project.numItems; s++) 
            {
                if (app.project.item(s) instanceof FolderItem && app.project.item(s).name == "Solids")
                    {
                        orig_solidsdir.push(app.project.item(s));	
                        app.project.item(s).name = "temp_Solids";
                    };
            };
        // null creation // will create a new "Solids" folder
        camera_heading = comp.layers.addNull(); camera_heading.remove();
        camera_pitch = comp.layers.addNull(); camera_pitch.remove();
        camera_rig = comp.layers.addNull(); camera_rig.remove();
        camera_travelling = comp.layers.addNull(); camera_travelling.remove();
        // on renomme les solids et leur folder "solids" cree par le script
        for (var e = 1; e <= app.project.numItems; e++)
            {
                test = app.project.item(e);
                if (test instanceof FolderItem && test.name == "Solids")
                    { 
                        var item1 = test.item(1); item1.name = "camera_heading";
                        var item2 = test.item(2); item2.name = "camera_pitch";
                        var item3 = test.item(3); item3.name = "CAMERA_RIG";
                        var item4 = test.item(4); item4.name = "camera_travelling";
                          
                        CameraRigFolder = test;
                        CameraRigFolder.name = "CameraRig";
                    };
            };
        // on renomme l'ancien folder "Solids"
        if (orig_solidsdir.length != 0)
            {
                for (var e=0; e < orig_solidsdir.length; e++) { orig_solidsdir[e].name = "Solids"; };
            };
    }
else
    {
        for (var s=1; s <= app.project.numItems; s++) 
            {
                temp = app.project.item(s);
                if (temp instanceof FolderItem && temp.name == "CameraRig")
                    {
                        CameraRigFolder = temp;
                   }
            }
    };
/*
    set as variables the null objects for the CameraRig
*/
if (CameraRigFolder instanceof FolderItem && CameraRigFolder.name == "CameraRig")
    {
        try {
        // defini variable pour creer layer avec ces items
        Itemcamera_heading = CameraRigFolder.item(1);
        Itemcamera_pitch = CameraRigFolder.item(2);
        ItemCameraRig = CameraRigFolder.item(3);
        Itemcamera_travelling = CameraRigFolder.item(4);
            }
        catch(err) { alert (err.message); };
    }
else { alert("CameraRig objects not found !"); };
