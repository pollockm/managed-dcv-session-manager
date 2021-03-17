import json
import boto3
import os

kms = boto3.client('kms')

def lambda_handler(event, context):
    '''
    payload required: 
        :param string username: username used to log in the DCV Server
        :param string sessionId: session ID - for Windows always 1
        :param string clientAddress: IP address of the client connecting to the DCV Server
        :param 
    '''
    
    # TODO: add code that updates DDB in order to keep track what sesssions are ON or OFF
    # add instance-id and a field "on/off" for the session in DDB. The lambda called by automation doc would update that field
    # maybe even add something in the DCV server that updates the DDB right when the session starts 
    username = event['queryStringParameters']['username']
    authToken = event['queryStringParameters']['authenticationToken']
    sessionId = event['queryStringParameters']['sessionId']
    clientIp = event['queryStringParameters']['clientAddress']
    key = os.environ['DCV_KEY']
    
    print(username, authToken, sessionId, clientIp)
    
    #cycled_plaintext, decrypted_header = aws_encryption_sdk.decrypt(
    #    source=authToken,
    #    key_provider=key
    #)
    
    # this routine mocks verifying if a user exists
    # you could consult an external DB, or even Cognito IdP using SAML federeation
    if username == 'paragao' and (passcode == key) :
        xml_response = '<auth result="yes"><username>' + username + '</username></auth>'
    else:
        xml_response = '<auth result="no"/>'
        
    return {
        'statusCode': 200,
        'body': xml_response
    } 
