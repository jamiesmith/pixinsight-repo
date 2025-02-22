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

#feature-id    SmartRenameView_<VERSION> : TheAstroShed > Smart Rename View as Filter
#feature-info  This script renames the target view after the filter name

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>

// define a global variable containing script's parameters
var SmartRenameViewParameters = {
    targetView: undefined,
    prefix: "",
    suffix: "",
    batchMode: false,

    // stores the current parameters values into the script instance
    save: function() {
        Parameters.set("prefix", SmartRenameViewParameters.prefix);
        Parameters.set("suffix", SmartRenameViewParameters.suffix);
        Parameters.set("batchMode", SmartRenameViewParameters.batchMode);
        
    },

    // loads the script instance parameters
    load: function() {
        if (Parameters.has("prefix"))
        {
            SmartRenameViewParameters.prefix = Parameters.getString("prefix")
        }
        if (Parameters.has("suffix"))
        {
            SmartRenameViewParameters.suffix = Parameters.getString("suffix")
        }
        
        if (Parameters.has("batchMode"))
        {
            SmartRenameViewParameters.batchMode = Parameters.getBoolean("batchMode");
        }
        
    }
}

function applyGlobally()
{
    var vl = new getAllMainViews();

    for (var i = 0; i < vl.length; i++)
    {
        renameView(vl[i], SmartRenameViewParameters.prefix, SmartRenameViewParameters.suffix);            
    }
}

function keywordValue( window, name )
{
   let keywords = window.keywords;
   for ( let i = 0; i < keywords.length; ++i )
      if ( keywords[i].name == name )
         return keywords[i].strippedValue;
   return null;
}

function renameView(view, prefix = "", suffix = "") 
{
    var filterName = keywordValue(view.window, "FILTER");
    // Only make the change if the filter name is not blank
    // AND the view ID doesnt start with the filter name
    //
    if (filterName && filterName != "")        
    {
        if (view.id.indexOf(filterName) != 0)
        {
            let undoFlag = UndoFlag_DefaultMode;
            view.id = prefix + filterName + suffix;
        }
        else
        {
            console.show();
            console.warningln("View ID [" + view.id + "] already starts with filter name [" + filterName + "]");
        }
    }
    else
    {
        console.show();
        console.warningln("Unable to determine filter: " + view.id);
    }    
}

function getAllMainViews()
{
    var mainViews = [];
    var images = ImageWindow.windows;
    for ( var i in images )
    {
        // Skip any that aren't visible (Icons, different workspace, shades, etc)
        //
        if (images[i].mainView.isMainView && images[i].visible && (!images[i].iconic)) {   
            mainViews.push(images[i].mainView);
        }
    }
    return mainViews;
}

/*
 * Construct the script dialog interface
 */
