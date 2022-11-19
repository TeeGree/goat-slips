echo "Enter name of target folder path for the published application: "

read -r path

echo "Enter secret string that will be used to sign the JWT security token. It must be at least 25 characters long: "
read -r secret
while [ ${#secret} -lt 25 ]
do
    echo "Secret must be at least 25 characters! Enter the secret key: "
    read -r secret
done

echo "Enter target SQL Server instance that is hosting the GoatSlips db: "
read -r server

echo "Enter the name of the GoatSlips db: "
read -r db

echo "Enter the full url of the website where GoatSlips will be hosted (ie \"https://localhost\"): "
read -r url

# Replace the .env file so that it points to the app URL.
envPath=$PWD/src/GoatSlips/Client/.env
envContent=$(cat $envPath)
rm -f -- $envPath
echo "REACT_APP_API_ENDPOINT=$url" > $envPath

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

# Replace the secret text in the published appsettings.json
toReplace="<SECRET>"
sed -i "s/${toReplace}/${secret}/g" $basePath/appsettings.json

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