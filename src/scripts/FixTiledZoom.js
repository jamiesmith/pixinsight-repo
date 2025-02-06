/* PURPOSE
   LICENSE
   This script based on the "An Introduction to PixInsight PJSR Scripting" workshop.
   See: https://gitlab.com/roberto.sartori/pixinsight-introduction-scripts
   Copyright (C) 2020 Roberto Sartori.
   Copyright (C) 2024 Jamie Smith.

   This program is free software: you can redistribute it and/or modify it
   under the terms of the GNU General Public License as published by the
   Free Software Foundation, version 3 of the License.

   This program is distributed in the hope that it will be useful, but WITHOUT
   ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
   FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
   more details.

   You should have received a copy of the GNU General Public License along with
   this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#feature-id    FixTiledZoom_<VERSION> : TheAstroShed > Fix the zoom for tiled windows
#feature-info  This script renames the target view after the filter name

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>
#include "FixTiledZoom-stf.js"
#include "theAstroShed-utils.js"

// define a global variable containing script's parameters
var FixTiledZoomParameters = {
    targetView: undefined,
    zoom: getOptimalZoom(),
    autoZoom: false,

    // stores the current parameters values into the script instance
    save: function() {
        Parameters.set("zoom", FixTiledZoomParameters.zoom);
        Parameters.set("autoZoom", FixTiledZoomParameters.autoZoom);
    },

    // loads the script instance parameters
    load: function() {

        FixTiledZoomParameters.zoom = (Parameters.has("zoom")) ? Parameters.getInteger("zoom") : getOptimalZoom();
        console.writeln("in load " + FixTiledZoomParameters.zoom);
        if (Parameters.has("autoZoom"))
        {
            FixTiledZoomParameters.autoZoom = Parameters.getBoolean("autoZoom");
            if (FixTiledZoomParameters.autoZoom)
            {
                FixTiledZoomParameters.zoom = getOptimalZoom();
            }
        }        
    }
}

function getOptimalZoom()
{
    var windows = ImageWindow.windows;
    var zoom = 0;
    var maxZoom = 0;

    for ( var w in windows ) {
        var window = windows[w];
        zoom = getOptimalZoomForWindow(window);

        maxZoom = (zoom > maxZoom) ? zoom : maxZoom;
    }
    console.writeln(format("returning [%d]", maxZoom));
    return maxZoom;
}

function zoomAllMainViews()
{
    var images = ImageWindow.windows;
    var zoomOut = FixTiledZoomParameters.zoom;
    
    for ( var i in images ) {
        if (images[i].mainView.isMainView && images[i].visible && (!images[i].iconic)) {
            if (FixTiledZoomParameters.autoZoom)
            {
                zoomOut = getOptimalZoomForWindow(images[i]);
            }
            
            images[i].zoomFactor = -1 * zoomOut;
        }
    }
}

function viewIsStretched(view)
{
    // For large images I think it's faster to check than do the stretch
    //
    var stretched = false;
    var lastSTF = null;
    // I don't know how to do this. If all of the STFs are the same, assume it's not stretched
    //
    for (var i = 0; i < view.stf.length ; i++){
        stf = view.stf[i];
        if (!lastSTF) {
            lastSTF = stf;
        }
        else {
            if (JSON.stringify(stf) != JSON.stringify(lastSTF)) {
                stretched = true;
                break;
            }
        }
    }
    return stretched;
}

function getAllMainViews()
{
    var mainViews = [];
    var images = ImageWindow.windows;
    for ( var i in images ) {
        if (images[i].mainView.isMainView && images[i].visible && (!images[i].iconic)) {            
            mainViews.push(images[i].mainView);
        }
    }
    return mainViews;
}

function applyToAll()
{
    zoomAllMainViews();
    var vl = new getAllMainViews();

    for (var i = 0; i < vl.length; i++)
    {
        STFAutoStretch( vl[i]);
    }
}

/*
 * Construct the script dialog interface
 */