function SmartRenameViewDialog() 
{
    this.__base__ = Dialog;
    this.__base__();

    // let the dialog to be resizable by dragging its borders
    this.userResizable = false;

    // set the minimum width of the dialog
    //
    this.scaledMinWidth = 340;
    this.scaledMaxWidth = 340;

    // set the minimum width of the dialog
    //
    this.scaledMinheight = 300;
    this.scaledMaxheight = 300;

    // create a title area
    //
    this.title = new TextBox(this);
    this.title.text = "<b>Smart Rename View</b><br><br>Rename the view based on the filter" +
                    "<br><br>don't forget delimiters if you use prefix and/or suffix " +
                    "<br><br><b>Usage:</b>" +
                    "<br> - Drag a new instance onto your workspace, then drop that Script Process Icon on a single image to rename" +
                    "<br> - Select a view in the dropdown and 'Apply' (square)" +
                    "<br> - To apply to ALL windows hit 'Apply Global' (circle)";
    ;
    this.title.readOnly = true;
    this.title.backroundColor = 0x333333ff;
    this.title.minHeight = 180;
    this.title.maxHeight = 180;

    // add a view picker
    //
    this.viewList = new ViewList(this);
    this.viewList.getAll();
    SmartRenameViewParameters.targetView = this.viewList.currentView;
    this.viewList.onViewSelected = function (view) {
        SmartRenameViewParameters.targetView = view;
    }

    this.applyButton = new ToolButton( this );
    this.applyButton.icon = this.scaledResource( ":/process-interface/apply.png" );
    this.applyButton.setScaledFixedSize( 24, 24 );
    this.applyButton.toolTip = "Execute against selected view";
    this.applyButton.onMousePress = () => {
        // this.ok();
        if (SmartRenameViewParameters.targetView && SmartRenameViewParameters.targetView.id) 
        {
            renameView(SmartRenameViewParameters.targetView, SmartRenameViewParameters.prefix, SmartRenameViewParameters.suffix);
        } 
        else 
        {
            console.show();
            console.warningln("No target view is specified ");
        }        
    };

    // Add create instance button
    //
    this.newInstanceButton = new ToolButton( this );
    this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
    this.newInstanceButton.setScaledFixedSize( 24, 24 );
    this.newInstanceButton.toolTip = "Save Instance";
    this.newInstanceButton.onMousePress = () => {
        // stores the parameters
        SmartRenameViewParameters.save();
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
            renameView(vl[i], SmartRenameViewParameters.prefix, SmartRenameViewParameters.suffix);            
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

    // Set up the prefix field
    //
    this.prefixLabel = new Label (this);
    this.prefixLabel.text = "Prefix:";
    this.prefixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.prefixEdit = new Edit( this );
    this.prefixEdit.text = SmartRenameViewParameters.prefix;
    this.prefixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.prefixEdit.toolTip = "Text to add to the start of the view name";
    this.prefixEdit.onTextUpdated = function()
    {
        SmartRenameViewParameters.prefix = this.text;
    };

    this.prefixSizer = new HorizontalSizer;
    this.prefixSizer.spacing = 4;
    this.prefixSizer.add( this.prefixLabel );
    this.prefixSizer.addSpacing( 8 );
    this.prefixSizer.add( this.prefixEdit );
    this.prefixSizer.addStretch();

    // Set up the suffix field
    //
    this.suffixLabel = new Label (this);
    this.suffixLabel.text = "Suffix:";
    this.suffixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.suffixEdit = new Edit( this );
    this.suffixEdit.text = SmartRenameViewParameters.suffix;
    this.suffixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.suffixEdit.toolTip = "Text to add to the start of the view name";
    this.suffixEdit.onTextUpdated = function()
    {
        SmartRenameViewParameters.suffix = this.text;
    };

    this.suffixSizer = new HorizontalSizer;
    this.suffixSizer.spacing = 4;
    this.suffixSizer.add( this.suffixLabel );
    this.suffixSizer.addSpacing( 8 );
    this.suffixSizer.add( this.suffixEdit );
    this.suffixSizer.addStretch();

    this.batchModeCheckBox = new CheckBox( this );
    this.batchModeCheckBox.text = "Batch-mode cheat enabled";
    this.batchModeCheckBox.toolTip = "<p>When enabled you can drag the process icon on an image to do all</p>";
    this.batchModeCheckBox.checked = SmartRenameViewParameters.batchMode == true;
    this.batchModeCheckBox.onCheck = function( checked )
    {
        SmartRenameViewParameters.batchMode = checked;
    };

    this.batchModeSizer = new HorizontalSizer;
    // this.batchModeSizer.addUnscaledSpacing( labelWidth1 + this.logicalPixelsToPhysical( 4 ) );
    this.batchModeSizer.add( this.batchModeCheckBox );
    this.batchModeSizer.addStretch();

    // layout the dialog
    //
    this.sizer = new VerticalSizer;
    this.sizer.margin = 8;
    this.sizer.add(this.title);
    this.sizer.addSpacing(8);
    this.sizer.add(this.prefixSizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.suffixSizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.batchModeSizer);
    this.sizer.addSpacing(8);
    this.sizer.add(this.viewList);
    this.sizer.addSpacing(8);
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

SmartRenameViewDialog.prototype = new Dialog;

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
        SmartRenameViewParameters.load();
        renameView(Parameters.targetView, SmartRenameViewParameters.prefix, SmartRenameViewParameters.suffix);
        if (SmartRenameViewParameters.batchMode)
        {
            applyGlobally();
        }
        return;
    }

    // is script started from an instance in global context
    //
    if (Parameters.isGlobalTarget) 
    {
        // load the parameters from the instance
        SmartRenameViewParameters.load();
    }

    // direct contect, create and show the dialog
    //
    let dialog = new SmartRenameViewDialog;

    dialog.execute();
}

main();
