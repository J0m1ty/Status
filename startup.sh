#!/bin/bash
SCREEN_NAME="status"

# change working directory to file location if not done yet
if [[ "${0%/*}" != "." ]] ; then
    cd "${0%/*}"
fi
#------------------------------------------------

start_server() {
    echo "Starting..."
    sudo screen -dmUS $SCREEN_NAME sudo npm run start
}

stop_server() {
    echo "Stopping..."
    screen -S $SCREEN_NAME -X quit
}

restart_server() {
    stop_server
    sleep 5
    start_server
}

attach_server() {
    echo "Attaching..."
    screen -d -r $SCREEN_NAME
}

#------------------------------------------------

if [[ $1 == "start" ]] ; then
    start_server
elif [[ $1 == "stop" ]] ; then
    stop_server
elif [[ $1 == "restart" ]] ; then
    restart_server
elif [[ $1 == "attach" ]] ; then
    attach_server
else 
    printf "Helper startup script"
    printf "\n"
fi