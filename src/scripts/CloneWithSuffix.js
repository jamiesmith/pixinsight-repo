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

#feature-id    CloneWithSuffix_<VERSION> : TheAstroShed > Clone an Image with the same name plus a suffix
#feature-info  Clone an image with the same name plus a suffix

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>
#include "theAstroShed-utils.js"

// define a global variable containing script's parameters
var CloneWithSuffixParameters = {
    targetView: undefined,
    suffix: "",
    iconizeAfterClone: false,

    // stores the current parameters values into the script instance
    save: function() {
        Parameters.set("suffix", CloneWithSuffixParameters.suffix);
        Parameters.set("iconizeAfterClone", CloneWithSuffixParameters.iconizeAfterClone);        
    },

    // loads the script instance parameters
    load: function() {
        if (Parameters.has("suffix"))
        {
            CloneWithSuffixParameters.suffix = Parameters.getString("suffix")
        }
        if (Parameters.has("iconizeAfterClone"))
        {
            CloneWithSuffixParameters.iconizeAfterClone = Parameters.getBoolean("iconizeAfterClone");
        }        
    }
}

/*
 * Construct the script dialog interface
 */
function CloneWithSuffixDialog() 
{
    this.__base__ = Dialog;
    this.__base__();

    // let the dialog to be resizable by dragging its borders
    this.userResizable = false;

    // set the minimum width of the dialog
    //
    this.scaledMinWidth = 400;
    this.scaledMaxWidth = 400;

    // set the minimum height of the dialog
    //
    this.scaledMinheight = 260;
    this.scaledMaxheight = 260;

    // create a title area
    //
    this.title = new TextBox(this);
    this.title.text = "<b>Clone an image, appending <i><suffix></i> to the ID</b>" +
        "<br>For example, if the suffix is '_linear', and the image is 'Ha', the new image will be named <b>Ha_linear</b>" +
        "<br><br><b>Usage:</b>" +
        "<br>This is intended to be used in a set of saved process icons" +
        "<br>Drag a new instance onto your workspace, then drop that Script Process Icon on a single image to clone with suffix" +
        "<br>" +
        "Note that if the source has an astrometric solution it will be copied as well";
    
    this.title.readOnly = true;
    this.title.backroundColor = 0x333333ff;
    this.title.minHeight = 170;
    this.title.maxHeight = 170;

    // Add create instance button
    //
    this.newInstanceButton = new ToolButton( this );
    this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
    this.newInstanceButton.setScaledFixedSize( 24, 24 );
    this.newInstanceButton.toolTip = "Save Instance";
    this.newInstanceButton.onMousePress = () => {
        // stores the parameters
        CloneWithSuffixParameters.save();
        // create the script instance
        this.newInstance();
    };

    this.buttonSizer = new HorizontalSizer;
    this.buttonSizer.margin = 8;
    this.buttonSizer.add(this.newInstanceButton)
    this.buttonSizer.addStretch();

    // Set up the suffix field
    //
    this.suffixLabel = new Label (this);
    this.suffixLabel.text = "Suffix:";
    this.suffixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.suffixEdit = new Edit( this );
    this.suffixEdit.text = CloneWithSuffixParameters.suffix;
    this.suffixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.suffixEdit.toolTip = "Text to add to the start of the view name";
    this.suffixEdit.onTextUpdated = function()
    {
        CloneWithSuffixParameters.suffix = this.text;
    };


    this.iconizeCloneCheckBox = new CheckBox( this );
    this.iconizeCloneCheckBox.text = "Iconize Clone";
    this.iconizeCloneCheckBox.toolTip = "<p>Check this to iconize the resulting clone</p>";
    this.iconizeCloneCheckBox.checked = CloneWithSuffixParameters.iconizeAfterClone == true;
    this.iconizeCloneCheckBox.onCheck = function( checked )
    {
        CloneWithSuffixParameters.iconizeAfterClone = checked;
    };

    this.suffixSizer = new HorizontalSizer;
    this.suffixSizer.spacing = 4;
    this.suffixSizer.add( this.suffixLabel );
    this.suffixSizer.addSpacing( 8 );
    this.suffixSizer.add( this.suffixEdit );
    this.suffixSizer.addStretch();

    // layout the dialog
    //
    this.sizer = new VerticalSizer;
    this.sizer.margin = 8;
    this.sizer.add(this.title);
    this.sizer.addSpacing(8);
    this.sizer.add(this.suffixSizer);
    this.sizer.addSpacing(8);
    this.sizer.add( this.iconizeCloneCheckBox );
    this.sizer.addSpacing(8);
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

CloneWithSuffixDialog.prototype = new Dialog;

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
        CloneWithSuffixParameters.load();
        var clonedView = cloneView(Parameters.targetView, Parameters.targetView.id + CloneWithSuffixParameters.suffix);
        console.warningln("clone View: " + clonedView.id);
        
        if (CloneWithSuffixParameters.iconizeAfterClone)
        {
            clonedView.window.iconize();
        }
        
        // Leaving this for posterity but copying the properties takes care of it
        //
        // copyAstrometricSolution(Parameters.targetView, clonedView);        
        return;
    }

    // is script started from an instance in global context
    //
    if (Parameters.isGlobalTarget) 
    {
        // load the parameters from the instance
        //
        CloneWithSuffixParameters.load();
    }

    // direct context, create and show the dialog
    //
    let dialog = new CloneWithSuffixDialog;

    dialog.execute();
}

main();
