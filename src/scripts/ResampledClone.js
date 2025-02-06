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

#feature-id    ResampledClone_<VERSION> : TheAstroShed > Clone and Resize target image
#feature-info  Clone and Resize target image

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>
#include "theAstroShed-utils.js"

// define a global variable containing script's parameters
//
var ResampledCloneParameters = {
    targetView: undefined,
    maxSideLengthInPixels: "",

    // stores the current parameters values into the script instance
    //
    save: function() {
        Parameters.set("maxSideLengthInPixels", ResampledCloneParameters.maxSideLengthInPixels);
    },

    // loads the script instance parameters
    load: function() {
        if (Parameters.has("maxSideLengthInPixels"))
        {
            ResampledCloneParameters.maxSideLengthInPixels = Parameters.getString("maxSideLengthInPixels")
        }
    }
}

function executeOperation(view, targetMaxSideSize)
{
    let cloneViewId = view.id + "_" + ResampledCloneParameters.maxSideLengthInPixels + "px";
 
    let actualMaxSideSize = view.image.bounds.x1;
    if (view.image.bounds.y1 > maxSide)
    {
        actualMaxSideSize = view.image.bounds.y1;
    }
    
    let ratio = targetMaxSideSize / actualMaxSideSize;

    if (ratio >= 1)
    {
        console.warningln("Error: Scaled size target(" + targetMaxSideSize + ") must be smaller than the max side [" + targetMaxSideSize + "], aborting");
        return;
    }
    let clonedView = cloneView(view, cloneViewId);
    
    resampleView(clonedView, ratio);
    clonedView.window.zoomToOptimalFit();
}

/*
 * Construct the script dialog interface
 */
function ResampledCloneDialog() 
{
    this.__base__ = Dialog;
    this.__base__();

    // let the dialog to be resizable by dragging its borders
    this.userResizable = false;

    // set the minimum width of the dialog
    //
    this.scaledMinWidth = 450;
    this.scaledMaxWidth = 450;

    // set the minimum height of the dialog
    //
    this.scaledMinheight = 300;
    this.scaledMaxheight = 300;

    // create a title area
    //
    this.title = new TextBox(this);
    
    this.title.text = "<b>Clone an image and resample it to desired size</b>" +
        "<br><br><b>Usage:</b>" +
        "<br><b>- As a saved process Icon:</b> Drop the icon on a visible image to clone/resize" +
        "<br>" +
        "<br><b>- Applied to Active Image (square):</b>clone and resize active image";
    
    this.title.readOnly = true;
    this.title.backroundColor = 0x333333ff;
    this.title.minHeight = 150;
    this.title.maxHeight = 150;

    this.applyButton = new ToolButton( this );
    this.applyButton.icon = this.scaledResource( ":/process-interface/apply.png" );
    this.applyButton.setScaledFixedSize( 24, 24 );
    this.applyButton.toolTip = "Clone and resize active view";
    this.applyButton.onMousePress = () => {
        // this.ok();
        executeOperation(ImageWindow.activeWindow.currentView, ResampledCloneParameters.maxSideLengthInPixels);
    };

    // Add create instance button
    //
    this.newInstanceButton = new ToolButton( this );
    this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
    this.newInstanceButton.setScaledFixedSize( 24, 24 );
    this.newInstanceButton.toolTip = "Save Instance";
    this.newInstanceButton.onMousePress = () => {
        // stores the parameters
        ResampledCloneParameters.save();
        // create the script instance
        this.newInstance();
    };

    this.buttonSizer = new HorizontalSizer;
    this.buttonSizer.margin = 8;
    this.buttonSizer.add(this.newInstanceButton)
    this.buttonSizer.addSpacing( 8 );
    this.buttonSizer.add(this.applyButton)
    this.buttonSizer.addStretch();

    // Set up the maxSideLengthInPixels field
    //
    this.maxSideLengthInPixelsLabel = new Label (this);
    this.maxSideLengthInPixelsLabel.text = "Maximum Size side (in pixels):";
    this.maxSideLengthInPixelsLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.maxSideLengthInPixelsEdit = new Edit( this );
    this.maxSideLengthInPixelsEdit.text = ResampledCloneParameters.maxSideLengthInPixels;
    this.maxSideLengthInPixelsEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.maxSideLengthInPixelsEdit.toolTip = "Enter the maximum length side to target for resample (images will not be scaled up)";
    this.maxSideLengthInPixelsEdit.onTextUpdated = function()
    {
        ResampledCloneParameters.maxSideLengthInPixels = this.text;
    };

    this.maxSideLengthInPixelsSizer = new HorizontalSizer;
    this.maxSideLengthInPixelsSizer.spacing = 1;
    this.maxSideLengthInPixelsSizer.add( this.maxSideLengthInPixelsLabel );
    this.maxSideLengthInPixelsSizer.addSpacing( 3 );
    this.maxSideLengthInPixelsSizer.add( this.maxSideLengthInPixelsEdit );
    this.maxSideLengthInPixelsSizer.addStretch();

    // layout the dialog
    //
    this.sizer = new VerticalSizer;
    this.sizer.margin = 8;
    this.sizer.add(this.title);
    this.sizer.addSpacing(8);
    this.sizer.add(this.maxSideLengthInPixelsSizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

ResampledCloneDialog.prototype = new Dialog;

function main() 
{
    // hide the console until we need it
    //
    console.hide();

    // perform the script on the target view
    //
    if (Parameters.isViewTarget) 
    {
        // load parameters
        //
        ResampledCloneParameters.load();
        
        executeOperation(Parameters.targetView, ResampledCloneParameters.maxSideLengthInPixels);        
        return;
    }

    // direct context, create and show the dialog
    //
    let dialog = new ResampledCloneDialog;

    dialog.execute();
}

main();
