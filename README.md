# Unofficial CLI for Pritunl

With support for starting & stopping a VPN connection managed by [the Pritunl app](https://client.pritunl.com/).

## Getting Started

### Requirements

You must have [the Pritunl app](https://client.pritunl.com/) installed with an ovpn profile configured. See caveats below. 

### Install as CLI

`yarn global add pritunlctl`

OR

`npm install --global pritunlctl`

## Usage

```
Usage: pritunlctl <command>

commands:

- start
- stop
- config
- help
```

`start` will prompt you for your OTP code, unless you use `config` to set your Pritunl OTP token on your keychain for auto-generated codes.

## Caveats

* This has only been tested on a MacOS environment with a profile that uses the OTP auth method.
* It assumes you have the Pritunl GUI app installed with a profile already configured.
* This software relies on the filesystem set by the Pritunl app which may be subject to change in future versions.

Verified compatible with these Pritunl client versions:

* `v1.0.2226.23`
* `v1.0.1953.32`
