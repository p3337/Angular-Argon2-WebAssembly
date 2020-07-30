#!/usr/bin/env bash


print()
{
  message=$1
  echo -e "\e[32m$message\e[0m\n"
}

if [ ! -d argon2 ]; then
    print "Downloading the reference C implementation of Argon2..."

    wget https://github.com/P-H-C/phc-winner-argon2/archive/master.tar.gz
    mkdir argon2
    tar -zxf master.tar.gz
    mv phc-winner-argon2-master/* argon2
    rm master.tar.gz
    rm -rf phc-winner-argon2-master
fi


print "Creating build folder..."

buildFolder=build
if [ -d "$buildFolder" ]; then
    rm -rf $buildFolder
fi
mkdir $buildFolder
cd $buildFolder


print "Compiling Argon2 WASM file..."

emcmake cmake \
    -DCMAKE_VERBOSE_MAKEFILE=OFF \
    -DCMAKE_BUILD_TYPE=MinSizeRel \
    -DCMAKE_C_FLAGS="-O3" \
    ../
emmake make -j9

print "\nEncoding binary WASM file to Base64 string..."

echo -en "export const wasmBinaryBase64 =\"" > ./generated/argon2.ts
base64 ./generated/argon2.wasm | tr -d "\n" >> ./generated/argon2.ts
echo -en "\";\n" >> ./generated/argon2.ts
rm ./generated/argon2.wasm

print "Done."
