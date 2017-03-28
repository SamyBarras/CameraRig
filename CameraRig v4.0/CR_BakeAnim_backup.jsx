            /* !!! FOR MAYA 2015 ONLY !!!  */
            /*
                animVersion 1.1;
                mayaVersion 2015
                timeUnit pal;
                linearUnit m;
                angularUnit deg;
                startTime 0;
                endTime 240;
            */
            header = "animVersion 1.1;\
            mayaVersion 2015;\
            timeUnit pal;\
            linearUnit m;\
            angularUnit deg;\
            startTime %startTime;\
            endTime %endTime;";
            /*
                anim rotate.rotateY rotateY test 0 1 1;
                animData {
                  input time;
                  output angular;
                  weighted 0;
                  preInfinity constant;
                  postInfinity constant;
                  keys {
                    1 10 auto auto 1 1 0;
                    2 15 linear linear 1 1 0;
                  }
                }
            */
            CurveData = "anim %animTarget %paramName %targetObj %param;\
            animData {\
              input time;\
              output %output;\
              weighted 0;\
              preInfinity constant;\
              postInfinity constant;\
              keys {\
              %keys\
              }\
            }";
            keyData = "%f %v %inType %outType 1 1 0;";
            /* GEN VARIABLES */
            try 
			{
				if (BakeAnim.FolderLocation == "local")
				{
					BakeAnim.Folderpath = Folder (decodeURI(Folder.myDocuments) + "/maya/AFX_baked_anim/");
					if (!BakeAnim.Folderpath.exists) BakeAnim.Folderpath.create();
				}
				else if (BakeAnim.FolderLocation == "external")
				{
					BakeAnim.Folderpath = Folder(BakeAnim.FolderExternal);
				};
				if (!BakeAnim.Folderpath.exists) BakeAnim.Folderpath.create();
			}
            catch (err)
			{
				alert(err.message);
			};

            // all parameters we want to export to target maya camera
            params = ["X Rotation","Y Rotation","Z Rotation", "Focal Length", "X Translation", "Y Translation", "Z Translation"]; // follow names from carmeraRig effect panel

            /* FUNCTIONS */
            function newCurve (targetObj, param)
			{
				/* variables */
				var outputVal, paramName, animTarget, paramVal, currentProperty, invert;
				newCurveData = String(CurveData);
				keysData = new Array (); // array to store all keys values
				// paramNames =  paramToExport
				var mult = 1;
				var origin = 0;
				if (param == params[4]) // X Translation
				{
					invert = true;
					outputVal = "linear";
					paramName = "translateX";
					animTarget = "translate.translateX";
					paramVal = "0 1 0";
					currentProperty = camera_travellingLyr.transform.position;
					propIndex = 0;
					mult = 0.002;
					origin = null;
				}
				else if (param == params[5]) // Y Translation
				{
					invert = false;
					outputVal = "linear";
					paramName = "translateY";
					animTarget = "translate.translateY";
					paramVal = "0 1 1";
					currentProperty = camera_travellingLyr.transform.position;
					propIndex = 1;
					mult = 0.002;
					origin = null;
				}
				else if (param == params[6]) // Z Translation
				{
					invert = false;
					outputVal = "linear";
					animTarget = "translate.translateZ";
					paramName = "translateZ";
					paramVal = "0 1 2";
					currentProperty = camera_travellingLyr.transform.position;
					propIndex = 2;
					mult = 0.002;
					origin = null;
				}
				else if (param == params[0]) // X Rotation
				{
					invert = false;
					outputVal = "angular";
					paramName = "rotateX";
					animTarget = "rotate.rotateX";
					paramVal = "1 1 0";
					currentProperty = camera_pitchLyr.transform.xRotation;
					propIndex = null;
				}
				else if (param == params[1]) // Y Rotation
				{
					invert = true;
					outputVal = "angular";
					paramName = "rotateY";
					animTarget = "rotate.rotateY";
					paramVal = "1 1 1";
					currentProperty = camera_headingLyr.transform.yRotation;
					propIndex = null;
				}
				else if (param == params[2]) // Z Rotation
				{
					invert = true;
					outputVal = "angular";
					animTarget = "rotate.rotateZ";
					paramName = "rotateZ";
					paramVal = "1 1 2";
					currentProperty = camera_pitchLyr.transform.zRotation;
					propIndex = null;
				}
				else if (param == params[3]) // Focal length
				{
					invert = false;
					keyType = "focalLenght"
					targetObj = targetObj + "Shape";
					outputVal = "unitless";
					animTarget = "focalLength";
					paramName = "focalLength";
					paramVal = "2 0 0";
					currentProperty = camera_rigLyr.effect(CR_EffectPanelName)(1);
					propIndex = null;
				}
				/* functions */
				function newKey (invert, frame, value, outputVal, inType, outType)
				{
					newKeyData = String(keyData); // replace auto by "linear" ?
					newKeyData = newKeyData.replace('%f', Number(frame));
					if ( invert == true ) { newKeyData = newKeyData.replace('%v', Number(-value)); }
					else { newKeyData = newKeyData.replace('%v', Number(value)); };
					newKeyData = newKeyData.replace('%inType', inType);
					newKeyData = newKeyData.replace('%outType', outType);
					keysData.push(newKeyData);
				}
				/* KEYS DATAS RETRIEVE */
				if (BakeAnim.option == "KeysOnly")
				{
					if (currentProperty.numKeys != 0) // the param is animated / bake the animation
					{
						/*  to do if want to work with only keyframes (do not bake the whole camera's anim)
								startKeyTime = timeToCurrentFormat(currentProperty.keyTime(1), 25, false);
								endKeyTime =  timeToCurrentFormat(currentProperty.keyTime(currentProperty.numKeys), 25, false);
								alert(startKeyTime + "\n" + endKeyTime);
								for (var i=startKeyTime; i <= endKeyTime; i++)
							*/
						for (var i=startTime; i <= endTime; i++)
						{
							timeStr = String(i - startTime);
							curTime = currentFormatToTime(timeStr, 25, true);
							value = currentProperty.valueAtTime(curTime, false);
							if (propIndex !== null)
								value = value[propIndex];
							if (origin === null)
								origin = value;
							value = mult * (value - origin);
							//alert(paramName + "\ntime : " + timeToCurrentFormat(curTime,25) + "\nvalue : " + value);
							newKey (invert, i, value, outputVal, "auto", "auto");
						}
					}
					else // retrieve only value at first frame of the comp
					{
						curTime = currentFormatToTime("0", 25, true);
						value = currentProperty.valueAtTime(curTime, false);
						if (propIndex !== null)
							value = value[propIndex];
						if (origin === null)
							origin = value;
						value = mult * (value - origin);
						newKey (invert, 1, value, outputVal, "auto", "auto"); // always start at frame 1 for maya animation
				   };
				}
				else if (BakeAnim.option == "always")
				{
					for (var i=startTime; i <= endTime; i++)
						{
							timeStr = String(i - startTime);
							curTime = currentFormatToTime(timeStr, 25, true);
							value = currentProperty.valueAtTime(curTime, false);
							if (propIndex !== null)
								value = value[propIndex];
							if (origin === null)
								origin = value;
							value = mult * (value - origin);
							newKey (invert, i, value, outputVal, "auto", "auto");
						}
				}
				else { alert ("\"BakeAnim.option\" is not correct : " + String(BakeAnim.option)); };
				/* CURVE REPLACE */
				newCurveData = newCurveData.replace('%targetObj', targetObj);
				newCurveData = newCurveData.replace('%animTarget', animTarget);
				newCurveData = newCurveData.replace('%paramName', paramName);
				newCurveData = newCurveData.replace('%output', outputVal);
				newCurveData = newCurveData.replace('%param', paramVal);
				newCurveData = newCurveData.replace('%keys', "\t"+keysData.join("\n\t"));
				
				temp = String(newCurveData);
				return newCurveData;
			}
			
            function writeFile (string)
                {
                    if (BakeAnim.Folderpath && String(BakeAnim.FileName).match(/(.anim)$/gi))
                        {
                            savePath = (decodeURI(BakeAnim.Folderpath) + "/" + BakeAnim.FileName);
                            var animFile = new File(savePath);
                            animFile.open("w:");
                            animFile.write (string);
                            animFile.close();
                            if (BakeAnim.post == "open_File") { animFile.execute(); }
                            else if (BakeAnim.post == "open_Folder") { BakeAnim.Folderpath.execute(); };
                        };
                }
