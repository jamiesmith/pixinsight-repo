# theAstroShed's PixInsight Repo

Repository for PixInsight scripts and utilities.

To use, add this to PixInsight's repository manager:
`https://raw.githubusercontent.com/jamiesmith/pixinsight-repo/main/`

Note: Don't omit the ending `/` or you will likely get a `400` or `404` return code

## Blog Post
To see some detailed instructions for how to use these scripts, see the related blog post, 
[Image processing: PixInsight scripts from theAstroShed](https://www.theastroshed.com/image-processing-with-pixinsight-scripts-from-theastroshed/)

## theAstroShed's Process Icons

If you want to see (or use) the same process icons that I do, check out 
[theAstroShed's PixInsight process icons](https://github.com/jamiesmith/pixinsight-icons). 
If you just want a small set to see how I use these scripts you can download
this [example set](https://raw.githubusercontent.com/jamiesmith/pixinsight-icons/refs/heads/main/theAstroShedScripts.xpsm) from the above repo (right click and "save as" or "download linked file")

If you want to see some of my (few) images, check out my page on
[Astrobin](http://www.astrobin.com/users/jamiesmithnc/), and if you
want to read a little more about the gear, trials, and tribulations, 
you can check out my blog on [theAstroShed](https://www.theastroshed.com/).

## Scripts Overview
### Fix Tiled Zoom

I like to tile my calibrated and integrated master frames, then stretch and zoom
them to fit the window.  If you check the "automatic zoom calculation" checkbox
it will try to find the zoom that works best for _each window_

Additionally, it will do an STF auto stretch on each window.

If you save a process icon you can drop it onto one window and it will work
globally

### Smart Rename View

This script simply renames the main view of an image to match whatever is in the
filter, which allows you to hardcode values in your process icons (For example,
Red, Green, and Blue) rather than having to manually change them.

You can set a prefix and suffix, for example `foo_` and `_bar`, and the resulting
view name would be `foo_<filter>_bar`, or `foo_Red_bar`.
    
If you click the `Batch-mode cheat enabled` and save a process icon it will apply to
_all_ image windows rather than just the one you drop it on (kind of like a global apply)

### Append Prefix or Suffix

My workflow has changed, and I often end up with SHO & RGB workflows open at the
same time, so I can't just rename something to `starless`. I found myself
manually editing the image identifier to append `starless` (like,
`SHO_starless`). I figured it would be nice to have a way to just append a
`_starless` suffix. I further figured, hey, I might want a prefix as well, and I
figured that I might as well make it configurable.

This is designed to be saved off in a process icon set that you reload (mine are
[here](https://github.com/jamiesmith/astrophotography/tree/master/PixInsight),
the RGB & SHO workflows). Launch the script, configure what you want the prefix
and/or suffix to be, then drag and drop that icon on the image you want to
change. You can have multiple different instances to match your workflow.

The bonus is that using consistent names make later steps (saved pixelmath
scripts) easier, because the files always have the same name.

## Release History

- TheAstroShedScripts-2024-11-05-1.zip
    - Moved to the new, shorter repo
- TheAstroShedScripts-2024-10-29.zip
    - Added the AppendPrefixSuffix script
- TheAstroShedScripts-2024-06-29.zip
    - Fixed an issue for SmartRename of files without filters, leaving the view named "null"
- TheAstroShedScripts-2024-06-21-4
    - Initial Revision