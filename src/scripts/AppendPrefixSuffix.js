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

#feature-id    AppendPrefixSuffix_<VERSION> : TheAstroShed > Append a prefix or suffix to an image identifier
#feature-info  Add a prefix or suffix to an image identifier.

#include <pjsr/TextAlign.jsh>
#include <pjsr/Sizer.jsh>          // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/UndoFlag.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>

// define a global variable containing script's parameters
var AppendPrefixSuffixParameters = {
    targetView: undefined,
    prefix: "",
    suffix: "",

    // stores the current parameters values into the script instance
    save: function() {
        Parameters.set("prefix", AppendPrefixSuffixParameters.prefix);
        Parameters.set("suffix", AppendPrefixSuffixParameters.suffix);
    },

    // loads the script instance parameters
    load: function() {
        if (Parameters.has("prefix"))
        {
            AppendPrefixSuffixParameters.prefix = Parameters.getString("prefix")
        }
        if (Parameters.has("suffix"))
        {
            AppendPrefixSuffixParameters.suffix = Parameters.getString("suffix")
        }
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
    let undoFlag = UndoFlag_DefaultMode;

    let newId = view.id;
    
    if (prefix !== "")
    {
        newId = prefix + newId;
    }

    if (suffix !== "")
    {
        newId = newId + suffix;
    }
    
    view.id = newId;
}

/*
 * Construct the script dialog interface
 */
function AppendPrefixSuffixDialog() 
{
    this.__base__ = Dialog;
    this.__base__();

    // let the dialog to be resizable by dragging its borders
    this.userResizable = false;

    // set the minimum width of the dialog
    //
    this.scaledMinWidth = 300;
    this.scaledMaxWidth = 300;

    // set the minimum height of the dialog
    //
    this.scaledMinheight = 260;
    this.scaledMaxheight = 260;

    // create a title area
    //
    this.title = new TextBox(this);
    this.title.text = "<b>Append Prefix and/or Suffix</b><br><br>Append a prefix or suffix to the instance ID" +
                    "<br><br><b>Usage:</b>" +
    "<br>Drag a new instance onto your workspace, then drop that Script Process Icon on a single image to rename (This is intended to be used in a set of saved process icons)" ;
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
        AppendPrefixSuffixParameters.save();
        // create the script instance
        this.newInstance();
    };

    this.buttonSizer = new HorizontalSizer;
    this.buttonSizer.margin = 8;
    this.buttonSizer.add(this.newInstanceButton)
    this.buttonSizer.addStretch();

    // Set up the prefix field
    //
    this.prefixLabel = new Label (this);
    this.prefixLabel.text = "Prefix:";
    this.prefixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.prefixEdit = new Edit( this );
    this.prefixEdit.text = AppendPrefixSuffixParameters.prefix;
    this.prefixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.prefixEdit.toolTip = "Text to add to the start of the view name";
    this.prefixEdit.onTextUpdated = function()
    {
        AppendPrefixSuffixParameters.prefix = this.text;
    };

    this.prefixSizer = new HorizontalSizer;
    this.prefixSizer.spacing = 4;
    this.prefixSizer.add( this.prefixLabel );
    this.prefixSizer.addSpacing( 8 );
    this.prefixSizer.add( this.prefixLabel );
    this.prefixSizer.add( this.prefixEdit );
    this.prefixSizer.addStretch();

    // Set up the suffix field
    //
    this.suffixLabel = new Label (this);
    this.suffixLabel.text = "Suffix:";
    this.suffixLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;

    this.suffixEdit = new Edit( this );
    this.suffixEdit.text = AppendPrefixSuffixParameters.suffix;
    this.suffixEdit.setScaledFixedWidth( this.font.width( "MMMMMMMMMMMMMMMM" ) );
    this.suffixEdit.toolTip = "Text to add to the start of the view name";
    this.suffixEdit.onTextUpdated = function()
    {
        AppendPrefixSuffixParameters.suffix = this.text;
    };

    this.suffixSizer = new HorizontalSizer;
    this.suffixSizer.spacing = 4;
    this.suffixSizer.add( this.suffixLabel );
    this.suffixSizer.addSpacing( 8 );
    this.suffixSizer.add( this.suffixLabel );
    this.suffixSizer.add( this.suffixEdit );
    this.suffixSizer.addStretch();


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
    this.sizer.add(this.buttonSizer);
    this.sizer.addStretch();
}

AppendPrefixSuffixDialog.prototype = new Dialog;

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
        AppendPrefixSuffixParameters.load();
        renameView(Parameters.targetView, AppendPrefixSuffixParameters.prefix, AppendPrefixSuffixParameters.suffix);

        return;
    }

    // is script started from an instance in global context
    //
    if (Parameters.isGlobalTarget) 
    {
        // load the parameters from the instance
        //
        AppendPrefixSuffixParameters.load();
    }

    // direct contect, create and show the dialog
    //
    let dialog = new AppendPrefixSuffixDialog;

    dialog.execute();
}

main();
