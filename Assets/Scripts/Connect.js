#pragma strict
#pragma implicit
#pragma downcast

var connectToIP : String = "127.0.0.1";
var connectPort : int = 25001;
var maxplayers : int = 32;

function OnGUI() {
	if (Network.peerType==NetworkPeerType.Disconnected)
	{
		GUILayout.Label("Connection status: Disconnected");
		connectToIP = GUILayout.TextField(connectToIP,GUILayout.MinWidth(100));
		connectPort = parseInt(GUILayout.TextField(connectPort.ToString()));
		maxplayers = parseInt(GUILayout.TextField(maxplayers.ToString()));
		GUILayout.BeginVertical();
		if (GUILayout.Button("Connect as client"))
		{
			//Network.useNat=!Network.HavePublicAddress;
			Network.Connect(connectToIP, connectPort);
		}
		if (GUILayout.Button("Start server"))
		{
			//Network.useNat=!Network.HavePublicAddress;
			Network.InitializeServer(maxplayers, connectPort, !Network.HavePublicAddress());
		}
		GUILayout.EndVertical();
	}
	else{
		if (Network.peerType==NetworkPeerType.Connecting) {
			GUILayout.Label("Connection status: Connecting");
		}
		else if (Network.peerType==NetworkPeerType.Client) {
			GUILayout.Label("Connection status: Client");
			GUILayout.Label("Ping to server: "+Network.GetAveragePing(  Network.connections[0] ) );
		}
		else if (Network.peerType==NetworkPeerType.Server) {
			GUILayout.Label("Connection status: Server");
			GUILayout.Label("Connections:" +Network.connections.Length);
			if (Network.connections.Length >=1) {
				GUILayout.Label("Ping to server: "+Network.GetAveragePing(  Network.connections[0] ) );
			}
			
		}
		if (GUILayout.Button("Disconnect")) {
			Network.Disconnect(200);
		}
	}
	
	
}

function OnConnectedToServer() {
	Debug.Log("Client connected to server");
}

function OnDisconnectedFromServer(info : NetworkDisconnection) {
	Debug.Log("Client or Server disconnected");
}

function OnFailedToConnect(error : NetworkConnectionError) {
	Debug.Log("Failed to connect to server"+ error);
}

function OnPlayerConnected(player: NetworkPlayer) {
	Debug.Log("Player connected from: " + player.ipAddress + ":" + player.port);
}

function OnServerInitialized() {
	Debug.Log("Server ready");
}

function OnPlayerDisconnected(player: NetworkPlayer) {
	Debug.Log("Player disconnected from: " + player.ipAddress+":" + player.port);
}


function OnFailedToConnectToMasterServer(info: NetworkConnectionError){
	Debug.Log("Could not connect to master server: "+ info);
}

function OnNetworkInstantiate (info : NetworkMessageInfo) {
	Debug.Log("New object instantiated by " + info.sender);
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	//Custom code here (your code!)
}
