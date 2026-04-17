#!/opt/homebrew/bin/bash

### #!/usr/local/bin/bash

shopt -s globstar
# Just setting up some variables
#
engine=v8
scriptsDir="src/scripts"
releasesDir="$(pwd)/"

buildDir="$(pwd)/tmpBuild"
rm -rf "${buildDir}"
mkdir -p "${buildDir}"
cp -r ${engine}/src "${buildDir}/"
cd "${buildDir}"

# CHANGE THESE, then run the script
# >>>>>>>
#
read -p "Did you change the release notes and version? if so, press enter to continue"
release=v0.4.0
releaseNotes="Switching to the V8 runtime"
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
baseZipFileName="${pluginName}-${engine}-${today}"
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
		<p>This is the repository for PixInsight scripts by theastroshed.com, featuring &quot;Fixed Tiled Zoom&quot; and &quot;Smart Rename View&quot;.</p>
	</description>
    <platform os="all" arch="noarch" version="1.9.4:1.9.4">
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
	<platform os="all" arch="noarch" version="1.8.8:1.9.3">
		<package fileName="TheAstroShedScripts-2026-04-17.zip" sha1="a821617257902f4bfd3070896734b96b5d15c457" type="script" releaseDate="20260417">
			<title>
                The Astroshed Plugins version 2026-04-17 
			</title>
			<description>
				<p>
                    2026-04-17: Need them both to work
                </p>
			</description>
		</package>
	</platform>
</xri>
EOF

read -p "Sign the updates.xri, then press enter to continue"

# echo "Don't forget to sign the updates file!"
