const localState = {
    none: 0,
    wsConnected: 1,
    webrtcSentLocalDescription: 2,
    webrtcReceivedRemoteDescription: 3,
    webrtcConnected: 4
}

var localInformation = {
    remoteDescription: '',
    randomCode: ''
};
var state = localState.none;

//===================================//
//WebSocket
var ws = new WebSocket("wss://gl-ws-test.glitch.me/");
var wsConnected = false;

ws.onopen = function(e) {
    console.log("trung.lyhoang - local.js - websocket open");
    sendDataJSON(ws, 'LocalOrRemote', 'Local');
    wsConnected = true;
    state = localState.wsConnected;
}

ws.onclose = function(e) {
    console.log("trung.lyhoang - local.js - websocket close");
    wsConnected = false;
    state = localState.none;
    document.getElementById("btnConnect").disabled = false;
}

ws.onmessage = function(e) {
    var data = e.data;
    console.log("trung.lyhoang - local.js - websocket onmessage: " + data);
    try
    {
        const obj = JSON.parse(data);
        switch(state)
        {
            case localState.wsConnected:
                if(obj.typeData == "RandomCode")
                {
                    localInformation.randomCode = obj.value;
                    document.getElementById("txtRandomCode").textContent = obj.value;
                    initLocalWebRTC();
                }
                break;
            case localState.webrtcSentLocalDescription:
                if(obj.typeData == 'RemoteDescription')
                {
                    localInformation.remoteDescription = obj.value;
                    state = localState.webrtcReceivedRemoteDescription;
                    setRemoteDescription();
                }
            break;
        }
    } catch (err) {
        console.log(err.message);
    }
}

function sendLocalDescription()
{
    if(wsConnected == false)
    {
        console.log("trung.lyhoang - websocket fail");
    }
    else
    {
        const connStr = JSON.stringify(localWebRTC.localDescription);
        console.log("trung.lyhoang - local.js - sendLocalDescription - connStr: ", connStr);
        // ws.send(connStr);
        sendDataJSON(ws, 'LocalDescription', connStr);
        state = localState.webrtcSentLocalDescription;
    }
}

function sendDataJSON(websocket, type, value)
{
    let obj = {};
    obj.typeData = type;
    obj.value = value;
    let objString = JSON.stringify(obj);
    websocket.send(objString);
}
//===================================//

//===================================//
//WebRTC
const localWebRTC = new RTCPeerConnection();
function initLocalWebRTC()
{
    localWebRTC.onicecandidate = function (e) {
        if(e.candidate != null)
        {
            const connStr = JSON.stringify(localWebRTC.localDescription);
            console.log("trung.lyhoang - local.js - onicecandidate: ", connStr);
            sendLocalDescription();
            document.getElementById("txtCreate").value = connStr;
        }
        else
        {
            console.log("trung.lyhoang - local.js - onicecandidate, e.candidate = null");
        }
    };

    initDataChannel();

    createOffer();
    
    // localWebRTC.createOffer().then(function (o) {
    //     console.log('trung.lyhoang - local.js - initLocalWebRTC - createOffer success');
    //     localWebRTC.setLocalDescription(o);
    // });
}

var dataChannel = null;
function initDataChannel()
{
    console.log("trung.lyhoang - local.js - initDataChannel");
    dataChannel = localWebRTC.createDataChannel("data_channel");
    dataChannel.onmessage = function (e) {
        console.log("trung.lyhoang - local.js - dataChannel.onmessage: " + e.data);
        document.getElementById("txtData").textContent = e.data;
    };
    dataChannel.onopen = function (e) {
        console.log("trung.lyhoang - local.js - dataChannel.onopen");
        document.getElementById("txtStatus").textContent = "Trạng thái: Open";
        document.getElementById("send").disabled = false;
    };
    dataChannel.onclose = function (e) {
        console.log("trung.lyhoang - local.js - dataChannel.onclose");
        document.getElementById("txtStatus").textContent = "Trạng thái: Close";
        document.getElementById("send").disabled = true;
        document.getElementById("btnConnect").disabled = false;
        state = localState.webrtcSentLocalDescription;
    };
}

function createOffer()
{
    localWebRTC.createOffer().then(function (o) {
        console.log('trung.lyhoang - local.js - initLocalWebRTC - createOffer success');
        localWebRTC.setLocalDescription(o);
    });
}

function setRemoteDescription()
{
    if(localInformation.remoteDescription !== "")
    {
        console.log("trung.lyhoang - local.js - setRemoteDescription - 001");
        document.getElementById("txtAccept").value = localInformation.remoteDescription;
        localWebRTC.setRemoteDescription(JSON.parse(localInformation.remoteDescription)).then(function () {
            console.log("trung.lyhoang - local.js - setRemoteDescription - DONE");
            state = localState.webrtcConnected;
        });
    }
}
//===================================//

document.getElementById("send").disabled = true;
// Send msg
document.getElementById("send").addEventListener("click", (e) => {
    const txtContent = document.getElementById("txtContent");
    if (txtContent.value === "") {
        console.log("chưa nhập");
    } else {
        console.log(txtContent.value);
        dataChannel.send(txtContent.value);
        txtContent.value = "";
    }
});

// Connect button
document.getElementById("btnConnect").disabled = true;
document.getElementById("btnConnect").addEventListener("click", (e) => {
    document.getElementById("btnConnect").disabled = true;
    if(wsConnected == false)
    {
        console.log("trung.lyhoang - websocket begin to start");
        ws = new WebSocket("wss://gl-ws-test.glitch.me/");
    }
    else
    {
        console.log("trung.lyhoang - websocket is connecting");
        initDataChannel();
        createOffer();
        // localWebRTC.createOffer().then(function (o) {
        //     console.log('trung.lyhoang - local.js - initLocalWebRTC - createOffer success');
        //     localWebRTC.setLocalDescription(o);
        // });
    }
});
