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
            let localWS = null;
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
                
                //Local sent LocalDescription
                case 'LocalDescription':
                    ws.localDescription = obj.value;
                    break;
                
                //Remote sent RemoteDescription
                case 'RemoteDescription':
                    ws.remoteDescription = obj.value;
                    localWS = findLocalWebsocket(ws.randomCode);
                    if(localWS != null)
                    {
                        sendDataJSON(localWS, 'RemoteDescription', ws.remoteDescription);
                    }
                    break;
                
                //Remote sent RandomCode:
                case 'RandomCode':
                    localWS = findLocalWebsocket(obj.value);
                    if(localWS != null)
                    {
                        if(localWS.localDescription != '')
                        {
                            sendDataJSON(ws, 'LocalDescription', localWS.localDescription);
                            ws.randomCode = obj.value;
                        }
                        else
                        {
                            sendDataJSON(ws, 'WrongRandomCode', '');
                        }
                    }
                    else
                    {
                        sendDataJSON(ws, 'WrongRandomCode', '');
                    }
                    break;
                
            }
        } catch(err) {
            console.log(err.message);
        }
    });

    ws.on('close', function message(data) {
        console.log('====================');
        console.log('closed: %s', data);
        removeObjInArray(listWS, ws);
        console.log('listWS length: ' + listWS.length);
        console.log('Detail connection closed: ');
        console.log('TypeConnection: ' + ws.TypeConnection);
        console.log('====================');
    });
});

function generateRandomCode()
{
    //Returns a random integer between 100 000 -> 999 999
    let randomCode = Math.floor(Math.random() * 1000000);
    if(randomCode < 100000)
    {
        randomCode = 1000000 - randomCode;
    }
    return randomCode;
}

function sendDataJSON(websocket, type, value)
{
    let obj = {};
    obj.typeData = type;
    obj.value = value;
    let objString = JSON.stringify(obj);
    websocket.send(objString);
}

function removeObjInArray(arr, obj)
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

function findLocalWebsocket(randomCode)
{
    for(let i = 0; i < listWS.length; i++)
    {
        if(listWS[i].TypeConnection == 'Local' && listWS[i].randomCode == randomCode)
        {
            // console.log("Two random code is same");
            return listWS[i];
        }
    }
    return null;
}

console.log((new Date()) + " Server is listenning on port " + PORT);
