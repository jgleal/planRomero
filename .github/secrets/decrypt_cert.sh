#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_CERTIFICATE_ENCRYPT" --output ./.github/secrets/profile.mobileprovision ./.github/secrets/profile.mobileprovision.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_CERTIFICATE_ENCRYPT" --output ./.github/secrets/Certificate.p12 ./.github/secrets/Certificate.p12.gpg

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp ./.github/secrets/profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/1aabf9a5-1ea1-496e-a022-16ccbe02755a.mobileprovision


security create-keychain -p "" build.keychain
security import ./.github/secrets/Certificate.p12 -t agg -k ~/Library/Keychains/build.keychain -P "$IOS_CERTIFICATE_PASS" -A

security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain

