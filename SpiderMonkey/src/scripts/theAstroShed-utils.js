/* PURPOSE
   LICENSE
   Copyright (C) 2025 Jamie Smith.

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

function cloneView(sourceView, newViewId)
{
    // Based on the cloneView() found in CosmicPhoton's 'StarReductionEngine'
    //
    let inIW = sourceView.window;
    let w = Math.max(1, sourceView.image.width);
    let h = Math.max(1, sourceView.image.height);
    let isColor = sourceView.image.isColor;
    let bps = sourceView.image.bitsPerSample;
    let isFS = sourceView.image.isReal;
    let channelCount = isColor ? 3 : 1;
    let outIW = new ImageWindow(w, h, channelCount, bps, isFS, isColor, newViewId);
    let newView = outIW.mainView;
    newView.beginProcess(UndoFlag_NoSwapFile);
    newView.image.apply(sourceView.image);
    newView.endProcess();
    outIW.maskEnabled = sourceView.window.maskEnabled;
    outIW.maskInverted = sourceView.window.maskInverted;
    outIW.maskVisible = sourceView.window.maskVisible;
    outIW.mask = sourceView.window.mask;
    
    // Copy FITS headers and Properties
    //
    newView.window.mainView.window.keywords = sourceView.window.mainView.window.keywords;
    // There might be an easier way to do this, but I can't find it
    //
    for ( let i = 0; i < sourceView.properties.length; ++i )
    {
        let propertyName = sourceView.properties[i];
        try
        {
            // Some properties are reserved (MAD, median), ignore those failures
            //
            newView.setPropertyValue(propertyName, sourceView.propertyValue(propertyName));            
        }
        catch (err) 
        {
        }
    }
    newView.window.show();
    return newView;
}

function copyAstrometricSolution(source, target)
{
    try 
    {
        target.window.copyAstrometricSolution( source.window );
    }
    catch (err) 
    {
        console.warningln(source.id + " doesn't seem to have an astrometric solution")
    }
}

function resampleView(view, ratio)
{
    console.show();

    var P = new Resample;
    // Need to figure these out
    //
    P.xSize = ratio;
    P.ySize = ratio;
    P.mode = Resample.prototype.RelativeDimensions;
    P.absoluteMode = Resample.prototype.ForceWidthAndHeight;
    P.xResolution = 72.000;
    P.yResolution = 72.000;
    P.metric = false;
    P.forceResolution = false;
    P.interpolation = Resample.prototype.Auto;
    P.clampingThreshold = 0.30;
    P.smoothness = 1.50;
    P.gammaCorrection = false;
    P.noGUIMessages = false;

    P.executeOn(view);
}

function getOptimalZoomForWindow(window)
{
    var widthRatio = Math.round(window.mainView.image.bounds.x1 / window.visibleViewportRect.x1 );
    var heightRatio = Math.round(window.mainView.image.bounds.y1 / window.visibleViewportRect.y1 );
    
    var zoom = (widthRatio > heightRatio) ? widthRatio : heightRatio;

    console.writeln(format("WZ - %-8s image [%d,%d] rect [%d,%d] WR [%d] HR [%d] zoom [%d]", 
            window.mainView.id,
            window.mainView.image.bounds.x1,
            window.mainView.image.bounds.y1,
            window.visibleViewportRect.x1,
            window.visibleViewportRect.y1,
            widthRatio, 
            heightRatio, 
            zoom));
            
    return zoom;    
}