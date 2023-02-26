echo "Enter name of target folder path for the published application: "

read -r path

echo "Enter target SQL Server instance that is hosting the GoatSlips db: "
read -r server

echo "Enter the name of the GoatSlips db: "
read -r db

echo "Enter the full url of the website where GoatSlips will be hosted (ie. \"https://localhost\"): "
read -r url

echo "Enter the application name for the site where GoatSlips will be hosted (ie. \"/GoatSlips\"): "
read -r pubUrl

# Replace the .env file so that it points to the app URL.
envPath=$PWD/src/GoatSlips/Client/.env
envContent=$(cat $envPath)
rm -f -- $envPath
echo -e "REACT_APP_API_ENDPOINT=$url\nPUBLIC_URL=$pubUrl" > $envPath

basePath=$PWD/src/GoatSlips/bin/Release/net6.0/publish

# Remove the publish folder
if [ -d "$basePath" ]; then
   rm -rf "$basePath"
fi

# Publish
dotnet publish src/GoatSlips/GoatSlips.csproj --configuration Release

# Revert the change to .env
rm -f -- $envPath
echo $envContent > $envPath

# Remove the appsettings.Development.json file
rm -f -- $basePath/appsettings.Development.json

# Create the connection string and replace it in the published appsettings.json
connectionString="Server=$server;Database=$db;Trusted_Connection=True"
connectionString=${connectionString//\\/\\\\}
toReplace="<CONNECTION_STRING>"
sed -i "s/${toReplace}/${connectionString}/g" $basePath/appsettings.json

# Clear target directory
rm -rf -- "$path/"*

# Copy all published files to the target path
for FILE in $basePath/*
do
    name=$(basename "$FILE")
    extension="${bname##*.}"
    filenameNoExtension="${bname%.*}"
    newFilename="${filenameNoExtension}.${extension}"
    cp -r ${FILE} ${path}/${newFilename}
done

echo "Successfully published GoatSlips to \"$path\""