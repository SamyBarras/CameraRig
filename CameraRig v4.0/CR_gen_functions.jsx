function loadScript (script)
	{
		var scriptFile = new File(decodeURI(CR.scriptsFolder) +"/" + script);
		if (scriptFile.exists) { $.evalFile(scriptFile);}
		else alert(decodeURI(scriptFile) + "\n is missing", "name");
	}

function sortByName(a, b)
    {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        else return 0;
    }

function onFocalChanged()
    {
        focalLength = this.text;
        f = focalLength;
        AOV = (2*(Math.atan(36/(2*f)))*(180/Math.PI));
        NCR_AOV.text = AOV.toFixed(2);
    }

function onAOVChanged ()
    {
        AOV = this.text;
        focalLength = (18*(1/Math.tan((Math.PI*AOV)/360)));
        NCR_Focal.text = focalLength.toFixed(2);
    }  
