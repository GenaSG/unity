
#pragma strict
#pragma implicit
#pragma downcast

enum RotAxes { MouseXAndY = 0, MouseX = 1, MouseY = 2 }
public var sensX : float= 15;
public var sensY : float= 15;
public var axes : RotAxes = RotAxes.MouseXAndY;
public var minY : float= -60;
public var maxY : float= 60;
public var minX : float= -360;
public var maxX : float= 360;
var ClientRotY : float = 0;
var ClientRotX : float= 0;
var lastClientRotY : float = 0;
var lastClientRotX : float= 0;
var ServerCurrentRotY : float = 0;
var ServerCurrentRotX : float= 0;
public var owner : NetworkPlayer;
public var newOwner : NetworkPlayer;
var oldRot : Quaternion;

@RPC
function SetPlayerML(player : NetworkPlayer){
   // Debug.Log("Setting the owner.");
    owner = player;
    Debug.Log("Debug player MouseLook=" + owner);
    if(player == Network.player){
        //So it just so happens that WE are the player in question,
        //which means we can enable this control again
        enabled=true;
    }
    else {
        //Disable a bunch of other things here that are not interesting:
        if (GetComponent(Camera)) {
            GetComponent(Camera).enabled = false;
        }
        
        if (GetComponent(AudioListener)) {
            GetComponent(AudioListener).enabled = false;
        }
        
        if (GetComponent(GUILayer)) {
            GetComponent(GUILayer).enabled = false;
        }
    }
}

function Update (){	
	if(owner!=null && Network.player==owner){//client
	
		switch (axes){
		case RotAxes.MouseXAndY:
		//client
			ClientRotX += Input.GetAxis("Mouse X") * sensX;
			ClientRotY += Input.GetAxis("Mouse Y") * sensY;
			ClientRotX = ClampAngle (ClientRotX , minX, maxX);
			ClientRotY = ClampAngle (ClientRotY, minY, maxY);
		break;
		case RotAxes.MouseX:
		//client
			ClientRotX += Input.GetAxis("Mouse X") * sensX;
			ClientRotX = ClampAngle (ClientRotX , minX, maxX);
		break;
		case RotAxes.MouseY:
		//client
			ClientRotY += Input.GetAxis("Mouse Y") * sensY;
			ClientRotY = ClampAngle (ClientRotY, minY, maxY);
		break;
		default:
		break;			
		}
		//Is our input different? Do we need to update the server?
		if(lastClientRotY!=ClientRotY || lastClientRotX!=ClientRotX ){
			lastClientRotY = ClientRotY;
			lastClientRotX = ClientRotX;			
			
			if(Network.isServer){
				//Too bad a server can't send an rpc to itself using "RPCMode.Server"!...bugged :[
				SendRotationInput(ClientRotY, ClientRotX);
			}else if(Network.isClient){
				//SendMovementInput(HInput, VInput); //Use this (and line 64) for simple "prediction"
				networkView.RPC("SendRotationInput", RPCMode.Server, ClientRotY, ClientRotX);
			}
		}
	}
	if(Network.isServer){//server
		var yQuaternion : Quaternion;
		var xQuaternion : Quaternion;
		switch (axes){
			case RotAxes.MouseXAndY:
				//server
				xQuaternion = Quaternion.AngleAxis (ServerCurrentRotX, Vector3.up);
				yQuaternion = Quaternion.AngleAxis (ServerCurrentRotY, Vector3.left);
				transform.localRotation = oldRot * xQuaternion * yQuaternion;
			break;
			case RotAxes.MouseX:
				//server	
				xQuaternion  = Quaternion.AngleAxis (ServerCurrentRotX, Vector3.up);
				transform.localRotation = oldRot * xQuaternion;
			break;
			case RotAxes.MouseY:
				//server
				yQuaternion = Quaternion.AngleAxis (ServerCurrentRotY, Vector3.left);
				transform.localRotation = oldRot * yQuaternion;
			break;
			default:
			break;
		}
	}
}

@RPC
function SendRotationInput(rotYInput : float, rotXInput : float){	
	//Called on the server
	ServerCurrentRotY  = rotYInput;
	ServerCurrentRotX  = rotXInput;
}
			
function Start (){
	// Make the rigid body not change rotation
	if (rigidbody){
		rigidbody.freezeRotation = true;
	}
	oldRot = transform.localRotation;
}
	
static function ClampAngle ( angle : float,  min : float, max :  float) : float{
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	if (stream.isWriting){
		//This is executed on the owner of the networkview
		//The owner sends it's position over the network
		
		var rot : Quaternion = transform.localRotation;		
		stream.Serialize(rot);//"Encode" it, and send it
				
	}else{
		//Executed on all non-owners
		//This client receive a position and set the object to it
		
		var rotReceive : Quaternion;
		stream.Serialize(rotReceive); //"Decode" it and receive it
		
		//We've just recieved the current servers position of this object in 'posReceive'.
		//transform.localRotation=rotReceive;
		transform.localRotation=rotReceive.Lerp(transform.localRotation, rotReceive, 0.5);
		//transform.position = posReceive;		
		//To reduce laggy movement a bit you could comment the line above and use position lerping below instead:	
		//transform.position = Vector3.Lerp(transform.position, posReceive, 0.7); //"lerp" to the posReceive by 90%
		
	}
}
