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

#feature-id    IconizeCloneWithSuffix_<VERSION> : TheAstroShed > Iconize a child image
#feature-info  If a child view exists with a matching suffix, iconize it (A child image is defined as something that has the Parent views ID as a prefix)

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>

// define a global variable containing script's parameters
var IconizeCloneWithSuffixParameters = {
    targetView: undefined,
    suffix: "",

    // stores the current parameters values into the script instance
    save: function() {
        Parameters.set("suffix", IconizeCloneWithSuffixParameters.suffix);
    },

    // loads the script instance parameters
    load: function() {
        if (Parameters.has("suffix"))
        {
            IconizeCloneWithSuffixParameters.suffix = Parameters.getString("suffix")
        }
    }
}

function iconizeView(viewIdToIconize)
{
    console.warningln("Iconizing view: [" + viewIdToIconize + "]");
    let view = View.viewById(viewIdToIconize);
    try 
    {
        view.window.iconize();
    }
    catch (err)
    {
        
    }
}

function executeOperation(view)
{
    let cloneViewId = view.id + "_" + IconizeCloneWithSuffixParameters.suffix;
    console.warningln("Parent View: " + view.id + " child view:" + cloneViewId);
    iconizeView(cloneViewId);
}

/*
 * Construct the script dialog interface
 */
function IconizeCloneWithSuffixDialog() 
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
    this.scaledMinheight = 360;
    this.scaledMaxheight = 360;

    // create a title area
    //
    this.title = new TextBox(this);
    
    
    this.title.text = "<b>Iconize Matching Child Image(s)</b>" +
        "<br>If a child view exists with a matching suffix, iconize it " +
        "(A child image is defined as something that has the Parent view's ID as a prefix)" +
        "<br>" +
        "<br><b>Example:</b>" +
        "<br>If the target image is <b>Ha</b> and the suffix is <b>linear</b> and there's an <b>Ha_linear</b> view, iconize it." +
        "<br><br><b>Usage:</b>" +
        "<br><b>- As a saved process Icon:</b> Drop the icon on a visible <b>parent</b> image to iconize related child" +
        "<br>" +
        "<br><b>- Applied to Active Image (square):</b> Iconize related child of the target with the specified suffix" +
        "<br>" +
        "<br><b>- Applied Globally (circle):</b> Iterate through all visible instances and iconizes each matching child";
    
    this.title.readOnly = true;
    this.title.backroundColor = 0x333333ff;
    this.title.minHeight = 250;
    this.title.maxHeight = 250;

    this.applyButton = new ToolButton( this );
    this.applyButton.icon = this.scaledResource( ":/process-interface/apply.png" );
    this.applyButton.setScaledFixedSize( 24, 24 );
    this.applyButton.toolTip = "Execute against selected view";
    this.applyButton.onMousePress = () => {
        // this.ok();
        executeOperation(ImageWindow.activeWindow.currentView);
    };

    // Add create instance button
    //
    this.newInstanceButton = new ToolButton( this );
    this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
    this.newInstanceButton.setScaledFixedSize( 24, 24 );
    this.newInstanceButton.toolTip = "Save Instance";
    this.newInstanceButton.onMousePress = () => {
        // stores the parameters
        IconizeCloneWithSuffixParameters.save();
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
        // applyGlobally();
        var vl = new getAllMainViews();

        for (var i = 0; i < vl.length; i++)
        {
            console.show();
            let view = vl[i];
            let viewName = view.id;
            if (viewName.indexOf("_") <= 0)
            {
                console.writeln("Apply Global to parent: " + viewName);
                executeOperation(view);
            }
        }
    };

    this.buttonSizer = new HorizontalSizer;
    this.buttonSizer.margin = 8;
    this.buttonSizer.add(this.newInstanceButton)
    this.buttonSizer.addSpacing( 8 );
    this.buttonSizer.add(this.applyButton)
    this.buttonSizer.addSpacing( 8 );
    this.buttonSizer.add(this.applyGlobalButton)
    this.buttonSizer.addStretch();

    // Set up the suffix field
    //
    this.suffixLabel = new Label (this);
    this.suffixLabel.text = "Suffix of child to iconize:";
    this.suffixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.suffixEdit = new Edit( this );
    this.suffixEdit.text = IconizeCloneWithSuffixParameters.suffix;
    this.suffixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.suffixEdit.toolTip = "The _suffix of the child to iconize";
    this.suffixEdit.onTextUpdated = function()
    {
        IconizeCloneWithSuffixParameters.suffix = this.text;
    };

    this.suffixSizer = new HorizontalSizer;
    this.suffixSizer.spacing = 1;
    this.suffixSizer.add( this.suffixLabel );
    this.suffixSizer.addSpacing( 3 );
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
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

IconizeCloneWithSuffixDialog.prototype = new Dialog;

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
        IconizeCloneWithSuffixParameters.load();

        executeOperation(Parameters.targetView)
        
        return;
    }

    // is script started from an instance in global context
    //
    if (Parameters.isGlobalTarget) 
    {
        // load the parameters from the instance
        //
        IconizeCloneWithSuffixParameters.load();
    }

    // direct context, create and show the dialog
    //
    let dialog = new IconizeCloneWithSuffixDialog;

    dialog.execute();
}

main();
