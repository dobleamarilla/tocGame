#!/bin/bash

exec 200>/run/lock/tocgame # lock en handle 200

flock -n 200 || exit 1   # intentar lock de 200, si no se puede, salir

echo $$ >&200            # PID en fichero lock

~/tocGame/tocGame # program a arrancar