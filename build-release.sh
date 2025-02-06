#!/usr/local/bin/bash

shopt -s globstar
# Just setting up some variables
#
scriptsDir="src/scripts"
releasesDir="$(pwd)/"

buildDir=tmpBuild
rm -rf "${buildDir}"
mkdir -p "${buildDir}"
cp -r src "${buildDir}/"
cd "${buildDir}"

# CHANGE THESE, then run the script
# >>>>>>>
#
read -p "Did you change the release notes and version? if so, press enter to continue"
release=v0.2.4
releaseNotes="Make it so views that already contain the filter name don't get overwritten"
#
# <<<<<<<

for file in $(find . -type f -name *.js)
do
    echo "Setting version in: " $file
    sed -i "" "s|<VERSION>|${release}|g" $file
done

pluginName="TheAstroShedScripts"
today=$(date +"%Y-%m-%d")

# figure out if we need a suffix
#
suffix=""
baseZipFileName="${pluginName}-${today}"
if [ -f "${releasesDir}/${baseZipFileName}.zip" ]
then
    suffix="-$(ls "${releasesDir}" | grep -c "${baseZipFileName}")"
    echo "Archive for today already exists, adding a suffix [$suffix]"
fi
zipFileName="${baseZipFileName}${suffix}.zip"

read -p "Sign the scripts in $buildDir, then press enter to continue"

zip -v "${releasesDir}/${zipFileName}" ${scriptsDir}/*
sha1=$(sha1sum ${releasesDir}/${zipFileName} | awk '{print $1}')
echo $sha1

releaseDate=$(echo ${today} | sed 's|-||g')
version="${today}${suffix}"

echo zipFileName is $zipFileName

cat << EOF > $releasesDir/updates.xri
<?xml version="1.0" encoding="UTF-8"?>
<xri version="1.0">
    <description>
        <p>This is the repository for PixInsight scripts by theastroshed.com, featuring "Fixed Tiled Zoom" and "Smart Rename View".</p>
    </description>
    <platform os="all" arch="noarch" version="1.8.8:1.9.9">
        <package fileName="${zipFileName}" 
                sha1="${sha1}" 
                type="script" 
                releaseDate="${releaseDate}">
            <title>
                The Astroshed Plugins version $version 
            </title>
            <description>
                <p>
                    ${version}: ${releaseNotes}
                </p>
            </description>
        </package>
    </platform>
</xri>
EOF

read -p "Sign the updates.xri, then press enter to continue"

# echo "Don't forget to sign the updates file!"
