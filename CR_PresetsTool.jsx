 /* ANIM PRESETS TOOLS */
    function getCustomPresets(path)
        {
            var pathFiles = path.getFiles(), files = new Array(), subfiles;
            
            // Sort the entries in pathFiles
            pathFiles.sort(sortByName);
                    
            // Loop through the current folder's files and subfolders
            for (var i = 0; i < pathFiles.length; i++)
            if (pathFiles[i] instanceof Folder)
                {
                    // Skip recusion if folder's name is enclosed in parentheses
                    if (pathFiles[i].name.match(/^\(*.*\)$/)) continue;
                    else
                        {
                            // Recurse, and append contents - isn't there an easier way, like array addition?
                            subfiles = getCustomPresets(pathFiles[i]);
                            for (var j = 0; j < subfiles.length; j++)
                            files[files.length] = subfiles[j];
                        }
                }
            else
                {
                    // Add only files which start with "exp_" and end with ".txt"
                    if (pathFiles[i].name.match(/\.(xml)$/) && (pathFiles[i].fsName != File($.fileName).fsName))
                    files[files.length] = pathFiles[i];
                }	
            return files;
        }
    function CR_buildCustomPresetsList()
        {
            var PresetfullName;
            // Remove the existing list items
            PresetsList.removeAll();
            PresetsList.add("item", "Select preset");
            // Load the scripts from the Scripts folder hierarchy
            CustomPresetsFiles = getCustomPresets(PresetsFolder.path);
            var item;
            for (var i = 0; i < CustomPresetsFiles.length; i++)
                {
                    // Build the array of script names used in the UI, but strip off the base path 
                    // (and folder separator, assumed as one character)
                     PresetfullName = decodeURI(CustomPresetsFiles[i]);
                     tempName = PresetfullName.substring(PresetfullName.lastIndexOf("/")+1,PresetfullName.lastIndexOf("."));
                    // Add the script's name to the list box
                    item = PresetsList.add("item", tempName);
                }
            PresetsList.selection = 0; 
        }
    function doSaveAnimPreset ()
        {
            comp = app.project.activeItem;
            function writeXMLFile(file, xml)
                { 
                    if (!(xml instanceof XML))
                        { 
                             throw ("Bad XML parameter"); 
                        } 
                    else 
                        {
                            file.encoding = "UTF8"; 
                            file.open("w", "TEXT", "????"); 
                            // unicode signature, this is UTF16 but will convert to UTF8 "EF BB BF" 
                            file.write("\uFEFF"); 
                            file.write(xml.toXMLString()); 
                            file.close();
                            alert(presetName + " successfully created !");
                        };
                }; 
            /* creation of mains elements of xml - */
            text = "<PRESET>";
            for (var i=0; i < comp.selectedLayers.length; i++) // create LAYER entry in XML
                {
                    layer = comp.selectedLayers[i];
                    text = text + "<layer name=\"" + layer.name + "\" id=\"" + layer.index + "\">";
                    /* inside layer*/
                     for (var e=0; e < layer.selectedProperties.length; e++)
                        {
                                if (!layer.selectedProperties[e].canSetExpression)
                                {
                                    text = text + "<propertygroup name=\"" + layer.selectedProperties[e].name + "\" id=\"" + layer.selectedProperties[e].propertyIndex + "\" parentId=\"" + layer.selectedProperties[e].parentProperty.propertyIndex + "\"></propertygroup>"
                                }
                        }
                    /* end layer */
                    text = text + "</layer>";
                }
            /* end preset*/
            text = text + "</PRESET>";
            
            /* create the XML base from text */
            var PresetXML = new XML (text);
            // define variable from xml
            layers = PresetXML.layer ;
            
            // retrieve properties and values from comp in proper layer and propertygroup if parented
             for (var i=0; i < comp.selectedLayers.length; i++) // create LAYER entry in XML
                {
                    layer = comp.selectedLayers[i];
                    PR_layer = layers.(@id == layer.index);
                    propertyGroups = PR_layer.propertygroup ;
                    for (var e=0; e < layer.selectedProperties.length; e++)
                        {
                            if (layer.selectedProperties[e].canSetExpression)
                                {
                                    // it's a sub-property //
                                    property = layer.selectedProperties[e];
                                    if (propertyGroups.length() > 0)
                                        {
                                            for (var g=0; g < propertyGroups.length(); g++)
                                                {
                                                    if (property.parentProperty.propertyIndex == propertyGroups[g].@id && property.parentProperty.name == propertyGroups[g].@name)
                                                        {
                                                            target = propertyGroups[g];
                                                            text = "<property name=\"" + property.name + "\" id=\"" + property.propertyIndex + "\"><expression>" + String(property.expression) + "</expression><value>" + String(property.value) + "</value></property>";
                                                            propertyXML = new XML (text);
                                                            target.appendChild(propertyXML);
                                                        }
                                                    else
                                                        {
                                                            target = PR_layer;
                                                            text = "<property name=\"" + property.name + "\" id=\"" + property.propertyIndex + "\"><expression>" + property.expression + "</expression><value>" + String(property.value) + "</value></property>";
                                                            propertyXML = new XML (text);
                                                            target.appendChild(propertyXML);
                                                        }
                                                }
                                        }
                                    else
                                        {
                                            target = PR_layer;
                                            text = "<property name=\"" + property.name + "\" id=\"" + property.propertyIndex + "\"><expression>" + property.expression + "</expression><value>" + String(property.value) + "</value></property>";
                                            propertyXML = new XML (text);
                                            target.appendChild(propertyXML);
                                        }   
                                };
                        }
                }
           // SAVE PRESET/* define the name of preset --> do prompt */
            /* create and save the XML file with proper name in the "CameraRig" Presets folder */
            xmlfile = new File (PresetsFolder.path + "/" + PresetName + ".xml");
            writeXMLFile(xmlfile, PresetXML);
        }
    function doLoadAnimPreset ()
        {
            var propertiesArr = new Array ();
            comp = app.project.activeItem;
            custompreset = PresetsList.selection;
            if (custompreset.index != 0)
                {
                    /* XMLFile traitement */
                    xmlfile = new File (decodeURI(PresetsFolder.path)+ "/" +String(custompreset) + ".xml");
                    xmlfile.open("r");
                    var PresetXML = xmlfile.read();
                    var Preset = new XML (PresetXML);
                    xmlfile.close();
                    /* XML PARSING */
                    layers = Preset.layer;
                    for (var e=0; e< layers.length(); e++)
                        {
                            /* variables from xml */
                            PR_LayerName = layers[e].@name; 
                            PR_LayerIndex = Number(layers[e].@id);
                            PR_PropertyGroups = layers[e].propertygroup;
                            PR_properties = layers[e].property;
                            /* traitement */
                            if (comp.layer(PR_LayerIndex).name == PR_LayerName) // make sure with name comparision
                                {
                                    TargetLayer = comp.layer(PR_LayerName);
                                    for ( var i=0; i < PR_properties.length(); i++)
                                        {
                                            PR_property = PR_properties[i];
                                            TG_property = TargetLayer.property(String(PR_property.@name));
                                            TG_property.expression = PR_property.expression;
                                            TG_property.expression.enabled = true;
                                            propertiesArr.push(TG_property.name);
                                        }
                                     for ( var g=0; g < PR_PropertyGroups.length(); g++)
                                        {
                                            PR_PropertyGroup = PR_PropertyGroups[g];
                                            PR_PG_properties = PR_PropertyGroups[g].property;
                                            if (PR_PropertyGroup.@parentId == 5) /* if it's an effect */
                                                {
                                                    TG_Effect = TargetLayer.effect(PR_PropertyGroup.@name);
                                                    for ( var i=0; i < PR_PG_properties.length(); i++)
                                                        {
                                                            PR_property = PR_PG_properties[i];
                                                            TG_property = TG_Effect.property(String(PR_property.@name));
                                                            TG_property.expression = PR_property.expression;
                                                            TG_property.expression.enabled = true;
                                                            propertiesArr.push(TG_property.name);
                                                        }
                                                }
                                        }
                                }
                            else alert("Can't find layer : \n"+ PR_LayerName);
                            alert(custompreset + " Preset loaded to " + PR_LayerName);
                        };
                }
            else {alert("Please select a preset to load !");}
        }