function FixTiledZoomDialog()
{
    this.__base__ = Dialog;
    this.__base__();

    this.stfApplied = false;

    // let the dialog to be resizable by dragging its borders
    this.userResizable = false;

    // set the minimum width of the dialog
    //
    this.scaledMinWidth = 240;
    this.scaledMaxWidth = 340;

    // set the minimum width of the dialog
    //
    this.scaledMinheight = 300;
    this.scaledMaxheight = 200;

    // create a title area
    //
    this.title = new TextBox(this);
    this.title.text = "<b>Stretch and Fit</b><br><br>Tile the windows and autostretch them all" +
    "<br><br>When set to auto it tries to calculate the best zoom to fit in the window ";

    this.title.readOnly = true;
    this.title.backroundColor = 0x333333ff;
    this.title.minHeight = 100;
    this.title.maxHeight = 100;

    // Add create instance button
    //
    this.newInstanceButton = new ToolButton( this );
    this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
    this.newInstanceButton.setScaledFixedSize( 24, 24 );
    this.newInstanceButton.toolTip = "Save Instance";
    this.newInstanceButton.onMousePress = () => {
        // stores the parameters
        FixTiledZoomParameters.save();
        // create the script instance
        this.newInstance();
    };

    // Add apply global button
    //
    this.applyGlobalButton = new ToolButton( this );
    this.applyGlobalButton.icon = this.scaledResource( ":/process-interface/apply-global.png" );
    this.applyGlobalButton.setScaledFixedSize( 24, 24 );
    this.applyGlobalButton.toolTip = "Apply Global";
    this.applyGlobalButton.onMousePress = () => {
        applyToAll();
        // zoomAllMainViews();
        // var vl = new getAllMainViews();
        // let autoSTF = new AutoStretch();
        //
        // for (var i = 0; i < vl.length; i++)
        // {
        //     if (!viewIsStretched(vl[i])) {
        //         autoSTF.Apply( vl[i], false );
        //     }
        // }
    };

    this.buttonSizer = new HorizontalSizer;
    this.buttonSizer.margin = 8;
    this.buttonSizer.add(this.newInstanceButton)
    this.buttonSizer.addSpacing( 8 );
    this.buttonSizer.add(this.applyGlobalButton)
    this.buttonSizer.addStretch();

    // Set up the zoom spinner field
    //
    this.zoomSpinner_Label = new Label( this );
    this.zoomSpinner_Label.text = "Zoom:";
    this.zoomSpinner_Label.toolTip = "Select Zoom Level";
    this.zoomSpinner_Label.textAlignment = TextAlign_Right | TextAlign_VertCenter;

    this.zoomSpinner = new SpinBox( this );
    this.zoomSpinner.setRange( -15, 15 );
    
    this.zoomSpinner.value = FixTiledZoomParameters.zoom;
    // FixTiledZoomParameters.zoom = currentZoom;
    this.zoomSpinner.setFixedWidth( 50 );
    this.zoomSpinner.toolTip = "Select Zoom Level";
    this.zoomSpinner.onValueUpdated = function( value )
    {
        FixTiledZoomParameters.zoom = value;
    };
    this.zoomSpinner.enabled = !FixTiledZoomParameters.autoZoom;

    this.zoomSpinner_Sizer = new HorizontalSizer;
    this.zoomSpinner_Sizer.spacing = 4;
    this.zoomSpinner_Sizer.add( this.zoomSpinner_Label );
    this.zoomSpinner_Sizer.add( this.zoomSpinner );
    this.zoomSpinner_Sizer.addStretch();

    this.autoZoomCheckBox = new CheckBox( this );
    this.autoZoomCheckBox.text = "Automatic Zoom Calculation";
    this.autoZoomCheckBox.toolTip = "<p>Selects the optimal/average zoom to fit the windows as they are</p>";
    this.autoZoomCheckBox.checked = FixTiledZoomParameters.autoZoom == true;
    this.autoZoomCheckBox.onCheck = function( checked )
    {
        FixTiledZoomParameters.autoZoom = checked;
        if (checked)
        {
            this.dialog.zoomSpinner.value = getOptimalZoom();
            var images = ImageWindow.windows;
            for ( var i in images ) {
                if (images[i].mainView.isMainView) {
                    if (FixTiledZoomParameters.autoZoom)
                    {
                        getOptimalZoomForWindow(images[i]);
                    }
                }
            }
            console.writeln("--");
            
        }
        this.dialog.zoomSpinner.enabled = !checked;
    };

    this.autoZoomSizer = new HorizontalSizer;
    // this.autoZoomSizer.addUnscaledSpacing( labelWidth1 + this.logicalPixelsToPhysical( 4 ) );
    this.autoZoomSizer.add( this.autoZoomCheckBox );
    this.autoZoomSizer.addStretch();

    // layout the dialog
    //
    this.sizer = new VerticalSizer;
    this.sizer.margin = 8;
    this.sizer.add(this.title);
    this.sizer.addSpacing(8);
    this.sizer.add(this.autoZoomSizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.zoomSpinner_Sizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

FixTiledZoomDialog.prototype = new Dialog;

function main()
{
    // hide the console until we need it
    //
    // console.hide();

    // perform the script on the target view
    //
    if (Parameters.isViewTarget)
    {
        // load parameters
        //
        FixTiledZoomParameters.load();
        // This is a cheap way to _not_ have to execute and just drop it on one image
        //
        applyToAll();
        return;
    }

    // is script started from an instance in global context
    //
    if (Parameters.isGlobalTarget)
    {
        // load the parameters from the instance
        FixTiledZoomParameters.load();
    }

    // direct contect, create and show the dialog
    //
    let dialog = new FixTiledZoomDialog;

    dialog.execute();
}

main();
