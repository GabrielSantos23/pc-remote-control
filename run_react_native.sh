#!/bin/bash
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.15.2
# Monorepo pathing: move into the app folder before starting
cd ~/src/pc-remote-control/apps/native
~/.bun/bin/bun expo start --lan --ios
