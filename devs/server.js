//import { WebSocketServer } from 'ws';
const WebSocket = require('ws');

const PORT = 5000;

//const wsServer = new WebSocketServer({port: PORT});
const wss = new WebSocket.Server({
    port: PORT
});

var listWS = [];

wss.on('connection', function connection(ws) {
    listWS.push(ws);
    console.log('New connection ' + listWS.length);

    ws.on('message', function message(data) {
        var dataString = data.toString();
        console.log('dataString: ', dataString);
        try
        {
            const obj = JSON.parse(dataString);
            switch(obj.typeData)
            {
                case 'LocalOrRemote':
                    ws.TypeConnection = obj.value;
                    if(ws.TypeConnection == 'Local')
                    {
                        ws.randomCode = '' + generateRandomCode();
                        sendDataJSON(ws, 'RandomCode', ws.randomCode);
                    }
                    break;
                case 'LocalDescription':
                    ws.localDescription = obj.value;
                    break;
                case 'RemoteDescription':
                    ws.remoteDescription = obj.value;
                    break;
            }
        } catch(err) {
            console.log(err.message);
        }
    });

    ws.on('close', function message(data) {
        console.log('====================');
        console.log('closed: %s', data);
        RemoveObjInArray(listWS, ws);
        console.log('listWS length: ' + listWS.length);
        console.log('Detail connection closed: ');
        console.log('TypeConnection: ' + ws.TypeConnection);
        console.log('localDescription: ' + ws.localDescription);
        console.log('====================');
    });
});

function generateRandomCode()
{
    //Returns a random integer between 100 000 -> 999 999
    return Math.floor(Math.random() * 1000000);
}

function sendDataJSON(websocket, type, value)
{
    let obj = {};
    obj.typeData = type;
    obj.value = value;
    let objString = JSON.stringify(obj);
    websocket.send(objString);
}

function RemoveObjInArray(arr, obj)
{
    let index = -1;
    for(let i = 0; i < arr.length; i++)
    {
        if(arr[i] == obj)
        {
            index = i;
            break;
        }
    }
    if(index != -1)
    {
        arr.splice(index, 1);
    }
}

console.log((new Date()) + " Server is listenning on port " + PORT);
