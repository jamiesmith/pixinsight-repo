#!/usr/local/bin/bash

shopt -s globstar

scriptsDir="src/scripts"
releasesDir="$(pwd)/"

buildDir=tmpBuild
rm -rf "${buildDir}"
mkdir -p "${buildDir}"
cp -r src "${buildDir}/"
cd "${buildDir}"

# CHANGE THIS, then run the script
#
release=v0.1.13

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

read -p "Sign the scripts, then press enter to continue"

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
                    ${version}: Skip any that aren't visible (Icons, different workspace, shades, etc)
                </p>
            </description>
        </package>
    </platform>
</xri>
EOF

# echo "Don't forget to sign the updates file!"
